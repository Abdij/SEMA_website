import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { getPool } from "./db";
import { getClientIdentifier } from "./analytics-server";
import { digest, enforceRateLimit, requireSameOrigin, SecurityError, securityResponse } from "./security";

export const ADMIN_COOKIE = "sema_admin_session";
export const SESSION_SECONDS = 8 * 60 * 60;
export class AdminUnauthorizedError extends SecurityError {
  constructor() { super("Unauthorized", 401); }
}
export class AdminConfigurationError extends SecurityError {
  constructor() { super("Admin sign-in is temporarily unavailable.", 503); }
}
export function constantTimeEqual(actual: string, expected: string) {
  return timingSafeEqual(createHash("sha256").update(actual).digest(), createHash("sha256").update(expected).digest());
}
function adminPassword() {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) throw new AdminConfigurationError();
  return password;
}
export function verifyAdminPassword(password: string) {
  return constantTimeEqual(password, adminPassword());
}
function sessionToken(request: Request) {
  const value = request.headers.get("cookie")?.split(";").map((item) => item.trim())
    .find((item) => item.startsWith(`${ADMIN_COOKIE}=`))?.slice(ADMIN_COOKIE.length + 1);
  return value && /^[a-f0-9]{64}$/.test(value) ? value : undefined;
}
export const sessionCookieOptions = {
  httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict" as const,
  path: "/api/admin", maxAge: SESSION_SECONDS,
};
export async function createAdminSession() {
  const token = randomBytes(32).toString("hex");
  await getPool().query(
    `insert into admin_sessions (token_hash, credential_fingerprint, expires_at)
     values ($1, $2, now() + ($3::integer * interval '1 second'))`,
    [digest(token), digest(adminPassword()), SESSION_SECONDS],
  );
  return token;
}
export async function revokeAdminSession(request: Request) {
  const token = sessionToken(request);
  if (token) await getPool().query("delete from admin_sessions where token_hash = $1", [digest(token)]);
}
export async function requireAdminAuth(request: Request) {
  await enforceRateLimit("admin-api", getClientIdentifier(request), 120, 60);
  if (!["GET", "HEAD", "OPTIONS"].includes(request.method)) requireSameOrigin(request);
  // The shared password is accepted only by the throttled login endpoint.
  const token = sessionToken(request);
  if (!token) throw new AdminUnauthorizedError();
  const result = await getPool().query(
    `select token_hash from admin_sessions
     where token_hash = $1 and credential_fingerprint = $2 and expires_at > now()`,
    [digest(token), digest(adminPassword())],
  ).catch(() => { throw new AdminConfigurationError(); });
  if (!result.rows.length) throw new AdminUnauthorizedError();
  return true;
}
export function unauthorizedResponse(error: unknown = new AdminUnauthorizedError()) {
  return securityResponse(error) || NextResponse.json({ message: "Unauthorized" }, { status: 401 });
}
