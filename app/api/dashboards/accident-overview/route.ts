import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Server-side proxy + aggregator for the Accident Overview Dashboard
 * (public/dashboards/accident-overview.html). Recreates the AGGREGATE
 * content of SEMA's existing "Accident and Victim Overview Dashboard" in
 * IMSMA Core (item 62fdb8944cfa41d98629b6c002eb4050) as a public page.
 *
 * Deliberately excludes that dashboard's accident-to-victim master-detail
 * drill-down: the linked victim-level table carries personal data (names,
 * phone numbers, addresses - confirmed directly against the Victims CSV
 * export examined earlier this engagement). Only aggregate counts/sums are
 * exposed here, never individual records.
 */

const ACC_LAYER_URL =
  "https://so.imsma.org/server/rest/services/global_services/All_Global/FeatureServer/2";

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
  const res = await fetch(`${ACC_LAYER_URL}/query?${qs.toString()}`, { cache: "no-store" });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message || "IMSMA Core query failed");
  return data;
}

function groupedCount(data: { features: { attributes: Record<string, unknown> }[] }, groupField: string, valueField: string) {
  return data.features
    .map((f) => ({ key: String(f.attributes[groupField] ?? "unknown"), value: Number(f.attributes[valueField] ?? 0) }))
    .filter((r) => r.key !== "null");
}

export async function GET() {
  try {
    const token = await getToken();

    const [overall, byType, byRegion, dates] = await Promise.all([
      query(token, {
        outStatistics: JSON.stringify([
          { statisticType: "count", onStatisticField: "objectid", outStatisticFieldName: "records" },
          { statisticType: "sum", onStatisticField: "num_vics", outStatisticFieldName: "victims" },
        ]),
      }),
      query(token, {
        groupByFieldsForStatistics: "acc_type",
        outStatistics: JSON.stringify([{ statisticType: "count", onStatisticField: "objectid", outStatisticFieldName: "total" }]),
      }),
      query(token, {
        groupByFieldsForStatistics: "region",
        outStatistics: JSON.stringify([{ statisticType: "count", onStatisticField: "objectid", outStatisticFieldName: "total" }]),
      }),
      query(token, { outFields: "acc_dt", resultRecordCount: "5000" }),
    ]);

    const overallAttrs = overall.features[0]?.attributes || {};

    const byYear: Record<string, number> = {};
    for (const f of dates.features as { attributes: { acc_dt: number | null } }[]) {
      if (!f.attributes.acc_dt) continue;
      const year = new Date(f.attributes.acc_dt).getFullYear();
      byYear[year] = (byYear[year] || 0) + 1;
    }

    return NextResponse.json({
      totals: {
        records: overallAttrs.records || 0,
        victims: overallAttrs.victims || 0,
      },
      byType: groupedCount(byType, "acc_type", "total"),
      byRegion: groupedCount(byRegion, "region", "total"),
      byYear: Object.entries(byYear).map(([year, total]) => ({ year, total })).sort((a, b) => a.year.localeCompare(b.year)),
    });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    );
  }
}
