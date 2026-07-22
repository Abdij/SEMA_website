import { NextResponse } from "next/server";
import { AdminUnauthorizedError, requireAdminAuth, unauthorizedResponse } from "@/lib/admin";
import { getPool } from "@/lib/db";

function serverErrorResponse(error: unknown) {
  console.error("[admin/analytics]", error);
  return NextResponse.json({ message: "Internal server error" }, { status: 500 });
}

type Filters = {
  dateFrom?: string;
  dateTo?: string;
  dashboardId?: string;
  page?: string;
  eventType?: string;
  locale?: string;
};

function parseFilters(url: URL): Filters {
  return {
    dateFrom: url.searchParams.get("dateFrom") || undefined,
    dateTo: url.searchParams.get("dateTo") || undefined,
    dashboardId: url.searchParams.get("dashboardId") || undefined,
    page: url.searchParams.get("page") || undefined,
    eventType: url.searchParams.get("eventType") || undefined,
    locale: url.searchParams.get("locale") || undefined,
  };
}

/** Builds a parameterized WHERE clause (starting from $1) for analytics_events. */
function buildEventsWhere(filters: Filters) {
  const clauses: string[] = [];
  const params: unknown[] = [];

  if (filters.dateFrom) {
    params.push(filters.dateFrom);
    clauses.push(`created_at >= $${params.length}::date`);
  }
  if (filters.dateTo) {
    params.push(filters.dateTo);
    clauses.push(`created_at < ($${params.length}::date + interval '1 day')`);
  }
  if (filters.dashboardId) {
    params.push(filters.dashboardId);
    clauses.push(`dashboard_id = $${params.length}`);
  }
  if (filters.page) {
    params.push(`%${filters.page}%`);
    clauses.push(`path ilike $${params.length}`);
  }
  if (filters.eventType) {
    params.push(filters.eventType);
    clauses.push(`event_type = $${params.length}`);
  }
  if (filters.locale) {
    params.push(filters.locale);
    clauses.push(`locale = $${params.length}`);
  }

  return {
    where: clauses.length ? `where ${clauses.join(" and ")}` : "",
    params,
  };
}

function countFrom(row: Record<string, unknown> | undefined) {
  const value = row?.count;
  return typeof value === "number" ? value : Number(value ?? 0);
}

