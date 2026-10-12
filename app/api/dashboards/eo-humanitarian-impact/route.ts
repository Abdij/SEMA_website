import { NextResponse } from "next/server";
import { hasValidDashboardRegistration } from "@/lib/db";
import { getConsentVersion } from "@/lib/analytics-server";

export const dynamic = "force-dynamic";

/**
 * Server-side proxy + aggregator for the EO Humanitarian Impact Dashboard
 * (public/dashboards/eo-humanitarian-impact.html). Built entirely from
 * SEMA's own IMSMA Core data (no external JIAF/HNO/HNRP feed) to show where
 * explosive ordnance contamination intersects with affected population and
 * blocked access to water, agriculture, roads and infrastructure, by
 * district - the case for Protection Cluster / UNOCHA Somalia to factor EO
 * risk into humanitarian prioritization.
 *
 * Gated: unlike the other self-hosted dashboards (public by design), this
 * one is reached through DashboardAccessGate, which only ever reveals the
 * iframe src (this page's own URL) after a visitor registers. Because the
 * page and this API are still same-origin, directly-reachable resources,
 * the actual protection has to live here: the static page forwards the
 * visitor's existing accessId/visitorId (from the same localStorage record
 * DashboardAccessGate itself uses) as query params, and this route
 * re-validates them against dashboard_accesses before returning real
 * figures - the same check POST /api/dashboard-access uses for "reuse".
 *
 * Affected-population figures are sourced from eod_main (layer 12) only,
 * not nts_main (layer 6): verified against the live data before building
 * this, nts_main's total/ind_total/pop_idps fields contain outlier entries
 * (a single record claiming total=434,080 "beneficiaries" against a
 * district population in the low hundreds of thousands; 21% of nts_main
 * records exceed total=1,000, accounting for 87% of its national sum),
 * almost certainly data-entry errors rather than real figures. eod_main's
 * equivalent fields were checked the same way and are clean (max total =
 * 2,250, max ind_total = 7,307, both plausible for a single task). nts_main
 * is still used for its count-based indicators (hazard confirmed,
 * blocked-access flags, conflict evidence), which aren't sums and so aren't
 * affected by this.
 */

const NTS_LAYER_URL = "https://so.imsma.org/server/rest/services/global_services/All_Global/FeatureServer/6";
const EOD_LAYER_URL = "https://so.imsma.org/server/rest/services/global_services/All_Global/FeatureServer/12";
const ACC_LAYER_URL = "https://so.imsma.org/server/rest/services/global_services/All_Global/FeatureServer/2";

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

async function statQuery(
  layerUrl: string,
  token: string | null,
  where: string,
  outStatistics: Record<string, unknown>[],
) {
  const qs = new URLSearchParams({
    f: "json",
    where,
    groupByFieldsForStatistics: "district",
    outStatistics: JSON.stringify(outStatistics),
  });
  if (token) qs.set("token", token);
  const res = await fetch(`${layerUrl}/query?${qs.toString()}`, { cache: "no-store" });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message || "IMSMA Core query failed");
  return data as { features: { attributes: Record<string, unknown> }[] };
}

function toMap(data: { features: { attributes: Record<string, unknown> }[] }, valueField: string) {
  const map: Record<string, number> = {};
  for (const f of data.features) {
    const district = f.attributes.district;
    if (!district || district === "null") continue;
    map[String(district)] = Number(f.attributes[valueField] ?? 0);
  }
  return map;
}

