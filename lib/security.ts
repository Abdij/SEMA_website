import { createHash, createHmac } from "node:crypto";
import { NextResponse } from "next/server";
import { getPool } from "./db";

export class SecurityError extends Error {
  constructor(message: string, public status: 400 | 401 | 403 | 413 | 429 | 503, public retryAfter?: number) {
    super(message);
  }
}
export function securityResponse(error: unknown) {
  if (!(error instanceof SecurityError)) return null;
  return NextResponse.json({ message: error.message }, {
    status: error.status,
    headers: { "Cache-Control": "no-store", ...(error.retryAfter ? { "Retry-After": String(error.retryAfter) } : {}) },
  });
}
export const digest = (value: string) => createHash("sha256").update(value).digest("hex");

/** Atomic shared buckets survive multiple serverless workers and restarts. */
export async function enforceRateLimit(scope: string, identity: string, limit: number, seconds: number) {
  try {
    const secret = process.env.SECURITY_HASH_SECRET || process.env.ADMIN_PASSWORD;
    if (!secret) throw new Error("Security key unavailable");
    const key = createHmac("sha256", secret).update(`${scope}:${identity}`).digest("hex");
    const result = await getPool().query(
      `insert into security_rate_limits (bucket_key, attempts, expires_at)
       values ($1, 1, now() + ($2::integer * interval '1 second'))
       on conflict (bucket_key) do update set
         attempts = case when security_rate_limits.expires_at <= now() then 1
                         else least(security_rate_limits.attempts + 1, 1000000) end,
         expires_at = case when security_rate_limits.expires_at <= now()
                           then now() + ($2::integer * interval '1 second') else security_rate_limits.expires_at end
       returning attempts, greatest(1, ceil(extract(epoch from (expires_at - now())))) as retry_after`,
      [key, seconds],
    );
    if (Number(result.rows[0]?.attempts) > limit) {
      throw new SecurityError("Too many requests. Please try again later.", 429, Number(result.rows[0].retry_after));
    }
    if (!result.rows.length) throw new Error("Rate limit unavailable");
  } catch (error) {
    if (error instanceof SecurityError) throw error;
    throw new SecurityError("This service is temporarily unavailable. Please try again later.", 503);
  }
}
export function requireSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (request.headers.get("sec-fetch-site") === "cross-site" ||
      (origin && origin !== new URL(request.url).origin)) {
    throw new SecurityError("Cross-site requests are not allowed.", 403);
  }
}
/** Bound the actual stream, not just the caller-supplied Content-Length. */
export async function readLimitedJson(request: Request, maxBytes = 32768): Promise<Record<string, unknown>> {
  if (Number(request.headers.get("content-length")) > maxBytes) throw new SecurityError("Submission is too large.", 413);
  if (!request.body) throw new SecurityError("Invalid request body.", 400);
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxBytes) {
        await reader.cancel();
        throw new SecurityError("Submission is too large.", 413);
      }
      chunks.push(value);
    }
    const data = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error("Not an object");
    return data;
  } catch (error) {
    if (error instanceof SecurityError) throw error;
    throw new SecurityError("Invalid request body.", 400);
  } finally { reader.releaseLock(); }
}