async function getOverview(filters: Filters) {
  const pool = getPool();
  const { where, params } = buildEventsWhere(filters);

  const [
    pageViews,
    uniqueVisitors,
    totalSessions,
    returningSessions,
    dashboardOpens,
    dashboardSubmissions,
    dashboardGateOpens,
    publicationDownloads,
    dataRequestsSubmitted,
    contactFormsSubmitted,
    externalLinkClicks,
    uniqueOrganizations,
    visitorsByDay,
    dashboardOpensOverTime,
    mostAccessedDashboards,
    mostVisitedPages,
    mostClickedNav,
    mostDownloadedPublications,
    referrers,
    deviceCategories,
    browserCategories,
    localeUsage,
    visitorsByCountry,
    visitorsByCity,
    gateFunnel,
  ] = await Promise.all([
    pool.query(`select count(*)::int as count from analytics_events ${where} ${where ? "and" : "where"} event_type = 'page_view'`, params),
    pool.query(
      `select count(distinct anonymous_visitor_id)::int as count from analytics_events ${where} ${where ? "and" : "where"} anonymous_visitor_id is not null`,
      params,
    ),
    pool.query(
      `select count(distinct session_id)::int as count from analytics_events ${where} ${where ? "and" : "where"} session_id is not null`,
      params,
    ),
    pool.query(
      `select count(*)::int as count from (
         select anonymous_visitor_id
         from analytics_events
         ${where} ${where ? "and" : "where"} anonymous_visitor_id is not null
         group by anonymous_visitor_id
         having count(distinct session_id) > 1
       ) t`,
      params,
    ),
    pool.query(`select count(*)::int as count from analytics_events ${where} ${where ? "and" : "where"} event_type = 'dashboard_opened'`, params),
    pool.query(`select count(*)::int as count from analytics_events ${where} ${where ? "and" : "where"} event_type = 'dashboard_access_submitted'`, params),
    pool.query(`select count(*)::int as count from analytics_events ${where} ${where ? "and" : "where"} event_type = 'dashboard_gate_opened'`, params),
    pool.query(`select count(*)::int as count from analytics_events ${where} ${where ? "and" : "where"} event_type = 'publication_downloaded'`, params),
    pool.query(`select count(*)::int as count from analytics_events ${where} ${where ? "and" : "where"} event_type = 'data_request_submitted'`, params),
    pool.query(`select count(*)::int as count from analytics_events ${where} ${where ? "and" : "where"} event_type = 'contact_form_submitted'`, params),
    pool.query(`select count(*)::int as count from analytics_events ${where} ${where ? "and" : "where"} event_type = 'external_link_clicked'`, params),
    pool.query(`select count(distinct organization_name)::int as count from dashboard_accesses`),
    pool.query(
      `select to_char(created_at::date, 'YYYY-MM-DD') as day, count(*)::int as count,
              count(distinct anonymous_visitor_id)::int as unique_visitors
       from analytics_events
       ${where} ${where ? "and" : "where"} event_type = 'page_view'
       group by 1 order by 1 desc limit 90`,
      params,
    ),
    pool.query(
      `select to_char(created_at::date, 'YYYY-MM-DD') as day, count(*)::int as count
       from analytics_events
       ${where} ${where ? "and" : "where"} event_type = 'dashboard_opened'
       group by 1 order by 1 desc limit 90`,
      params,
    ),
    pool.query(
      `select coalesce(nullif(dashboard_title, ''), label, 'Dashboard') as title, count(*)::int as count
       from analytics_events
       ${where} ${where ? "and" : "where"} event_type = 'dashboard_opened'
       group by 1 order by count desc limit 20`,
      params,
    ),
    pool.query(
      `select path, count(*)::int as count
       from analytics_events
       ${where} ${where ? "and" : "where"} event_type = 'page_view' and path is not null
       group by 1 order by count desc limit 20`,
      params,
    ),
    pool.query(
      `select coalesce(nullif(label, ''), 'Navigation') as label, count(*)::int as count
       from analytics_events
       ${where} ${where ? "and" : "where"} event_type in ('nav_click', 'navigation_click', 'header_action_click')
       group by 1 order by count desc limit 20`,
      params,
    ),
    pool.query(
      `select coalesce(nullif(label, ''), 'Publication') as label, count(*)::int as count
       from analytics_events
       ${where} ${where ? "and" : "where"} event_type = 'publication_downloaded'
       group by 1 order by count desc limit 20`,
      params,
    ),
    pool.query(
      `select case when referer is null or referer = '' then 'Direct / none' else referer end as referrer, count(*)::int as count
       from analytics_events
       ${where} ${where ? "and" : "where"} event_type = 'page_view'
       group by 1 order by count desc limit 15`,
      params,
    ),
    pool.query(
      `select coalesce(device_category, 'unknown') as category, count(*)::int as count
       from analytics_events
       ${where} ${where ? "and" : "where"} event_type = 'page_view'
       group by 1 order by count desc`,
      params,
    ),
    pool.query(
      `select coalesce(browser_category, 'other') as category, count(*)::int as count
       from analytics_events
       ${where} ${where ? "and" : "where"} event_type = 'page_view'
       group by 1 order by count desc`,
      params,
    ),
    pool.query(
      `select coalesce(locale, 'unknown') as locale, count(*)::int as count
       from analytics_events
       ${where} ${where ? "and" : "where"} event_type = 'page_view'
       group by 1 order by count desc`,
      params,
    ),
    pool.query(
      `select coalesce(country_code, 'Unknown') as country, count(*)::int as count
       from analytics_events
       ${where} ${where ? "and" : "where"} event_type = 'page_view'
       group by 1 order by count desc limit 20`,
      params,
    ),
    pool.query(
      `select coalesce(city, 'Unknown') as city, count(*)::int as count
       from analytics_events
       ${where} ${where ? "and" : "where"} event_type = 'page_view' and city is not null
       group by 1 order by count desc limit 20`,
      params,
    ),
    pool.query(
      `select event_type, count(*)::int as count
       from analytics_events
       ${where} ${where ? "and" : "where"} event_type in ('dashboard_gate_opened', 'dashboard_gate_cancelled', 'dashboard_access_submitted')
       group by 1`,
      params,
    ),
  ]);

  const funnel = { opened: 0, cancelled: 0, submitted: 0 };
  for (const row of gateFunnel.rows) {
    if (row.event_type === "dashboard_gate_opened") funnel.opened = row.count;
    if (row.event_type === "dashboard_gate_cancelled") funnel.cancelled = row.count;
    if (row.event_type === "dashboard_access_submitted") funnel.submitted = row.count;
  }

  const totalSessionsCount = countFrom(totalSessions.rows[0]);
  const returningCount = countFrom(returningSessions.rows[0]);
  const dashboardOpensCount = countFrom(dashboardOpens.rows[0]);
  const dashboardSubmissionsCount = countFrom(dashboardSubmissions.rows[0]);
  const dashboardGateOpensCount = countFrom(dashboardGateOpens.rows[0]);

  return {
    totals: {
      pageViews: countFrom(pageViews.rows[0]),
      uniqueVisitors: countFrom(uniqueVisitors.rows[0]),
      totalSessions: totalSessionsCount,
      returningVisitorRate: totalSessionsCount ? Math.round((returningCount / totalSessionsCount) * 1000) / 10 : 0,
      dashboardOpens: dashboardOpensCount,
      uniqueOrganizations: countFrom(uniqueOrganizations.rows[0]),
      dashboardFormSubmissions: dashboardSubmissionsCount,
      dashboardFormCompletionRate: dashboardGateOpensCount
        ? Math.round((dashboardSubmissionsCount / dashboardGateOpensCount) * 1000) / 10
        : null,
      publicationDownloads: countFrom(publicationDownloads.rows[0]),
      dataRequestsSubmitted: countFrom(dataRequestsSubmitted.rows[0]),
      contactFormsSubmitted: countFrom(contactFormsSubmitted.rows[0]),
      externalLinkClicks: countFrom(externalLinkClicks.rows[0]),
    },
    visitorsByDay: visitorsByDay.rows,
    dashboardOpensOverTime: dashboardOpensOverTime.rows,
    mostAccessedDashboards: mostAccessedDashboards.rows,
    mostVisitedPages: mostVisitedPages.rows,
    mostClickedNav: mostClickedNav.rows,
    mostDownloadedPublications: mostDownloadedPublications.rows,
    referrers: referrers.rows,
    deviceCategories: deviceCategories.rows,
    browserCategories: browserCategories.rows,
    localeUsage: localeUsage.rows,
    visitorsByCountry: visitorsByCountry.rows,
    visitorsByCity: visitorsByCity.rows,
    dashboardGateFunnel: funnel,
    note: "Unique visitor and session counts are estimates derived from anonymous, first-party browser identifiers — they represent distinct browsers/devices, not verified individual people.",
  };
}

