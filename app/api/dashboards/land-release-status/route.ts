import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Server-side proxy for the Land Release Status Dashboard
 * (public/dashboards/land-release-status.html). Queries IMSMA Core's hazard
 * polygon layer (nts_hazard_polygon) for area/status/type - a genuine,
 * populated data source, unlike the empty clearance-method tables
 * (cancellation_main, progress_report_cleared_area, etc.), which are still
 * waiting on GICHD's mine/IED data migration. See the on-page scope note.
 *
 * Same token-caching pattern as the other dashboards/ routes.
 */

const NTS_HAZARD_LAYER_URL =
  "https://so.imsma.org/server/rest/services/global_services/All_Global/FeatureServer/13";

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

export async function GET() {
  try {
    const token = await getToken();
    const params = new URLSearchParams({
      f: "json",
      where: "1=1",
      outFields: "area_type,status,area_size",
      returnGeometry: "false",
      resultRecordCount: "5000",
    });
    if (token) params.set("token", token);

    const res = await fetch(`${NTS_HAZARD_LAYER_URL}/query?${params.toString()}`, { cache: "no-store" });
    const data = await res.json();

    if (data.error) {
      return NextResponse.json(
        { message: "IMSMA Core query failed", detail: data.error },
        { status: 502 },
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    );
  }
}
