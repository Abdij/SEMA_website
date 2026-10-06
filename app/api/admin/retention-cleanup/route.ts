import { NextResponse } from "next/server";
import { constantTimeEqual, requireAdminAuth } from "@/lib/admin";
import { enforceRateLimit, SecurityError, securityResponse } from "@/lib/security";
import { getPool } from "@/lib/db";
import { getClientIdentifier, getDashboardAccessRetentionDays, getRawEventRetentionDays } from "@/lib/analytics-server";

/**
 * Deletes analytics_events and dashboard_accesses rows older than the
 * configured retention windows (ANALYTICS_RAW_EVENT_RETENTION_DAYS,
 * DASHBOARD_ACCESS_RETENTION_DAYS). Intended to be triggered either by an
 * authenticated admin action or by a scheduled job (e.g. Vercel Cron hitting
 * this route with `Authorization: Bearer $CRON_SECRET`).
 */
async function isAuthorized(request: Request): Promise<boolean> {
  await enforceRateLimit("retention-auth", getClientIdentifier(request), 20, 300);
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authorization = request.headers.get("authorization") || "";
    if (constantTimeEqual(authorization, `Bearer ${cronSecret}`)) {
      return true;
    }
  }

  // GET is reserved for cron; a browser session may invoke cleanup only by POST.
  if (request.method === "GET") throw new SecurityError("Unauthorized", 401);
  await requireAdminAuth(request);
  return true;
}

async function runCleanup() {
  const pool = getPool();
  const eventRetentionDays = getRawEventRetentionDays();
  const accessRetentionDays = getDashboardAccessRetentionDays();

  await pool.query("delete from security_rate_limits where expires_at < now()");
  await pool.query("delete from admin_sessions where expires_at < now()");
  const [eventsResult, accessResult] = await Promise.all([
    pool.query(
      `delete from analytics_events where created_at < now() - ($1 || ' days')::interval`,
      [eventRetentionDays],
    ),
    pool.query(
      `delete from dashboard_accesses where created_at < now() - ($1 || ' days')::interval`,
      [accessRetentionDays],
    ),
  ]);

  return {
    analyticsEventsDeleted: eventsResult.rowCount ?? 0,
    dashboardAccessesDeleted: accessResult.rowCount ?? 0,
    eventRetentionDays,
    accessRetentionDays,
  };
}

async function handle(request: Request) {
  try {
    await isAuthorized(request);
    const result = await runCleanup();
    console.info("[admin/retention-cleanup] completed", { at: new Date().toISOString(), ...result });
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    const denied = securityResponse(error);
    if (denied) return denied;
    console.error("[admin/retention-cleanup] cleanup failed");
    return NextResponse.json({ message: "Retention cleanup failed" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  return handle(request);
}

// Vercel Cron sends GET requests to the scheduled path.
export async function GET(request: Request) {
  return handle(request);
}