function csvEscape(value: unknown) {
  const text = value instanceof Date ? value.toISOString() : String(value ?? "");
  const escaped = text.replace(/"/g, '""');
  return /[",\r\n]/.test(escaped) ? `"${escaped}"` : escaped;
}

function toCsv(columns: string[], rows: Record<string, unknown>[]) {
  const header = columns.join(",");
  const body = rows.map((row) => columns.map((column) => csvEscape(row[column])).join(","));
  return [header, ...body].join("\r\n");
}

async function getSummaryCsv(filters: Filters) {
  const overview = await getOverview(filters);
  const rows = Object.entries(overview.totals).map(([metric, value]) => ({ metric, value }));
  return toCsv(["metric", "value"], rows);
}

async function getEventsCsv(filters: Filters) {
  const pool = getPool();
  const { where, params } = buildEventsWhere(filters);

  const result = await pool.query(
    `select event_type, event_category, label, path, target_url, dashboard_title,
            locale, country_code, region, city, device_category, browser_category,
            created_at
     from analytics_events
     ${where}
     order by created_at desc
     limit 10000`,
    params,
  );

  return toCsv(
    [
      "event_type",
      "event_category",
      "label",
      "path",
      "target_url",
      "dashboard_title",
      "locale",
      "country_code",
      "region",
      "city",
      "device_category",
      "browser_category",
      "created_at",
    ],
    result.rows,
  );
}

function csvResponse(filename: string, csv: string) {
  const date = new Date().toISOString().slice(0, 10);
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="sema-${filename}-${date}.csv"`,
    },
  });
}

export async function GET(request: Request) {
  try {
    requireAdminAuth(request);
    const url = new URL(request.url);
    const filters = parseFilters(url);
    const exportType = url.searchParams.get("export");

    if (exportType === "summary") {
      // Audit trail for data exports (Part 16).
      console.info("[admin/analytics] summary export requested", { at: new Date().toISOString() });
      return csvResponse("analytics-summary", await getSummaryCsv(filters));
    }

    if (exportType === "events") {
      console.info("[admin/analytics] raw events export requested", { at: new Date().toISOString() });
      return csvResponse("analytics-events", await getEventsCsv(filters));
    }

    if (exportType) {
      return NextResponse.json({ message: "Unknown analytics export type" }, { status: 400 });
    }

    return NextResponse.json(await getOverview(filters));
  } catch (error) {
    if (error instanceof AdminUnauthorizedError) {
      return unauthorizedResponse();
    }
    return serverErrorResponse(error);
  }
}
