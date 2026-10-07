import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Server-side proxy + aggregator for the QA/QC Monitoring Dashboard
 * (public/dashboards/qaqc-monitoring.html). Queries four of SEMA's core
 * IMSMA Core layers for their validation workflow fields and returns
 * per-dataset counts only - never raw records - since the browser only
 * needs the aggregate summary, not ~54k individual rows.
 *
 * Same token-caching pattern as app/api/dashboards/nts-coverage/route.ts;
 * duplicated rather than shared, matching that route's own choice to stay
 * self-contained.
 */

const FIELDS = "org_validation,sema_ops_validation,sema_im_validation,workflow_status";

const DATASETS = [
  { key: "accidents", label: "Accidents", layerUrl: "https://so.imsma.org/server/rest/services/global_services/All_Global/FeatureServer/2" },
  { key: "nts_surveys", label: "NTS Surveys", layerUrl: "https://so.imsma.org/server/rest/services/global_services/All_Global/FeatureServer/6" },
  { key: "eod", label: "EOD", layerUrl: "https://so.imsma.org/server/rest/services/global_services/All_Global/FeatureServer/12" },
  { key: "eore", label: "EORE", layerUrl: "https://so.imsma.org/server/rest/services/global_services/All_Global/FeatureServer/4" },
];

type CachedToken = { token: string; expires: number };
let cachedToken: CachedToken | null = null;

async function getToken(): Promise<string | null> {
  const username = process.env.IMSMA_ARCGIS_USERNAME;
  const password = process.env.IMSMA_ARCGIS_PASSWORD;
  const portalUrl =
    process.env.IMSMA_ARCGIS_PORTAL_URL || "https://so.imsma.org/portal/sharing/rest/generateToken";
  if (!username || !password) return null;

  if (cachedToken && cachedToken.expires - 60_000 > Date.now()) {
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
  const res = await fetch(portalUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    cache: "no-store",
  });
  const data = await res.json();
  if (!data.token) {
    throw new Error(data.error?.message || "IMSMA token request failed");
  }
  cachedToken = { token: data.token, expires: data.expires || Date.now() + expirationMinutes * 60_000 };
  return cachedToken.token;
}

type Attributes = Record<string, string | null>;

async function fetchDataset(layerUrl: string, token: string | null): Promise<Attributes[]> {
  const params = new URLSearchParams({
    f: "json",
    where: "1=1",
    outFields: FIELDS,
    returnGeometry: "false",
    resultRecordCount: "50000",
  });
  if (token) params.set("token", token);

  const res = await fetch(`${layerUrl}/query?${params.toString()}`, { cache: "no-store" });
  const data = await res.json();
  if (data.error) {
    throw new Error(data.error.message || "IMSMA Core query failed");
  }
  return (data.features || []).map((f: { attributes: Attributes }) => f.attributes);
}

function summarize(label: string, rows: Attributes[]) {
  const count = (field: string, value: string) => rows.filter((r) => (r[field] || null) === value).length;
  return {
    label,
    total: rows.length,
    orgApproved: count("org_validation", "approved"),
    orgPending: count("org_validation", "pending"),
    opsApproved: count("sema_ops_validation", "approved"),
    opsPending: count("sema_ops_validation", "pending"),
    imApproved: count("sema_im_validation", "approved"),
    imPending: count("sema_im_validation", "pending"),
    finalised: count("workflow_status", "finalised"),
    submittedOps: count("workflow_status", "submitted_ops"),
  };
}

export async function GET() {
  try {
    const token = await getToken();
    const summaries = await Promise.all(
      DATASETS.map(async (ds) => {
        try {
          const rows = await fetchDataset(ds.layerUrl, token);
          return summarize(ds.label, rows);
        } catch (error) {
          return {
            label: ds.label,
            total: 0,
            orgApproved: 0,
            orgPending: 0,
            opsApproved: 0,
            opsPending: 0,
            imApproved: 0,
            imPending: 0,
            finalised: 0,
            submittedOps: 0,
            error: error instanceof Error ? error.message : "Unknown error",
          };
        }
      }),
    );

    return NextResponse.json({ datasets: summaries });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    );
  }
}
