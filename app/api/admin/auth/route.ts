import { NextResponse } from "next/server";
import { ADMIN_COOKIE, createAdminSession, requireAdminAuth, revokeAdminSession, sessionCookieOptions, verifyAdminPassword } from "@/lib/admin";
import { getAdminLoginRateLimitPer5Minutes, getClientIdentifier } from "@/lib/analytics-server";
import { enforceRateLimit, readLimitedJson, requireSameOrigin, securityResponse } from "@/lib/security";

function failure(error: unknown) {
  return securityResponse(error) || NextResponse.json({ message: "Admin sign-in is temporarily unavailable." }, { status: 503 });
}
export async function POST(request: Request) {
  try {
    requireSameOrigin(request);
    await enforceRateLimit("admin-login", getClientIdentifier(request), getAdminLoginRateLimitPer5Minutes(), 300);
    const body = await readLimitedJson(request, 4096);
    if (typeof body.password !== "string" || !verifyAdminPassword(body.password)) {
      return NextResponse.json({ message: "Invalid password" }, { status: 401 });
    }
    const response = NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
    response.cookies.set(ADMIN_COOKIE, await createAdminSession(), sessionCookieOptions);
    return response;
  } catch (error) { return failure(error); }
}
export async function GET(request: Request) {
  try {
    await requireAdminAuth(request);
    return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return failure(error); }
}
export async function DELETE(request: Request) {
  try {
    requireSameOrigin(request);
    await enforceRateLimit("admin-api", getClientIdentifier(request), 120, 60);
    await revokeAdminSession(request);
    const response = NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
    response.cookies.set(ADMIN_COOKIE, "", { ...sessionCookieOptions, maxAge: 0 });
    return response;
  } catch (error) { return failure(error); }
}
