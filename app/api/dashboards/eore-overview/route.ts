import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Server-side proxy + aggregator for the EORE Overview Dashboard
 * (public/dashboards/eore-overview.html). Recreates (as a self-hosted,
 * publicly embeddable page) the content of SEMA's existing native "Somalia
 * EORE Dashboard" in IMSMA Core (item ded74ac7d20e4ccabb05175aca083235),
 * which is org-only and can't be embedded on the public website directly.
 *
 * Aggregates server-side - group-by statistics queries plus one lightweight
 * single-field fetch for year-binning (ArcGIS REST can't group by year
 * directly) - rather than shipping ~38k raw rows to the browser.
 */

const EORE_LAYER_URL =
  "https://so.imsma.org/server/rest/services/global_services/All_Global/FeatureServer/4";

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

async function query(token: string | null, params: Record<string, string>) {
  const qs = new URLSearchParams({ f: "json", where: "1=1", returnGeometry: "false", ...params });
  if (token) qs.set("token", token);
  const res = await fetch(`${EORE_LAYER_URL}/query?${qs.toString()}`, { cache: "no-store" });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message || "IMSMA Core query failed");
  return data;
}

function groupedSum(data: { features: { attributes: Record<string, unknown> }[] }, groupField: string, valueField: string) {
  return data.features
    .map((f) => ({ key: String(f.attributes[groupField] ?? "unknown"), value: Number(f.attributes[valueField] ?? 0) }))
    .filter((r) => r.key !== "null" && r.key !== "unknown");
}

export async function GET() {
  try {
    const token = await getToken();

    const [overall, byOrg, byMethod, byState, dates] = await Promise.all([
      query(token, {
        outStatistics: JSON.stringify([
          { statisticType: "sum", onStatisticField: "girls", outStatisticFieldName: "girls" },
          { statisticType: "sum", onStatisticField: "boys", outStatisticFieldName: "boys" },
          { statisticType: "sum", onStatisticField: "men", outStatisticFieldName: "men" },
          { statisticType: "sum", onStatisticField: "women", outStatisticFieldName: "women" },
          { statisticType: "sum", onStatisticField: "total", outStatisticFieldName: "total" },
          { statisticType: "sum", onStatisticField: "no_sessions", outStatisticFieldName: "sessions" },
          { statisticType: "count", onStatisticField: "objectid", outStatisticFieldName: "records" },
        ]),
      }),
      query(token, {
        groupByFieldsForStatistics: "org",
        outStatistics: JSON.stringify([{ statisticType: "sum", onStatisticField: "total", outStatisticFieldName: "total" }]),
      }),
      query(token, {
        groupByFieldsForStatistics: "activity_method",
        outStatistics: JSON.stringify([{ statisticType: "count", onStatisticField: "objectid", outStatisticFieldName: "total" }]),
      }),
      query(token, {
        groupByFieldsForStatistics: "fed_state",
        outStatistics: JSON.stringify([{ statisticType: "sum", onStatisticField: "total", outStatisticFieldName: "total" }]),
      }),
      query(token, { outFields: "report_date,total", resultRecordCount: "50000" }),
    ]);

    const overallAttrs = overall.features[0]?.attributes || {};

    const byYear: Record<string, number> = {};
    for (const f of dates.features as { attributes: { report_date: number | null; total: number | null } }[]) {
      if (!f.attributes.report_date) continue;
      const year = new Date(f.attributes.report_date).getFullYear();
      byYear[year] = (byYear[year] || 0) + (f.attributes.total || 0);
    }

    return NextResponse.json({
      totals: {
        girls: overallAttrs.girls || 0,
        boys: overallAttrs.boys || 0,
        men: overallAttrs.men || 0,
        women: overallAttrs.women || 0,
        beneficiaries: overallAttrs.total || 0,
        sessions: overallAttrs.sessions || 0,
        records: overallAttrs.records || 0,
      },
      byOrg: groupedSum(byOrg, "org", "total"),
      byMethod: groupedSum(byMethod, "activity_method", "total"),
      byState: groupedSum(byState, "fed_state", "total"),
      byYear: Object.entries(byYear).map(([year, total]) => ({ year, total })).sort((a, b) => a.year.localeCompare(b.year)),
    });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    );
  }
}
