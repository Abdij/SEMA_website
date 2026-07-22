import { NextResponse } from "next/server";
import { requireAdminAuth, unauthorizedResponse } from "@/lib/admin";
import { getPool } from "@/lib/db";
import { getDashboardAccessRetentionDays, getRawEventRetentionDays } from "@/lib/analytics-server";

/**
 * Deletes analytics_events and dashboard_accesses rows older than the
 * configured retention windows (ANALYTICS_RAW_EVENT_RETENTION_DAYS,
 * DASHBOARD_ACCESS_RETENTION_DAYS). Intended to be triggered either by an
 * authenticated admin action or by a scheduled job (e.g. Vercel Cron hitting
 * this route with `Authorization: Bearer $CRON_SECRET`).
 */
function isAuthorized(request: Request): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authorization = request.headers.get("authorization") || "";
    if (authorization === `Bearer ${cronSecret}`) {
      return true;
    }
  }

  try {
    requireAdminAuth(request);
    return true;
  } catch {
    return false;
  }
}

async function runCleanup() {
  const pool = getPool();
  const eventRetentionDays = getRawEventRetentionDays();
  const accessRetentionDays = getDashboardAccessRetentionDays();

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
  if (!isAuthorized(request)) {
    return unauthorizedResponse();
  }

  try {
    const result = await runCleanup();
    console.info("[admin/retention-cleanup] completed", { at: new Date().toISOString(), ...result });
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error("[admin/retention-cleanup]", error);
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