// A handful of blocked-access values in IMSMA are inconsistently cased
// ("Yes" alongside "yes" on the eod_main layer) - match defensively rather
// than assume clean casing everywhere.
const YES = "('yes','Yes','YES')";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const accessId = url.searchParams.get("accessId");
  const visitorId = url.searchParams.get("visitorId");

  if (!accessId || !visitorId) {
    return NextResponse.json({ message: "Registration required." }, { status: 403 });
  }

  try {
    const configuredDays = Number(process.env.NEXT_PUBLIC_DASHBOARD_ACCESS_REMEMBER_DAYS || 30);
    const rememberDays = Number.isInteger(configuredDays) && configuredDays > 0 ? configuredDays : 30;
    const authorized = await hasValidDashboardRegistration(accessId, visitorId, getConsentVersion(), rememberDays);
    if (!authorized) {
      return NextResponse.json({ message: "Registration required." }, { status: 403 });
    }
  } catch (error) {
    console.error("[eo-humanitarian-impact] registration check failed", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }

  try {
    const token = await getToken();

    const [
      ntsHazardConfirmed,
      ntsWaterBlocked,
      ntsAgriBlocked,
      ntsPastoralBlocked,
      ntsRoadsBlocked,
      ntsInfraBlocked,
      ntsConflictEvidence,
      eodSums,
      eodWaterBlocked,
      eodAgriBlocked,
      eodRoadsBlocked,
      eodInfraBlocked,
      eodActiveFighting,
      accStats,
    ] = await Promise.all([
      statQuery(NTS_LAYER_URL, token, "nts_result = 'yes'", [
        { statisticType: "count", onStatisticField: "objectid", outStatisticFieldName: "v" },
      ]),
      statQuery(NTS_LAYER_URL, token, `water_access_blocked IN ${YES}`, [
        { statisticType: "count", onStatisticField: "objectid", outStatisticFieldName: "v" },
      ]),
      statQuery(NTS_LAYER_URL, token, `agricultural_land_blocked IN ${YES}`, [
        { statisticType: "count", onStatisticField: "objectid", outStatisticFieldName: "v" },
      ]),
      statQuery(NTS_LAYER_URL, token, `pastoral_land_blocked IN ${YES}`, [
        { statisticType: "count", onStatisticField: "objectid", outStatisticFieldName: "v" },
      ]),
      statQuery(NTS_LAYER_URL, token, `roads_blocked IN ${YES}`, [
        { statisticType: "count", onStatisticField: "objectid", outStatisticFieldName: "v" },
      ]),
      statQuery(NTS_LAYER_URL, token, `infrastructure_blocked IN ${YES}`, [
        { statisticType: "count", onStatisticField: "objectid", outStatisticFieldName: "v" },
      ]),
      statQuery(NTS_LAYER_URL, token, `conflict_evidence IN ${YES}`, [
        { statisticType: "count", onStatisticField: "objectid", outStatisticFieldName: "v" },
      ]),
      statQuery(EOD_LAYER_URL, token, "1=1", [
        { statisticType: "sum", onStatisticField: "total", outStatisticFieldName: "v" },
        { statisticType: "sum", onStatisticField: "ind_total", outStatisticFieldName: "indirect" },
      ]),
      statQuery(EOD_LAYER_URL, token, `water_access_blocked IN ${YES}`, [
        { statisticType: "count", onStatisticField: "objectid", outStatisticFieldName: "v" },
      ]),
      statQuery(EOD_LAYER_URL, token, `agri_land_blocked IN ${YES}`, [
        { statisticType: "count", onStatisticField: "objectid", outStatisticFieldName: "v" },
      ]),
      statQuery(EOD_LAYER_URL, token, `roads_blocked IN ${YES}`, [
        { statisticType: "count", onStatisticField: "objectid", outStatisticFieldName: "v" },
      ]),
      statQuery(EOD_LAYER_URL, token, `infrastructure_blocked IN ${YES}`, [
        { statisticType: "count", onStatisticField: "objectid", outStatisticFieldName: "v" },
      ]),
      statQuery(EOD_LAYER_URL, token, `active_fighting IN ${YES}`, [
        { statisticType: "count", onStatisticField: "objectid", outStatisticFieldName: "v" },
      ]),
      statQuery(ACC_LAYER_URL, token, "1=1", [
        { statisticType: "count", onStatisticField: "objectid", outStatisticFieldName: "records" },
        { statisticType: "sum", onStatisticField: "num_vics", outStatisticFieldName: "victims" },
      ]),
    ]);

    const eodAffected = toMap(eodSums, "v");
    const eodIndirect = toMap(eodSums, "indirect");
    const accRecords = toMap(accStats, "records");
    const accVictims = toMap(accStats, "victims");
    const hazardConfirmedMap = toMap(ntsHazardConfirmed, "v");
    const ntsWaterMap = toMap(ntsWaterBlocked, "v");
    const eodWaterMap = toMap(eodWaterBlocked, "v");
    const ntsAgriMap = toMap(ntsAgriBlocked, "v");
    const eodAgriMap = toMap(eodAgriBlocked, "v");
    const ntsPastoralMap = toMap(ntsPastoralBlocked, "v");
    const ntsRoadsMap = toMap(ntsRoadsBlocked, "v");
    const eodRoadsMap = toMap(eodRoadsBlocked, "v");
    const ntsInfraMap = toMap(ntsInfraBlocked, "v");
    const eodInfraMap = toMap(eodInfraBlocked, "v");
    const conflictEvidenceMap = toMap(ntsConflictEvidence, "v");
    const activeFightingMap = toMap(eodActiveFighting, "v");

    const districtNames = new Set<string>([
      ...Object.keys(eodAffected),
      ...Object.keys(accRecords),
      ...Object.keys(hazardConfirmedMap),
    ]);

    const get = (map: Record<string, number>, key: string) => map[key] || 0;

    const byDistrict = Array.from(districtNames).map((district) => ({
      district,
      // Affected-population figures come from EOD taskings only - see the
      // module comment above for why nts_main's equivalent fields are
      // excluded.
      affectedPopulation: get(eodAffected, district),
      indirectlyAffected: get(eodIndirect, district),
      hazardConfirmed: get(hazardConfirmedMap, district),
      waterBlocked: get(ntsWaterMap, district) + get(eodWaterMap, district),
      agriBlocked: get(ntsAgriMap, district) + get(eodAgriMap, district),
      pastoralBlocked: get(ntsPastoralMap, district),
      roadsBlocked: get(ntsRoadsMap, district) + get(eodRoadsMap, district),
      infrastructureBlocked: get(ntsInfraMap, district) + get(eodInfraMap, district),
      conflictEvidence: get(conflictEvidenceMap, district),
      activeFighting: get(activeFightingMap, district),
      accidents: get(accRecords, district),
      victims: get(accVictims, district),
    }));

    const totals = byDistrict.reduce(
      (acc, d) => ({
        affectedPopulation: acc.affectedPopulation + d.affectedPopulation,
        indirectlyAffected: acc.indirectlyAffected + d.indirectlyAffected,
        hazardConfirmed: acc.hazardConfirmed + d.hazardConfirmed,
        waterBlocked: acc.waterBlocked + d.waterBlocked,
        agriBlocked: acc.agriBlocked + d.agriBlocked,
        pastoralBlocked: acc.pastoralBlocked + d.pastoralBlocked,
        roadsBlocked: acc.roadsBlocked + d.roadsBlocked,
        infrastructureBlocked: acc.infrastructureBlocked + d.infrastructureBlocked,
        accidents: acc.accidents + d.accidents,
        victims: acc.victims + d.victims,
        districtsCovered: acc.districtsCovered + 1,
      }),
      {
        affectedPopulation: 0,
        indirectlyAffected: 0,
        hazardConfirmed: 0,
        waterBlocked: 0,
        agriBlocked: 0,
        pastoralBlocked: 0,
        roadsBlocked: 0,
        infrastructureBlocked: 0,
        accidents: 0,
        victims: 0,
        districtsCovered: 0,
      },
    );

    return NextResponse.json({ totals, byDistrict });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    );
  }
}
