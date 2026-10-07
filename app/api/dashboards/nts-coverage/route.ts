import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Public, read-only proxy for the SEMA IMSMA Core NTS survey layer (nts_main,
 * layer 6 of the All_Global FeatureServer). The browser never holds IMSMA
 * credentials or talks to so.imsma.org directly; this route holds the token
 * server-side, exactly as the NTS Area Prioritization Tool's backend does
 * (see C:\NTS Tool\backend\app\services\arcgis_client.py for the reference
 * implementation this mirrors).
 *
 * Only exposes a fixed set of non-identifying fields needed by the Survey
 * Coverage Dashboard (public/dashboards/nts-coverage.html) - no case-level
 * personal data exists on this layer, but the field list is still an
 * explicit allowlist rather than "*".
 */

const OUT_FIELDS = "region,district,org,report_dt,nts_result,no_hazard,survey_type";
const NTS_LAYER_URL =
  "https://so.imsma.org/server/rest/services/global_services/All_Global/FeatureServer/6";

type CachedToken = { token: string; expires: number };
let cachedToken: CachedToken | null = null;

// Reuses the same env var names as lib/imsma-sync.ts (the site's existing,
// not-yet-configured IMSMA -> Data Catalogue sync module) so this site only
// ever needs ONE set of IMSMA credentials, not two conflicting conventions.
// Note: imsma-sync.ts's own default portal URL (arcgis.com) is wrong for
// SEMA's on-prem Enterprise portal - the default here is corrected to
// so.imsma.org; set IMSMA_ARCGIS_PORTAL_URL explicitly either way.
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
  return data.token;
}

export async function GET() {
  try {
    const token = await getToken();
    const params = new URLSearchParams({
      f: "json",
      where: "1=1",
      outFields: OUT_FIELDS,
      returnGeometry: "false",
      resultRecordCount: "5000",
    });
    if (token) params.set("token", token);

    const res = await fetch(`${NTS_LAYER_URL}/query?${params.toString()}`, {
      cache: "no-store",
    });
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
