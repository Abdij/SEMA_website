import { NextResponse } from "next/server";
import { AdminUnauthorizedError, requireAdminAuth, unauthorizedResponse } from "@/lib/admin";
import { getPool } from "@/lib/db";

function serverErrorResponse(error: unknown) {
  console.error("[admin/dashboard-access]", error);
  return NextResponse.json({ message: "Internal server error" }, { status: 500 });
}

type Filters = {
  dateFrom?: string;
  dateTo?: string;
  dashboardId?: string;
  organization?: string;
  organizationType?: string;
  activityType?: string;
  country?: string;
  sourcePage?: string;
  language?: string;
};

function parseFilters(url: URL): Filters {
  return {
    dateFrom: url.searchParams.get("dateFrom") || undefined,
    dateTo: url.searchParams.get("dateTo") || undefined,
    dashboardId: url.searchParams.get("dashboardId") || undefined,
    organization: url.searchParams.get("organization") || undefined,
    organizationType: url.searchParams.get("organizationType") || undefined,
    activityType: url.searchParams.get("activityType") || undefined,
    country: url.searchParams.get("country") || undefined,
    sourcePage: url.searchParams.get("sourcePage") || undefined,
    language: url.searchParams.get("language") || undefined,
  };
}

function buildWhere(filters: Filters) {
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
  if (filters.organization) {
    params.push(`%${filters.organization}%`);
    clauses.push(`organization_name ilike $${params.length}`);
  }
  if (filters.organizationType) {
    params.push(filters.organizationType);
    clauses.push(`organization_type = $${params.length}`);
  }
  if (filters.activityType) {
    params.push(filters.activityType);
    clauses.push(`$${params.length} = any(activity_types)`);
  }
  if (filters.country) {
    params.push(`%${filters.country}%`);
    clauses.push(`country_of_operation ilike $${params.length}`);
  }
  if (filters.sourcePage) {
    params.push(`%${filters.sourcePage}%`);
    clauses.push(`source_page ilike $${params.length}`);
  }
  if (filters.language) {
    params.push(filters.language);
    clauses.push(`locale = $${params.length}`);
  }

  return {
    where: clauses.length ? `where ${clauses.join(" and ")}` : "",
    params,
  };
}

const listColumns = `
  id, organization_name, organization_type, organization_type_other,
  activity_types, activity_type_other, country_of_operation,
  dashboard_id, dashboard_title, visitor_country, visitor_region, visitor_city,
  locale, source_page, anonymous_visitor_id, created_at,
  count(*) over (partition by anonymous_visitor_id) as visitor_access_count
`;

async function getList(filters: Filters, limit: number, offset: number) {
  const pool = getPool();
  const { where, params } = buildWhere(filters);

  const dataParams = [...params, limit, offset];
  const [data, total, aggregates] = await Promise.all([
    pool.query(
      `select ${listColumns}
       from dashboard_accesses
       ${where}
       order by created_at desc
       limit $${dataParams.length - 1} offset $${dataParams.length}`,
      dataParams,
    ),
    pool.query(`select count(*)::int as count from dashboard_accesses ${where}`, params),
    Promise.all([
      pool.query(
        `select coalesce(activity_type, 'unspecified') as key, count(*)::int as count
         from dashboard_accesses, unnest(activity_types) as activity_type
         ${where}
         group by 1 order by count desc`,
        params,
      ),
      pool.query(
        `select coalesce(organization_type, 'unspecified') as key, count(*)::int as count
         from dashboard_accesses
         ${where}
         group by 1 order by count desc`,
        params,
      ),
      pool.query(
        `select coalesce(country_of_operation, 'Unspecified') as key, count(*)::int as count
         from dashboard_accesses
         ${where}
         group by 1 order by count desc limit 20`,
        params,
      ),
    ]),
  ]);

  return {
    rows: data.rows.map((row) => ({
      id: row.id,
      organizationName: row.organization_name,
      organizationType: row.organization_type,
      organizationTypeOther: row.organization_type_other,
      activityTypes: row.activity_types,
      activityTypeOther: row.activity_type_other,
      countryOfOperation: row.country_of_operation,
      dashboardId: row.dashboard_id,
      dashboardTitle: row.dashboard_title,
      visitorCountry: row.visitor_country,
      visitorRegion: row.visitor_region,
      visitorCity: row.visitor_city,
      locale: row.locale,
      sourcePage: row.source_page,
      createdAt: row.created_at?.toISOString(),
      isRepeatAccess: Number(row.visitor_access_count || 1) > 1,
    })),
    total: total.rows[0]?.count ?? 0,
    byActivityType: aggregates[0].rows,
    byOrganizationType: aggregates[1].rows,
    byCountry: aggregates[2].rows,
  };
}

function csvEscape(value: unknown) {
  const text = Array.isArray(value)
    ? value.join("; ")
    : value instanceof Date
      ? value.toISOString()
      : String(value ?? "");
  const escaped = text.replace(/"/g, '""');
  return /[",\r\n]/.test(escaped) ? `"${escaped}"` : escaped;
}

function toCsv(columns: { key: string; label: string }[], rows: Record<string, unknown>[]) {
  const header = columns.map((c) => csvEscape(c.label)).join(",");
  const body = rows.map((row) => columns.map((c) => csvEscape(row[c.key])).join(","));
  return [header, ...body].join("\r\n");
}

async function getCsv(filters: Filters) {
  const pool = getPool();
  const { where, params } = buildWhere(filters);

  const result = await pool.query(
    `select organization_name, organization_type, organization_type_other,
            activity_types, activity_type_other, country_of_operation,
            dashboard_title, visitor_country, visitor_region, visitor_city,
            locale, source_page, created_at
     from dashboard_accesses
     ${where}
     order by created_at desc
     limit 20000`,
    params,
  );

  return toCsv(
    [
      { key: "organization_name", label: "Organization name" },
      { key: "organization_type", label: "Organization type" },
      { key: "organization_type_other", label: "Organization type (other)" },
      { key: "activity_types", label: "Areas of activity" },
      { key: "activity_type_other", label: "Activity (other)" },
      { key: "country_of_operation", label: "Country of operation" },
      { key: "dashboard_title", label: "Dashboard" },
      { key: "visitor_country", label: "Approximate visitor country" },
      { key: "visitor_region", label: "Approximate visitor region" },
      { key: "visitor_city", label: "Approximate visitor city" },
      { key: "locale", label: "Language" },
      { key: "source_page", label: "Source page" },
      { key: "created_at", label: "Access date" },
    ],
    result.rows,
  );
}

export async function GET(request: Request) {
  try {
    requireAdminAuth(request);
    const url = new URL(request.url);
    const filters = parseFilters(url);

    if (url.searchParams.get("export") === "csv") {
      console.info("[admin/dashboard-access] CSV export requested", { at: new Date().toISOString() });
      const csv = await getCsv(filters);
      const date = new Date().toISOString().slice(0, 10);
      return new Response(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="sema-dashboard-access-${date}.csv"`,
        },
      });
    }

    const limit = Math.min(Math.max(Number(url.searchParams.get("limit")) || 50, 1), 200);
    const page = Math.max(Number(url.searchParams.get("page")) || 1, 1);
    const offset = (page - 1) * limit;

    const result = await getList(filters, limit, offset);
    return NextResponse.json({ ...result, page, limit });
  } catch (error) {
    if (error instanceof AdminUnauthorizedError) {
      return unauthorizedResponse();
    }
    return serverErrorResponse(error);
  }
}
