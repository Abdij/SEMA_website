import {
  getAdminCatalogueDatasets,
  getCatalogueGeoAreas,
  insertCatalogueSyncLog,
  updateCatalogueSyncLog,
  upsertCatalogueStat,
  upsertCatalogueStatusCount,
  upsertCatalogueYearCount,
  type CatalogueGeoArea,
} from "./db";

/**
 * Server-side sync from IMSMA Core's ArcGIS feature services into the
 * sanitized public catalogue tables. IMSMA credentials and layer URLs are
 * read from env vars here only -- never passed to a client component or
 * included in any API response.
 *
 * NOTE: the exact feature-layer URLs and field names below are placeholders
 * (documented as "confirm against real layer schema") until SEMA provides
 * real IMSMA ArcGIS credentials and layer URLs. This module is structurally
 * complete but functionally unverified until then -- see IMSMA_SYNC_CONFIG.
 */

type ImsmaFieldMap = {
  /** Field holding the region name/code on each feature. Confirm against real layer schema. */
  regionField: string;
  /** Field holding the district name/code on each feature. Confirm against real layer schema. */
  districtField: string;
  /** Optional settlement/village field. Confirm against real layer schema. */
  settlementField?: string;
  /** Optional status field (e.g. CHA/SHA open/closed). Confirm against real layer schema. */
  statusField?: string;
  /** Field holding the record's date, used for earliest/latest + year counts. */
  dateField: string;
};

type ImsmaLayerConfig = {
  datasetSlug: string;
  /** Env var name holding this layer's ArcGIS REST feature layer URL. */
  layerUrlEnvVar: string;
  fieldMap: ImsmaFieldMap;
  /** Maps a raw IMSMA status value to one of this dataset's canonical status_options. */
  statusValueMap?: Record<string, string>;
};

export const IMSMA_SYNC_CONFIG: ImsmaLayerConfig[] = [
  {
    datasetSlug: "nts",
    layerUrlEnvVar: "IMSMA_LAYER_URL_NTS",
    fieldMap: { regionField: "Region", districtField: "District", dateField: "Date_Reported" },
  },
  {
    datasetSlug: "hazardous-areas",
    layerUrlEnvVar: "IMSMA_LAYER_URL_HAZARDOUS_AREAS",
    fieldMap: { regionField: "Region", districtField: "District", statusField: "Status", dateField: "Date_Reported" },
    statusValueMap: {
      Confirmed: "cha",
      Suspected: "sha",
      Open: "open",
      Closed: "closed_released_cancelled",
      Released: "closed_released_cancelled",
      Cancelled: "closed_released_cancelled",
    },
  },
  {
    datasetSlug: "accidents",
    layerUrlEnvVar: "IMSMA_LAYER_URL_ACCIDENTS",
    fieldMap: { regionField: "Region", districtField: "District", dateField: "Date_Of_Accident" },
  },
  {
    datasetSlug: "eod",
    layerUrlEnvVar: "IMSMA_LAYER_URL_EOD",
    fieldMap: { regionField: "Region", districtField: "District", dateField: "Date_Reported" },
  },
  {
    datasetSlug: "eore",
    layerUrlEnvVar: "IMSMA_LAYER_URL_EORE",
    fieldMap: { regionField: "Region", districtField: "District", dateField: "Date_Of_Activity" },
  },
  {
    datasetSlug: "clearance",
    layerUrlEnvVar: "IMSMA_LAYER_URL_CLEARANCE",
    fieldMap: { regionField: "Region", districtField: "District", statusField: "Status", dateField: "Date_Completed" },
  },
];

type ArcgisToken = { token: string; expiresAt: number };
let cachedToken: ArcgisToken | undefined;

async function getArcgisToken(): Promise<string> {
  const username = process.env.IMSMA_ARCGIS_USERNAME;
  const password = process.env.IMSMA_ARCGIS_PASSWORD;
  const portalUrl = process.env.IMSMA_ARCGIS_PORTAL_URL || "https://www.arcgis.com/sharing/rest/generateToken";

  if (!username || !password) {
    throw new Error("IMSMA_ARCGIS_USERNAME/IMSMA_ARCGIS_PASSWORD are not configured");
  }

  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) {
    return cachedToken.token;
  }

  const expirationMinutes = Number(process.env.IMSMA_TOKEN_EXPIRATION_MINUTES || "60");
  const body = new URLSearchParams({
    username,
    password,
    referer: "https://sema.org.so",
    f: "json",
    expiration: String(expirationMinutes),
  });

  const response = await fetch(portalUrl, { method: "POST", body });
  if (!response.ok) {
    throw new Error(`ArcGIS token request failed with status ${response.status}`);
  }

  const data = (await response.json()) as { token?: string; expires?: number; error?: { message?: string } };
  if (!data.token) {
    throw new Error(data.error?.message || "ArcGIS token response did not include a token");
  }

  cachedToken = { token: data.token, expiresAt: data.expires || Date.now() + expirationMinutes * 60_000 };
  return cachedToken.token;
}

