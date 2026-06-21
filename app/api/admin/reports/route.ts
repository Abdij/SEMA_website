import { NextResponse } from "next/server";
import { AdminUnauthorizedError, requireAdminAuth, unauthorizedResponse } from "@/lib/admin";
import { getPool } from "@/lib/db";

type CsvValue = string | number | boolean | Date | null | undefined;

type CsvColumn = {
  key: string;
  label: string;
};

const exportTypes = new Set([
  "data-requests",
  "contact-messages",
  "news-by-theme-date",
  "dashboard-clicks",
  "nav-clicks",
  "analytics-events",
]);

function serverErrorResponse(error: unknown) {
  return NextResponse.json(
    { message: error instanceof Error ? error.message : "Internal server error" },
    { status: 500 },
  );
}

function countFrom(row: Record<string, unknown> | undefined) {
  const value = row?.count;
  return typeof value === "number" ? value : Number(value ?? 0);
}

function isoValue(value: unknown) {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  return String(value);
}

function csvEscape(value: CsvValue) {
  const text = value instanceof Date ? value.toISOString() : String(value ?? "");
  const escaped = text.replace(/"/g, '""');
  return /[",\r\n]/.test(escaped) ? `"${escaped}"` : escaped;
}

function toCsv(columns: CsvColumn[], rows: Record<string, CsvValue>[]) {
  const header = columns.map((column) => csvEscape(column.label)).join(",");
  const body = rows.map((row) => columns.map((column) => csvEscape(row[column.key])).join(","));
  return [header, ...body].join("\r\n");
}

function csvResponse(exportType: string, csv: string) {
  const date = new Date().toISOString().slice(0, 10);
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="sema-${exportType}-${date}.csv"`,
    },
  });
}

async function getReportSummary() {
  const pool = getPool();

  const [
    dataRequestsTotal,
    contactMessagesTotal,
    publishedNewsTotal,
    draftNewsTotal,
    dashboardClicksTotal,
    navClicksTotal,
    newsByThemeDate,
    dashboardClicks,
    navClicks,
  ] = await Promise.all([
    pool.query(`select count(*)::int as count from data_requests`),
    pool.query(`select count(*)::int as count from contact_messages`),
    pool.query(`select count(*)::int as count from news_posts where status = 'published'`),
    pool.query(`select count(*)::int as count from news_posts where status = 'draft'`),
    pool.query(`select count(*)::int as count from analytics_events where event_type = 'dashboard_open'`),
    pool.query(
      `select count(*)::int as count
       from analytics_events
       where event_type in ('nav_click', 'header_action_click')`,
    ),
    pool.query(
      `select
         coalesce(nullif(category, ''), 'Uncategorized') as category,
         to_char(coalesce(published_at, created_at)::date, 'YYYY-MM-DD') as published_date,
         count(*)::int as count
       from news_posts
       where status = 'published'
       group by 1, 2
       order by 2 desc, 1 asc
       limit 100`,
    ),
    pool.query(
      `select
         coalesce(nullif(label, ''), 'Dashboard') as label,
         target_url,
         count(*)::int as count,
         min(created_at) as first_click,
         max(created_at) as last_click
       from analytics_events
       where event_type = 'dashboard_open'
       group by 1, 2
       order by count desc, last_click desc
       limit 100`,
    ),
    pool.query(
      `select
         event_type,
         coalesce(nullif(label, ''), 'Navigation') as label,
         target_url,
         count(*)::int as count,
         min(created_at) as first_click,
         max(created_at) as last_click
       from analytics_events
       where event_type in ('nav_click', 'header_action_click')
       group by 1, 2, 3
       order by count desc, last_click desc
       limit 100`,
    ),
  ]);

  return {
    totals: {
      dataRequests: countFrom(dataRequestsTotal.rows[0]),
      contactMessages: countFrom(contactMessagesTotal.rows[0]),
      publishedNews: countFrom(publishedNewsTotal.rows[0]),
      draftNews: countFrom(draftNewsTotal.rows[0]),
      dashboardClicks: countFrom(dashboardClicksTotal.rows[0]),
      navClicks: countFrom(navClicksTotal.rows[0]),
    },
    newsByThemeDate: newsByThemeDate.rows.map((row) => ({
      category: row.category,
      publishedDate: row.published_date,
      count: row.count,
    })),
    dashboardClicks: dashboardClicks.rows.map((row) => ({
      label: row.label,
      targetUrl: row.target_url,
      count: row.count,
      firstClick: isoValue(row.first_click),
      lastClick: isoValue(row.last_click),
    })),
    navClicks: navClicks.rows.map((row) => ({
      eventType: row.event_type,
      label: row.label,
      targetUrl: row.target_url,
      count: row.count,
      firstClick: isoValue(row.first_click),
      lastClick: isoValue(row.last_click),
    })),
  };
}

async function getCsv(exportType: string) {
  const pool = getPool();

  if (exportType === "data-requests") {
    const result = await pool.query(
      `select
         request_ref,
         name,
         organization,
         role,
         email,
         phone,
         requester_type,
         data_requested,
         geography,
         time_period,
         intended_use,
         preferred_format,
         deadline,
         status,
         sensitivity_level,
         created_at,
         updated_at
       from data_requests
       order by created_at desc`,
    );

    return toCsv(
      [
        { key: "request_ref", label: "Request reference" },
        { key: "name", label: "Name" },
        { key: "organization", label: "Organization" },
        { key: "role", label: "Role" },
        { key: "email", label: "Email" },
        { key: "phone", label: "Phone" },
        { key: "requester_type", label: "Requester type" },
        { key: "data_requested", label: "Data requested" },
        { key: "geography", label: "Geography" },
        { key: "time_period", label: "Time period" },
        { key: "intended_use", label: "Intended use" },
        { key: "preferred_format", label: "Preferred format" },
        { key: "deadline", label: "Deadline" },
        { key: "status", label: "Status" },
        { key: "sensitivity_level", label: "Sensitivity level" },
        { key: "created_at", label: "Created at" },
        { key: "updated_at", label: "Updated at" },
      ],
      result.rows,
    );
  }

  if (exportType === "contact-messages") {
    const result = await pool.query(
      `select
         name,
         organization,
         email,
         phone,
         enquiry_type,
         subject,
         message,
         status,
         created_at,
         updated_at
       from contact_messages
       order by created_at desc`,
    );

    return toCsv(
      [
        { key: "name", label: "Name" },
        { key: "organization", label: "Organization" },
        { key: "email", label: "Email" },
        { key: "phone", label: "Phone" },
        { key: "enquiry_type", label: "Enquiry type" },
        { key: "subject", label: "Subject" },
        { key: "message", label: "Message" },
        { key: "status", label: "Status" },
        { key: "created_at", label: "Created at" },
        { key: "updated_at", label: "Updated at" },
      ],
      result.rows,
    );
  }

  if (exportType === "news-by-theme-date") {
    const result = await pool.query(
      `select
         coalesce(nullif(category, ''), 'Uncategorized') as category,
         to_char(coalesce(published_at, created_at)::date, 'YYYY-MM-DD') as published_date,
         count(*)::int as count
       from news_posts
       where status = 'published'
       group by 1, 2
       order by 2 desc, 1 asc`,
    );

    return toCsv(
      [
        { key: "category", label: "Theme" },
        { key: "published_date", label: "Published date" },
        { key: "count", label: "Published news count" },
      ],
      result.rows,
    );
  }

  if (exportType === "dashboard-clicks") {
    const result = await pool.query(
      `select
         coalesce(nullif(label, ''), 'Dashboard') as dashboard,
         target_url,
         count(*)::int as clicks,
         min(created_at) as first_click,
         max(created_at) as last_click
       from analytics_events
       where event_type = 'dashboard_open'
       group by 1, 2
       order by clicks desc, last_click desc`,
    );

    return toCsv(
      [
        { key: "dashboard", label: "Dashboard" },
        { key: "target_url", label: "Dashboard URL" },
        { key: "clicks", label: "Clicks" },
        { key: "first_click", label: "First click" },
        { key: "last_click", label: "Last click" },
      ],
      result.rows,
    );
  }

  if (exportType === "nav-clicks") {
    const result = await pool.query(
      `select
         event_type,
         coalesce(nullif(label, ''), 'Navigation') as label,
         target_url,
         count(*)::int as clicks,
         min(created_at) as first_click,
         max(created_at) as last_click
       from analytics_events
       where event_type in ('nav_click', 'header_action_click')
       group by 1, 2, 3
       order by clicks desc, last_click desc`,
    );

    return toCsv(
      [
        { key: "event_type", label: "Event type" },
        { key: "label", label: "Website tab or action" },
        { key: "target_url", label: "Target URL" },
        { key: "clicks", label: "Clicks" },
        { key: "first_click", label: "First click" },
        { key: "last_click", label: "Last click" },
      ],
      result.rows,
    );
  }

  const result = await pool.query(
    `select
       event_type,
       label,
       path,
       target_url,
       created_at
     from analytics_events
     order by created_at desc
     limit 5000`,
  );

  return toCsv(
    [
      { key: "event_type", label: "Event type" },
      { key: "label", label: "Label" },
      { key: "path", label: "Source path" },
      { key: "target_url", label: "Target URL" },
      { key: "created_at", label: "Created at" },
    ],
    result.rows,
  );
}

export async function GET(request: Request) {
  try {
    requireAdminAuth(request);
    const url = new URL(request.url);
    const exportType = url.searchParams.get("export");

    if (exportType) {
      if (!exportTypes.has(exportType)) {
        return NextResponse.json({ message: "Unknown report export type" }, { status: 400 });
      }

      return csvResponse(exportType, await getCsv(exportType));
    }

    return NextResponse.json(await getReportSummary());
  } catch (error) {
    if (error instanceof AdminUnauthorizedError) {
      return unauthorizedResponse();
    }

    return serverErrorResponse(error);
  }
}