type ImsmaFeature = { attributes: Record<string, unknown> };

async function queryFeatureLayerPage(
  layerUrl: string,
  outFields: string[],
  resultOffset: number,
  token: string,
): Promise<ImsmaFeature[]> {
  const params = new URLSearchParams({
    where: "1=1",
    outFields: outFields.join(","),
    returnGeometry: "false",
    resultOffset: String(resultOffset),
    resultRecordCount: "2000",
    f: "json",
    token,
  });

  const response = await fetch(`${layerUrl}/query?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`ArcGIS feature query failed with status ${response.status}`);
  }

  const data = (await response.json()) as { features?: ImsmaFeature[]; error?: { message?: string } };
  if (data.error) {
    throw new Error(data.error.message || "ArcGIS feature query returned an error");
  }

  return data.features || [];
}

async function queryAllFeatures(layerUrl: string, outFields: string[], token: string): Promise<ImsmaFeature[]> {
  const all: ImsmaFeature[] = [];
  let offset = 0;

  // ArcGIS REST paginates via resultOffset; stop once a page comes back short.
  while (true) {
    const page = await queryFeatureLayerPage(layerUrl, outFields, offset, token);
    all.push(...page);
    if (page.length < 2000) break;
    offset += page.length;
  }

  return all;
}

type Aggregate = {
  byGeoArea: Map<string, { recordCount: number; earliest?: string; latest?: string; unmatchedNames: Set<string> }>;
  statusByGeoArea: Map<string, Map<string, number>>;
  yearByGeoArea: Map<string, Map<number, number>>;
};

function normalizeName(value: unknown): string {
  return String(value ?? "").trim().toLowerCase();
}

function aggregateFeatures(
  features: ImsmaFeature[],
  fieldMap: ImsmaFieldMap,
  statusValueMap: Record<string, string> | undefined,
  geoAreasByName: Map<string, CatalogueGeoArea>,
): Aggregate {
  const byGeoArea: Aggregate["byGeoArea"] = new Map();
  const statusByGeoArea: Aggregate["statusByGeoArea"] = new Map();
  const yearByGeoArea: Aggregate["yearByGeoArea"] = new Map();

  for (const feature of features) {
    const districtName = normalizeName(feature.attributes[fieldMap.districtField]);
    const regionName = normalizeName(feature.attributes[fieldMap.regionField]);
    const area = geoAreasByName.get(districtName) || geoAreasByName.get(regionName);

    const bucket = byGeoArea.get(area?.id ?? "__unmatched__") || {
      recordCount: 0,
      unmatchedNames: new Set<string>(),
    };
    bucket.recordCount += 1;
    if (!area) {
      bucket.unmatchedNames.add(String(feature.attributes[fieldMap.districtField] ?? feature.attributes[fieldMap.regionField] ?? "unknown"));
    }

    const rawDate = feature.attributes[fieldMap.dateField];
    if (rawDate) {
      const date = new Date(Number(rawDate) || String(rawDate));
      if (!Number.isNaN(date.getTime())) {
        const iso = date.toISOString().split("T")[0];
        if (!bucket.earliest || iso < bucket.earliest) bucket.earliest = iso;
        if (!bucket.latest || iso > bucket.latest) bucket.latest = iso;

        if (area) {
          const yearMap = yearByGeoArea.get(area.id) || new Map<number, number>();
          const year = date.getFullYear();
          yearMap.set(year, (yearMap.get(year) || 0) + 1);
          yearByGeoArea.set(area.id, yearMap);
        }
      }
    }

    if (area) byGeoArea.set(area.id, bucket);

    if (area && fieldMap.statusField) {
      const rawStatus = String(feature.attributes[fieldMap.statusField] ?? "");
      const status = statusValueMap?.[rawStatus] || rawStatus.toLowerCase();
      if (status) {
        const statusMap = statusByGeoArea.get(area.id) || new Map<string, number>();
        statusMap.set(status, (statusMap.get(status) || 0) + 1);
        statusByGeoArea.set(area.id, statusMap);
      }
    }
  }

  return { byGeoArea, statusByGeoArea, yearByGeoArea };
}

async function writeAggregates(datasetId: string, aggregate: Aggregate) {
  for (const [geoAreaId, bucket] of aggregate.byGeoArea.entries()) {
    if (geoAreaId === "__unmatched__") continue;

    await upsertCatalogueStat({
      datasetId,
      geoAreaId,
      recordCount: bucket.recordCount,
      earliestDate: bucket.earliest,
      latestDate: bucket.latest,
      source: "imsma_sync",
    });
  }

  for (const [geoAreaId, statusMap] of aggregate.statusByGeoArea.entries()) {
    for (const [status, count] of statusMap.entries()) {
      await upsertCatalogueStatusCount({ datasetId, geoAreaId, status, count });
    }
  }

  for (const [geoAreaId, yearMap] of aggregate.yearByGeoArea.entries()) {
    for (const [year, count] of yearMap.entries()) {
      await upsertCatalogueYearCount({ datasetId, geoAreaId, year, count });
    }
  }
}

export type ImsmaSyncResult = {
  status: "success" | "partial" | "failed";
  datasetsSynced: string[];
  recordsProcessed: number;
  errorMessage?: string;
  details: Record<string, unknown>;
};

export async function runImsmaSync(options: {
  datasetSlugs?: string[];
  triggeredBy: "admin" | "cron";
}): Promise<ImsmaSyncResult> {
  const log = await insertCatalogueSyncLog(options.triggeredBy);

  const configs = options.datasetSlugs
    ? IMSMA_SYNC_CONFIG.filter((config) => options.datasetSlugs!.includes(config.datasetSlug))
    : IMSMA_SYNC_CONFIG;

  const datasetsSynced: string[] = [];
  let recordsProcessed = 0;
  const unmatched: Record<string, string[]> = {};
  const errors: Record<string, string> = {};

  try {
    const [regions, districts] = await Promise.all([
      getCatalogueGeoAreas("region"),
      getCatalogueGeoAreas("district"),
    ]);
    const geoAreasByName = new Map<string, CatalogueGeoArea>();
    for (const area of [...regions, ...districts]) {
      geoAreasByName.set(normalizeName(area.name), area);
    }

    for (const config of configs) {
      const layerUrl = process.env[config.layerUrlEnvVar];
      if (!layerUrl) {
        errors[config.datasetSlug] = `${config.layerUrlEnvVar} is not configured`;
        continue;
      }

      try {
        const token = await getArcgisToken();
        const outFields = [
          config.fieldMap.regionField,
          config.fieldMap.districtField,
          config.fieldMap.dateField,
          config.fieldMap.statusField,
          config.fieldMap.settlementField,
        ].filter((field): field is string => Boolean(field));

        const features = await queryAllFeatures(layerUrl, outFields, token);
        const aggregate = aggregateFeatures(features, config.fieldMap, config.statusValueMap, geoAreasByName);

        const datasets = await getAdminCatalogueDatasets();
        const dataset = datasets.find((item) => item.slug === config.datasetSlug);
        if (!dataset) {
          errors[config.datasetSlug] = "Dataset not found in catalogue_datasets";
          continue;
        }

        await writeAggregates(dataset.id, aggregate);

        recordsProcessed += features.length;
        datasetsSynced.push(config.datasetSlug);

        const unmatchedBucket = aggregate.byGeoArea.get("__unmatched__");
        if (unmatchedBucket && unmatchedBucket.unmatchedNames.size > 0) {
          unmatched[config.datasetSlug] = Array.from(unmatchedBucket.unmatchedNames).slice(0, 50);
        }
      } catch (error) {
        errors[config.datasetSlug] = error instanceof Error ? error.message : "Unknown sync error";
      }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown sync error";
    await updateCatalogueSyncLog(log.id, {
      status: "failed",
      errorMessage: message,
      finished: true,
    });
    return { status: "failed", datasetsSynced: [], recordsProcessed: 0, errorMessage: message, details: {} };
  }

  const hasErrors = Object.keys(errors).length > 0;
  const status: ImsmaSyncResult["status"] = datasetsSynced.length === 0 ? "failed" : hasErrors ? "partial" : "success";
  const details = { unmatched, errors };

  await updateCatalogueSyncLog(log.id, {
    status,
    datasetsSynced,
    recordsProcessed,
    errorMessage: hasErrors ? Object.entries(errors).map(([slug, message]) => `${slug}: ${message}`).join("; ") : undefined,
    details,
    finished: true,
  });

  return { status, datasetsSynced, recordsProcessed, details };
}

export function getImsmaSyncConfigurationStatus() {
  return {
    portalConfigured: Boolean(process.env.IMSMA_ARCGIS_USERNAME && process.env.IMSMA_ARCGIS_PASSWORD),
    layers: IMSMA_SYNC_CONFIG.map((config) => ({
      datasetSlug: config.datasetSlug,
      layerConfigured: Boolean(process.env[config.layerUrlEnvVar]),
    })),
  };
}
