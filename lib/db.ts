import { Pool } from "pg";
import {
  dashboardEmbeds as fallbackDashboardEmbeds,
  newsPosts as fallbackNewsPosts,
  publications as fallbackPublications,
} from "./content";
import type { AvailabilityStatus, FilterVerdict } from "./catalogue-constants";

declare global {
  // eslint-disable-next-line no-var
  var semaPool: Pool | undefined;
}

export type NewsPost = {
  slug: string;
  title: string;
  date: string;
  category: string;
  summary: string;
  image: string;
  body: string[];
  sourceLabel?: string;
  sourceUrl?: string;
  status?: string;
};

export type Publication = {
  id?: string;
  title: string;
  type: string;
  description: string;
  href: string;
  source: string;
  publication_date?: string;
  status?: string;
  fileName?: string;
  fileMime?: string;
};

export type DashboardEmbed = {
  id?: string;
  title: string;
  description: string;
  url: string;
  provider?: string;
  public_safe?: boolean;
  status?: string;
  notes?: string;
};

export type ContactMessage = {
  id: string;
  name: string;
  organization?: string;
  email: string;
  phone?: string;
  enquiryType: string;
  subject: string;
  message: string;
  status: string;
  created_at: string;
  updated_at: string;
};

export type DataRequest = {
  id: string;
  requestRef: string;
  name: string;
  organization?: string;
  role?: string;
  email: string;
  phone?: string;
  requesterType: string;
  dataRequested: string;
  geography?: string;
  timePeriod?: string;
  intendedUse: string;
  preferredFormat: string;
  deadline?: string;
  status: string;
  sensitivityLevel: string;
  created_at: string;
  updated_at: string;
};

export type DataRequestStatusHistory = {
  id: string;
  dataRequestId: string;
  status: string;
  note?: string;
  changedBy?: string;
  created_at: string;
};

export type AnalyticsEventInput = {
  eventType: string;
  eventCategory?: string;
  label?: string;
  path?: string;
  targetUrl?: string;
  metadata?: Record<string, unknown>;
  userAgent?: string;
  referer?: string;
  anonymousVisitorId?: string;
  sessionId?: string;
  dashboardAccessId?: string;
  dashboardId?: string;
  dashboardTitle?: string;
  locale?: string;
  countryCode?: string;
  region?: string;
  city?: string;
  deviceCategory?: string;
  browserCategory?: string;
};

export type DashboardAccessInput = {
  organizationName: string;
  organizationType?: string;
  organizationTypeOther?: string;
  activityTypes: string[];
  activityTypeOther?: string;
  countryOfOperation?: string;
  dashboardId?: string;
  dashboardTitle?: string;
  dashboardUrl?: string;
  anonymousVisitorId?: string;
  sessionId?: string;
  visitorCountry?: string;
  visitorRegion?: string;
  visitorCity?: string;
  locale?: string;
  sourcePage?: string;
  referrer?: string;
  userAgent?: string;
  consentGiven: boolean;
  consentVersion: string;
};

export type DashboardAccessRecord = DashboardAccessInput & {
  id: string;
  createdAt: string;
};

export function getPool() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is not configured");
  }

  if (!global.semaPool) {
    global.semaPool = new Pool({
      connectionString,
      ssl:
        connectionString.includes("sslmode=require") ||
        connectionString.includes("supabase") ||
        connectionString.includes("neon.tech")
          ? { rejectUnauthorized: false }
          : undefined,
    });
  }

  return global.semaPool;
}

function tryGetPool() {
  try {
    return getPool();
  } catch {
    return undefined;
  }
}

function paragraphSplit(value: string) {
  return value
    .split(/\r?\n\r?\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

function normalizeImageUrl(url: string | null | undefined): string {
  if (!url) {
    return "/images/mine-survey.jpg";
  }

  const trimmed = url.trim();

  // If the admin pasted a GitHub URL, convert it to a raw content URL
  if (trimmed.includes("github.com")) {
    try {
      const parsedUrl = new URL(trimmed);
      const parts = parsedUrl.pathname.split("/").filter(Boolean);
      // Expected structure for file page: /[username]/[repo]/blob/[branch]/[path...]
      // or /[username]/[repo]/raw/[branch]/[path...]
      // or /[username]/[repo]/tree/[branch]/[path...]
      if (parts.length >= 4 && (parts[2] === "blob" || parts[2] === "raw" || parts[2] === "tree")) {
        const username = parts[0];
        const repo = parts[1];
        const branch = parts[3];
        const filePath = parts.slice(4).join("/");
        return `https://raw.githubusercontent.com/${username}/${repo}/${branch}/${filePath}`;
      }
    } catch {
      // Return original URL if parsing fails
    }
  }

  return trimmed;
}

function normalizeDashboardProvider(provider?: string | null, title?: string | null): string {
  const value = `${provider || ""} ${title || ""}`.toLowerCase();

  if (value.includes("arcgis")) {
    return "arcgis";
  }

  if (value.includes("powerbi") || value.includes("power bi") || value.includes("power_bi")) {
    return "powerbi";
  }

  if (provider === "arcgis" || provider === "powerbi" || provider === "other") {
    return provider;
  }

  return "other";
}

function normalizeDashboardUrl(url: string): string {
  const trimmed = url.trim();

  try {
    const parsedUrl = new URL(trimmed);
    if (parsedUrl.hostname.endsWith("safelinks.protection.outlook.com")) {
      const targetUrl = parsedUrl.searchParams.get("url");
      if (targetUrl) {
        return targetUrl.trim();
      }
    }
  } catch {
    return trimmed;
  }

  return trimmed;
}

function mapFallbackDashboard(item: (typeof fallbackDashboardEmbeds)[number]): DashboardEmbed {
  return {
    title: item.title,
    description: item.description,
    url: item.url ? normalizeDashboardUrl(item.url) : "",
    provider: normalizeDashboardProvider(item.envKey, item.title),
    public_safe: true,
    status: "published",
    notes: item.notes,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapNewsRow(row: any): NewsPost {
  return {
    slug: row.slug,
    title: row.title,
    date: row.published_at ? new Date(row.published_at).toISOString().split("T")[0] : "",
    category: row.category,
    summary: row.summary,
    image: normalizeImageUrl(row.image_url),
    body: row.body ? paragraphSplit(row.body) : [""],
    sourceLabel: row.source_label || undefined,
    sourceUrl: row.source_url || undefined,
    status: row.status,
  };
}

export async function getNewsPosts(limit?: number) {
  const pool = tryGetPool();

  if (!pool) {
    return limit ? fallbackNewsPosts.slice(0, limit) : fallbackNewsPosts;
  }

  const result = await pool.query(
    `select slug, title, summary, image_url, body, category, source_label, source_url, status, published_at
     from news_posts
     where status = 'published'
     order by published_at desc
     limit $1`,
    [limit ?? null],
  );

  return result.rows.map(mapNewsRow);
}

export async function getNewsPostBySlug(slug: string) {
  return findNewsPostBySlug(slug, true);
}

export async function getAdminNewsPostBySlug(slug: string) {
  return findNewsPostBySlug(slug, false);
}

async function findNewsPostBySlug(slug: string, publishedOnly: boolean) {
  const pool = tryGetPool();

  if (!pool) {
    return fallbackNewsPosts.find((post) => post.slug === slug);
  }

  const result = await pool.query(
    `select slug, title, summary, image_url, body, category, source_label, source_url, status, published_at
     from news_posts
     where slug = $1 and ($2::boolean = false or status = 'published')
     limit 1`,
    [slug, publishedOnly],
  );

  if (!result.rows.length) {
    return undefined;
  }

  return mapNewsRow(result.rows[0]);
}

export async function getAdminNewsPosts() {
  const pool = tryGetPool();

  if (!pool) {
    return fallbackNewsPosts;
  }

  const result = await pool.query(
    `select slug, title, summary, image_url, body, category, source_label, source_url, status, published_at
     from news_posts
     order by published_at desc nulls last`,
  );

  if (!result.rows.length) {
    return fallbackNewsPosts;
  }

  return result.rows.map(mapNewsRow);
}

export async function getPublications() {
  const pool = tryGetPool();

  if (!pool) {
    return fallbackPublications;
  }

  const result = await pool.query(
    `select id, title, document_type, description, file_url, file_name, file_mime, source, publication_date, status
     from publications
     where status = 'published'
     order by publication_date desc nulls last`,
  );

  if (!result.rows.length) {
    return fallbackPublications;
  }

  return result.rows.map((row) => ({
    id: row.id,
    title: row.title,
    type: row.document_type,
    description: row.description,
    href: row.file_url || (row.file_name ? `/api/publications/file?id=${row.id}` : ""),
    source: row.source,
    publication_date: row.publication_date ? row.publication_date.toISOString().split("T")[0] : undefined,
    status: row.status,
    fileName: row.file_name || undefined,
    fileMime: row.file_mime || undefined,
  }));
}

export async function getAdminPublications() {
  const pool = tryGetPool();

  if (!pool) {
    return fallbackPublications;
  }

  const result = await pool.query(
    `select id, title, document_type, description, file_url, file_name, file_mime, source, publication_date, status
     from publications
     order by publication_date desc nulls last`,
  );

  if (!result.rows.length) {
    return fallbackPublications;
  }

  return result.rows.map((row) => ({
    id: row.id,
    title: row.title,
    type: row.document_type,
    description: row.description,
    href: row.file_url || (row.file_name ? `/api/publications/file?id=${row.id}` : ""),
    source: row.source,
    publication_date: row.publication_date ? row.publication_date.toISOString().split("T")[0] : undefined,
    status: row.status,
    fileName: row.file_name || undefined,
    fileMime: row.file_mime || undefined,
  }));
}

export async function getDashboardEmbeds() {
  const pool = tryGetPool();

  if (!pool) {
    // Registration requires the database. Show unavailable placeholders
    // rather than exposing an ungated environment-configured embed URL.
    return fallbackDashboardEmbeds.map((item) => ({ ...mapFallbackDashboard(item), url: "" }));
  }

  const result = await pool.query(
    `select id, title, provider, description, embed_url, public_safe, status
     from dashboard_embeds
     where status = 'published' and public_safe = true
     order by created_at desc`,
  );

  // Intentionally omit the raw embed_url here: this list feeds the public
  // dashboards page, which now gates access behind the organization form.
  // The trusted URL is only ever returned server-side, after a successful
  // registration/reuse, via POST /api/dashboard-access.
  return result.rows.map((row) => ({
    id: row.id as string,
    title: row.title,
    description: row.description,
    provider: row.provider,
    public_safe: row.public_safe,
    status: row.status,
    notes: row.public_safe ? "Published dashboard embed." : "Private or draft dashboard embed.",
  }));
}

export async function getAdminDashboardEmbeds() {
  const pool = tryGetPool();

  if (!pool) {
    return fallbackDashboardEmbeds.map(mapFallbackDashboard);
  }

  const result = await pool.query(
    `select id, title, provider, description, embed_url, public_safe, status
     from dashboard_embeds
     order by created_at desc`,
  );

  if (!result.rows.length) {
    return fallbackDashboardEmbeds.map(mapFallbackDashboard);
  }

  return result.rows.map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description,
    url: row.embed_url,
    provider: row.provider,
    public_safe: row.public_safe,
    status: row.status,
    notes: row.public_safe ? "Published dashboard embed." : "Private or draft dashboard embed.",
  }));
}

export async function createNewsPost(input: {
  slug: string;
  title: string;
  category: string;
  summary: string;
  image?: string;
  body: string | string[];
  sourceLabel?: string;
  sourceUrl?: string;
  date?: string;
  status?: string;
}) {
  const pool = getPool();
  const bodyText = Array.isArray(input.body) ? input.body.join("\n\n") : input.body;
  const publishedAt = input.date || new Date().toISOString();

  const result = await pool.query(
    `insert into news_posts (slug, title, summary, image_url, body, category, source_label, source_url, published_at, status)
     values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     returning *`,
    [
      input.slug,
      input.title,
      input.summary,
      input.image || null,
      bodyText,
      input.category,
      input.sourceLabel || null,
      input.sourceUrl || null,
      publishedAt,
      input.status || "published",
    ],
  );

  return mapNewsRow(result.rows[0]);
}

export async function updateNewsPost(slug: string, input: {
  title?: string;
  category?: string;
  summary?: string;
  image?: string;
  body?: string | string[];
  sourceLabel?: string;
  sourceUrl?: string;
  date?: string;
  status?: string;
}) {
  const pool = getPool();
  const bodyText = input.body ? (Array.isArray(input.body) ? input.body.join("\n\n") : input.body) : null;
  const publishedAt = input.date || null;

  const result = await pool.query(
    `update news_posts set
      title = coalesce($1, title),
      summary = coalesce($2, summary),
      image_url = coalesce($3, image_url),
      body = coalesce($4, body),
      category = coalesce($5, category),
      source_label = coalesce($6, source_label),
      source_url = coalesce($7, source_url),
      published_at = coalesce($8, published_at),
      status = coalesce($9, status),
      updated_at = now()
     where slug = $10
     returning *`,
    [
      input.title || null,
      input.summary || null,
      input.image || null,
      bodyText,
      input.category || null,
      input.sourceLabel || null,
      input.sourceUrl || null,
      publishedAt,
      input.status || null,
      slug,
    ],
  );

  if (!result.rows.length) {
    throw new Error("News post not found");
  }

  return mapNewsRow(result.rows[0]);
}

export async function deleteNewsPost(slug: string) {
  const pool = getPool();
  await pool.query(`delete from news_posts where slug = $1`, [slug]);
}

export async function createPublication(input: {
  title: string;
  type: string;
  description: string;
  href?: string;
  source: string;
  publication_date?: string;
  status?: string;
  fileName?: string;
  fileMime?: string;
  fileData?: string;
}) {
  const pool = getPool();
  const fileBuffer = input.fileData ? Buffer.from(input.fileData, "base64") : null;

  if (!input.href && !fileBuffer) {
    throw new Error("Publication requires either a URL or an uploaded file");
  }

  const result = await pool.query(
    `insert into publications (title, document_type, description, file_url, source, publication_date, status, file_name, file_mime, file_data)
     values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     returning *`,
    [
      input.title,
      input.type,
      input.description,
      input.href || null,
      input.source,
      input.publication_date || null,
      input.status || "published",
      input.fileName || null,
      input.fileMime || null,
      fileBuffer,
    ],
  );

  const row = result.rows[0];
  return {
    id: row.id,
    title: row.title,
    type: row.document_type,
    description: row.description,
    href: row.file_url || (row.file_name ? `/api/publications/file?id=${row.id}` : ""),
    source: row.source,
    publication_date: row.publication_date ? row.publication_date.toISOString().split("T")[0] : undefined,
    status: row.status,
    fileName: row.file_name || undefined,
    fileMime: row.file_mime || undefined,
  };
}

export async function updatePublication(id: string, input: {
  title?: string;
  type?: string;
  description?: string;
  href?: string;
  source?: string;
  publication_date?: string;
  status?: string;
  fileName?: string;
  fileMime?: string;
  fileData?: string;
}) {
  const pool = getPool();
  const fileBuffer = input.fileData ? Buffer.from(input.fileData, "base64") : null;
  const result = await pool.query(
    `update publications set
      title = coalesce($11, title),
      document_type = coalesce($1, document_type),
      description = coalesce($2, description),
      file_url = coalesce($3, file_url),
      source = coalesce($4, source),
      publication_date = coalesce($5, publication_date),
      status = coalesce($6, status),
      file_name = coalesce($7, file_name),
      file_mime = coalesce($8, file_mime),
      file_data = coalesce($9, file_data),
      updated_at = now()
     where id = $10
     returning *`,
    [
      input.type || null,
      input.description || null,
      input.href || null,
      input.source || null,
      input.publication_date || null,
      input.status || null,
      input.fileName || null,
      input.fileMime || null,
      fileBuffer,
      id,
      input.title?.trim() || null,
    ],
  );

  if (!result.rows.length) {
    throw new Error("Publication not found");
  }

  const row = result.rows[0];
  return {
    id: row.id,
    title: row.title,
    type: row.document_type,
    description: row.description,
    href: row.file_url || (row.file_name ? `/api/publications/file?id=${row.id}` : ""),
    source: row.source,
    publication_date: row.publication_date ? row.publication_date.toISOString().split("T")[0] : undefined,
    status: row.status,
    fileName: row.file_name || undefined,
    fileMime: row.file_mime || undefined,
  };
}

export async function deletePublication(id: string) {
  const pool = getPool();
  await pool.query(`delete from publications where id = $1`, [id]);
}

export async function createDashboardEmbed(input: {
  title: string;
  description: string;
  url: string;
  provider?: string;
  public_safe?: boolean;
  status?: string;
}) {
  const pool = getPool();
  const result = await pool.query(
    `insert into dashboard_embeds (title, provider, description, embed_url, public_safe, status)
     values ($1, $2, $3, $4, $5, $6)
     returning *`,
    [
      input.title,
      normalizeDashboardProvider(input.provider, input.title),
      input.description,
      normalizeDashboardUrl(input.url),
      input.public_safe ?? false,
      input.status || "published",
    ],
  );

  return {
    id: result.rows[0].id,
    title: result.rows[0].title,
    description: result.rows[0].description,
    url: result.rows[0].embed_url,
    provider: result.rows[0].provider,
    public_safe: result.rows[0].public_safe,
    status: result.rows[0].status,
    notes: "Published dashboard embed.",
  };
}

export async function updateDashboardEmbed(identifier: { id?: string; title?: string }, input: {
  title?: string;
  description?: string;
  url?: string;
  provider?: string;
  public_safe?: boolean;
  status?: string;
}) {
  const pool = getPool();
  const whereValue = identifier.id || identifier.title;

  if (!whereValue) {
    throw new Error("Dashboard embed identifier is required");
  }

  const whereClause = identifier.id ? "id = $7" : "title = $7";
  const result = await pool.query(
    `update dashboard_embeds set
      title = coalesce($1, title),
      description = coalesce($2, description),
      embed_url = coalesce($3, embed_url),
      provider = coalesce($4, provider),
      public_safe = coalesce($5, public_safe),
      status = coalesce($6, status),
      updated_at = now()
     where ${whereClause}
     returning *`,
    [
      input.title || null,
      input.description || null,
      input.url ? normalizeDashboardUrl(input.url) : null,
      input.provider ? normalizeDashboardProvider(input.provider, input.title) : null,
      input.public_safe,
      input.status || null,
      whereValue,
    ],
  );

  if (!result.rows.length) {
    throw new Error("Dashboard embed not found");
  }

  return {
    id: result.rows[0].id,
    title: result.rows[0].title,
    description: result.rows[0].description,
    url: result.rows[0].embed_url,
    provider: result.rows[0].provider,
    public_safe: result.rows[0].public_safe,
    status: result.rows[0].status,
    notes: "Published dashboard embed.",
  };
}

export async function deleteDashboardEmbed(identifier: { id?: string; title?: string }) {
  const pool = getPool();
  const whereValue = identifier.id || identifier.title;

  if (!whereValue) {
    throw new Error("Dashboard embed identifier is required");
  }

  const whereClause = identifier.id ? "id = $1" : "title = $1";
  await pool.query(`delete from dashboard_embeds where ${whereClause}`, [whereValue]);
}

export function requireString(value: unknown, label: string) {
  if (typeof value !== "string") {
    throw new Error(`${label} is required`);
  }

  const trimmed = value.trim();

  if (!trimmed) {
    throw new Error(`${label} is required`);
  }

  return trimmed;
}

export async function insertContactMessage(input: {
  name: string;
  organization?: string;
  email: string;
  phone?: string;
  enquiryType: string;
  subject: string;
  message: string;
}) {
  const pool = getPool();

  const result = await pool.query(
    `insert into contact_messages (name, organization, email, phone, enquiry_type, subject, message)
     values ($1, $2, $3, $4, $5, $6, $7)
     returning *`,
    [
      input.name,
      input.organization || null,
      input.email,
      input.phone || null,
      input.enquiryType,
      input.subject,
      input.message,
    ],
  );

  return result.rows[0];
}

export async function insertDataRequest(input: {
  name: string;
  organization?: string;
  role?: string;
  email: string;
  phone?: string;
  requesterType: string;
  dataRequested: string;
  geography?: string;
  timePeriod?: string;
  intendedUse: string;
  preferredFormat: string;
  deadline?: string;
}) {
  const pool = getPool();

  const result = await pool.query(
    `insert into data_requests (name, organization, role, email, phone, requester_type, data_requested, geography, time_period, intended_use, preferred_format, deadline)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
     returning *`,
    [
      input.name,
      input.organization || null,
      input.role || null,
      input.email,
      input.phone || null,
      input.requesterType,
      input.dataRequested,
      input.geography || null,
      input.timePeriod || null,
      input.intendedUse,
      input.preferredFormat,
      input.deadline || null,
    ],
  );

  return result.rows[0];
}

export async function getContactMessages() {
  const pool = getPool();
  const result = await pool.query(
    `select id, name, organization, email, phone, enquiry_type, subject, message, status, created_at, updated_at
     from contact_messages
     order by created_at desc`,
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return result.rows.map((row: any) => ({
    id: row.id,
    name: row.name,
    organization: row.organization || undefined,
    email: row.email,
    phone: row.phone || undefined,
    enquiryType: row.enquiry_type,
    subject: row.subject,
    message: row.message,
    status: row.status,
    created_at: row.created_at?.toISOString(),
    updated_at: row.updated_at?.toISOString(),
  }));
}

export async function updateContactMessageStatus(id: string, status: string) {
  const pool = getPool();
  const result = await pool.query(
    `update contact_messages set status = $1, updated_at = now()
     where id = $2
     returning id, name, organization, email, phone, enquiry_type, subject, message, status, created_at, updated_at`,
    [status, id],
  );

  if (!result.rows.length) {
    throw new Error("Contact message not found");
  }

  const row = result.rows[0];
  return {
    id: row.id,
    name: row.name,
    organization: row.organization || undefined,
    email: row.email,
    phone: row.phone || undefined,
    enquiryType: row.enquiry_type,
    subject: row.subject,
    message: row.message,
    status: row.status,
    created_at: row.created_at?.toISOString(),
    updated_at: row.updated_at?.toISOString(),
  };
}

export async function getDataRequests() {
  const pool = getPool();
  const result = await pool.query(
    `select id, request_ref, name, organization, role, email, phone, requester_type, data_requested, geography, time_period, intended_use, preferred_format, deadline, status, sensitivity_level, created_at, updated_at
     from data_requests
     order by created_at desc`,
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return result.rows.map((row: any) => ({
    id: row.id,
    requestRef: row.request_ref,
    name: row.name,
    organization: row.organization || undefined,
    role: row.role || undefined,
    email: row.email,
    phone: row.phone || undefined,
    requesterType: row.requester_type,
    dataRequested: row.data_requested,
    geography: row.geography || undefined,
    timePeriod: row.time_period || undefined,
    intendedUse: row.intended_use,
    preferredFormat: row.preferred_format,
    deadline: row.deadline ? row.deadline.toISOString().split("T")[0] : undefined,
    status: row.status,
    sensitivityLevel: row.sensitivity_level,
    created_at: row.created_at?.toISOString(),
    updated_at: row.updated_at?.toISOString(),
  }));
}

export async function addDataRequestStatusHistory(dataRequestId: string, status: string, note?: string, changedBy?: string) {
  const pool = getPool();
  const result = await pool.query(
    `insert into data_request_status_history (data_request_id, status, note, changed_by)
     values ($1, $2, $3, $4)
     returning id, data_request_id, status, note, changed_by, created_at`,
    [dataRequestId, status, note || null, changedBy || null],
  );

  return {
    id: result.rows[0].id,
    dataRequestId: result.rows[0].data_request_id,
    status: result.rows[0].status,
    note: result.rows[0].note || undefined,
    changedBy: result.rows[0].changed_by || undefined,
    created_at: result.rows[0].created_at?.toISOString(),
  };
}

export async function updateDataRequestStatus(
  id: string,
  status: string | undefined,
  sensitivityLevel: string | undefined,
  note?: string,
  changedBy?: string,
) {
  const pool = getPool();

  const result = await pool.query(
    `update data_requests set
      status = coalesce($1, status),
      sensitivity_level = coalesce($2, sensitivity_level),
      updated_at = now()
     where id = $3
     returning id, request_ref, name, organization, role, email, phone, requester_type, data_requested, geography, time_period, intended_use, preferred_format, deadline, status, sensitivity_level, created_at, updated_at`,
    [status || null, sensitivityLevel || null, id],
  );

  if (!result.rows.length) {
    throw new Error("Data request not found");
  }

  if (status) {
    await addDataRequestStatusHistory(id, status, note, changedBy);
  }

  const row = result.rows[0];
  return {
    id: row.id,
    requestRef: row.request_ref,
    name: row.name,
    organization: row.organization || undefined,
    role: row.role || undefined,
    email: row.email,
    phone: row.phone || undefined,
    requesterType: row.requester_type,
    dataRequested: row.data_requested,
    geography: row.geography || undefined,
    timePeriod: row.time_period || undefined,
    intendedUse: row.intended_use,
    preferredFormat: row.preferred_format,
    deadline: row.deadline ? row.deadline.toISOString().split("T")[0] : undefined,
    status: row.status,
    sensitivityLevel: row.sensitivity_level,
    created_at: row.created_at?.toISOString(),
    updated_at: row.updated_at?.toISOString(),
  };
}

export async function recordAnalyticsEvent(input: AnalyticsEventInput) {
  const pool = getPool();

  await pool.query(
    `insert into analytics_events (
       event_type, label, path, target_url, metadata, user_agent, referer,
       anonymous_visitor_id, session_id, dashboard_access_id, event_category,
       dashboard_id, dashboard_title, locale, country_code, region, city,
       device_category, browser_category
     )
     values ($1, $2, $3, $4, $5::jsonb, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)`,
    [
      input.eventType,
      input.label || null,
      input.path || null,
      input.targetUrl || null,
      JSON.stringify(input.metadata ?? {}),
      input.userAgent || null,
      input.referer || null,
      input.anonymousVisitorId || null,
      input.sessionId || null,
      input.dashboardAccessId || null,
      input.eventCategory || null,
      input.dashboardId || null,
      input.dashboardTitle || null,
      input.locale || null,
      input.countryCode || null,
      input.region || null,
      input.city || null,
      input.deviceCategory || null,
      input.browserCategory || null,
    ],
  );
}

export async function getPublishedDashboardById(id: string) {
  const pool = getPool();

  const result = await pool.query(
    `select id, title, provider, description, embed_url, public_safe, status
     from dashboard_embeds
     where id = $1 and status = 'published' and public_safe = true`,
    [id],
  );

  return result.rows[0] || null;
}

export async function hasValidDashboardRegistration(
  id: string,
  visitorId: string,
  consentVersion: string,
  rememberDays: number,
): Promise<boolean> {
  const result = await getPool().query(
    `select id from dashboard_accesses
     where id = $1 and anonymous_visitor_id = $2
       and consent_given = true and consent_version = $3
       and created_at > now() - ($4::integer * interval '1 day')
     limit 1`,
    [id, visitorId, consentVersion, rememberDays],
  );
  return result.rows.length > 0;
}

export async function createDashboardAccess(input: DashboardAccessInput): Promise<DashboardAccessRecord> {
  const pool = getPool();

  const result = await pool.query(
    `insert into dashboard_accesses (
       organization_name, organization_type, organization_type_other,
       activity_types, activity_type_other, country_of_operation,
       dashboard_id, dashboard_title, dashboard_url,
       anonymous_visitor_id, session_id,
       visitor_country, visitor_region, visitor_city,
       locale, source_page, referrer, user_agent,
       consent_given, consent_version
     ) values (
       $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20
     )
     returning id, created_at`,
    [
      input.organizationName,
      input.organizationType || null,
      input.organizationTypeOther || null,
      input.activityTypes,
      input.activityTypeOther || null,
      input.countryOfOperation || null,
      input.dashboardId || null,
      input.dashboardTitle || null,
      input.dashboardUrl || null,
      input.anonymousVisitorId || null,
      input.sessionId || null,
      input.visitorCountry || null,
      input.visitorRegion || null,
      input.visitorCity || null,
      input.locale || null,
      input.sourcePage || null,
      input.referrer || null,
      input.userAgent || null,
      input.consentGiven,
      input.consentVersion,
    ],
  );

  const row = result.rows[0];

  return {
    ...input,
    id: row.id,
    createdAt: row.created_at.toISOString(),
  };
}

// ===========================================================================
// Data Catalogue
//
// Public metadata about mine-action data availability. These functions never
// return raw IMSMA records, PII, or exact hazard coordinates -- only
// aggregate counts, date ranges, and status breakdowns.
// ===========================================================================

export type CatalogueGeoLevel = "state" | "region" | "district" | "settlement";

export type CatalogueGeoArea = {
  id: string;
  level: CatalogueGeoLevel;
  parentId?: string;
  slug: string;
  name: string;
  pcode?: string;
  geojsonFeatureId?: string;
  isOfficial: boolean;
  dataQualityNote?: string;
  parentSlug?: string;
  parentName?: string;
  parentLevel?: CatalogueGeoLevel;
};

export type CatalogueDataset = {
  id: string;
  slug: string;
  name: string;
  category: string;
  description?: string;
  statusOptions: string[];
  displayOrder: number;
  status: string;
};

export type CatalogueDatasetSummary = CatalogueDataset & {
  areasWithData: number;
  totalRecordCount: number;
  earliestDate?: string;
  latestDate?: string;
};

export type CatalogueDatasetAvailabilityRow = {
  datasetSlug: string;
  datasetName: string;
  category: string;
  statusOptions: string[];
  availability: AvailabilityStatus;
  recordCount: number;
  earliestDate?: string;
  latestDate?: string;
  notes?: string;
};

export type CatalogueIndicators = {
  regionsRepresented: number;
  districtsRepresented: number;
  settlementsRepresented: number;
  datasetCategoriesCount: number;
  earliestYear?: number;
  latestYear?: number;
  catalogueLastUpdated?: string;
};

export type CatalogueSyncLog = {
  id: string;
  startedAt: string;
  finishedAt?: string;
  status: string;
  triggeredBy: string;
  datasetsSynced: string[];
  recordsProcessed: number;
  errorMessage?: string;
  details: Record<string, unknown>;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapGeoAreaRow(row: any): CatalogueGeoArea {
  return {
    id: row.id,
    level: row.level,
    parentId: row.parent_id || undefined,
    slug: row.slug,
    name: row.name,
    pcode: row.pcode || undefined,
    geojsonFeatureId: row.geojson_feature_id || undefined,
    isOfficial: row.is_official,
    dataQualityNote: row.data_quality_note || undefined,
    parentSlug: row.parent_slug || undefined,
    parentName: row.parent_name || undefined,
    parentLevel: row.parent_level || undefined,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapDatasetRow(row: any): CatalogueDataset {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    category: row.category,
    description: row.description || undefined,
    statusOptions: row.status_options || [],
    displayOrder: row.display_order,
    status: row.status,
  };
}

function toDateString(value: unknown): string | undefined {
  if (!value) return undefined;
  if (value instanceof Date) return value.toISOString().split("T")[0];
  return String(value);
}

async function getDatasetAvailabilityForArea(
  pool: Pool,
  areaId: string,
): Promise<CatalogueDatasetAvailabilityRow[]> {
  const result = await pool.query(
    `with direct as (
       select dataset_id, record_count, earliest_date, latest_date, access_classification, data_quality_flag, notes
       from catalogue_dataset_geo_stats
       where geo_area_id = $1
     ),
     rollup as (
       select s.dataset_id,
              sum(s.record_count) as record_count,
              min(s.earliest_date) as earliest_date,
              max(s.latest_date) as latest_date,
              bool_or(s.access_classification = 'restricted') as any_restricted
       from catalogue_dataset_geo_stats s
       join catalogue_geo_areas ga on ga.id = s.geo_area_id
       where ga.parent_id = $1
       group by s.dataset_id
     )
     select d.slug as dataset_slug, d.name as dataset_name, d.category, d.status_options,
            coalesce(direct.record_count, rollup.record_count, 0) as record_count,
            coalesce(direct.earliest_date, rollup.earliest_date) as earliest_date,
            coalesce(direct.latest_date, rollup.latest_date) as latest_date,
            case
              when direct.dataset_id is not null then direct.access_classification
              when rollup.any_restricted then 'restricted'
              else 'public'
            end as access_classification,
            direct.data_quality_flag,
            direct.notes
     from catalogue_datasets d
     left join direct on direct.dataset_id = d.id
     left join rollup on rollup.dataset_id = d.id
     where d.status = 'published'
     order by d.display_order asc`,
    [areaId],
  );

  return result.rows.map((row) => {
    const recordCount = Number(row.record_count) || 0;
    let availability: AvailabilityStatus;

    if (row.data_quality_flag === "verification_required") {
      availability = "verification_required";
    } else if (recordCount === 0) {
      availability = "none";
    } else if (row.access_classification === "restricted") {
      availability = "restricted";
    } else if (row.data_quality_flag === "needs_review") {
      availability = "partial";
    } else {
      availability = "available";
    }

    return {
      datasetSlug: row.dataset_slug,
      datasetName: row.dataset_name,
      category: row.category,
      statusOptions: row.status_options || [],
      availability,
      recordCount,
      earliestDate: toDateString(row.earliest_date),
      latestDate: toDateString(row.latest_date),
      notes: row.notes || undefined,
    };
  });
}

export async function getCatalogueLastUpdated(): Promise<string | undefined> {
  const pool = tryGetPool();
  if (!pool) return undefined;

  const result = await pool.query(
    `select greatest(
       coalesce((select max(updated_at) from catalogue_dataset_geo_stats), 'epoch'::timestamptz),
       coalesce((select max(finished_at) from catalogue_sync_log where status in ('success', 'partial')), 'epoch'::timestamptz)
     ) as last_updated`,
  );

  const value = result.rows[0]?.last_updated;
  if (!value || new Date(value).getTime() === 0) return undefined;
  return new Date(value).toISOString();
}

export async function getCatalogueIndicators(): Promise<CatalogueIndicators> {
  const pool = tryGetPool();
  const empty: CatalogueIndicators = {
    regionsRepresented: 0,
    districtsRepresented: 0,
    settlementsRepresented: 0,
    datasetCategoriesCount: 0,
  };

  if (!pool) return empty;

  const result = await pool.query(
    `with areas_with_data as (
       select distinct ga.id, ga.level, ga.parent_id
       from catalogue_dataset_geo_stats s
       join catalogue_geo_areas ga on ga.id = s.geo_area_id
     ),
     regions_with_data as (
       select id from areas_with_data where level = 'region'
       union
       select parent_id from areas_with_data where level = 'district' and parent_id is not null
     )
     select
       (select count(*) from regions_with_data) as regions_represented,
       (select count(*) from areas_with_data where level = 'district') as districts_represented,
       (select coalesce(sum(settlements_represented), 0) from catalogue_dataset_geo_stats) as settlements_represented,
       (select count(distinct category) from catalogue_datasets d where d.status = 'published' and exists (
         select 1 from catalogue_dataset_geo_stats s where s.dataset_id = d.id
       )) as dataset_categories_count,
       (select min(earliest_date) from catalogue_dataset_geo_stats) as earliest_date,
       (select max(latest_date) from catalogue_dataset_geo_stats) as latest_date`,
  );

  const row = result.rows[0];
  const catalogueLastUpdated = await getCatalogueLastUpdated();

  return {
    regionsRepresented: Number(row.regions_represented) || 0,
    districtsRepresented: Number(row.districts_represented) || 0,
    settlementsRepresented: Number(row.settlements_represented) || 0,
    datasetCategoriesCount: Number(row.dataset_categories_count) || 0,
    earliestYear: row.earliest_date ? new Date(row.earliest_date).getFullYear() : undefined,
    latestYear: row.latest_date ? new Date(row.latest_date).getFullYear() : undefined,
    catalogueLastUpdated,
  };
}

export async function getCatalogueDatasets(): Promise<CatalogueDatasetSummary[]> {
  const pool = tryGetPool();
  if (!pool) return [];

  const result = await pool.query(
    `select
       d.id, d.slug, d.name, d.category, d.description, d.status_options, d.display_order, d.status,
       count(distinct s.geo_area_id) as areas_with_data,
       coalesce(sum(s.record_count), 0) as total_record_count,
       min(s.earliest_date) as earliest_date,
       max(s.latest_date) as latest_date
     from catalogue_datasets d
     left join catalogue_dataset_geo_stats s on s.dataset_id = d.id
     where d.status = 'published'
     group by d.id, d.slug, d.name, d.category, d.description, d.status_options, d.display_order, d.status
     order by d.display_order asc`,
  );

  return result.rows.map((row) => ({
    ...mapDatasetRow(row),
    areasWithData: Number(row.areas_with_data) || 0,
    totalRecordCount: Number(row.total_record_count) || 0,
    earliestDate: toDateString(row.earliest_date),
    latestDate: toDateString(row.latest_date),
  }));
}

export async function getCatalogueDatasetBySlug(slug: string) {
  const pool = tryGetPool();
  if (!pool) return undefined;

  const datasetResult = await pool.query(
    `select id, slug, name, category, description, status_options, display_order, status
     from catalogue_datasets
     where slug = $1 and status = 'published'
     limit 1`,
    [slug],
  );

  if (!datasetResult.rows.length) return undefined;
  const dataset = mapDatasetRow(datasetResult.rows[0]);

  const [coverageResult, statusResult, yearResult] = await Promise.all([
    pool.query(
      `select ga.level, count(*) as area_count, coalesce(sum(s.record_count), 0) as total,
              min(s.earliest_date) as earliest_date, max(s.latest_date) as latest_date
       from catalogue_dataset_geo_stats s
       join catalogue_geo_areas ga on ga.id = s.geo_area_id
       where s.dataset_id = $1
       group by ga.level`,
      [dataset.id],
    ),
    pool.query(
      `select status, sum(count) as count
       from catalogue_dataset_status_counts
       where dataset_id = $1
       group by status
       order by status asc`,
      [dataset.id],
    ),
    pool.query(
      `select year, sum(count) as count
       from catalogue_dataset_year_counts
       where dataset_id = $1
       group by year
       order by year asc`,
      [dataset.id],
    ),
  ]);

  const regionCoverage = coverageResult.rows.find((row) => row.level === "region");
  const districtCoverage = coverageResult.rows.find((row) => row.level === "district");
  const earliestDate = coverageResult.rows.reduce<string | undefined>((min, row) => {
    const value = toDateString(row.earliest_date);
    if (!value) return min;
    return !min || value < min ? value : min;
  }, undefined);
  const latestDate = coverageResult.rows.reduce<string | undefined>((max, row) => {
    const value = toDateString(row.latest_date);
    if (!value) return max;
    return !max || value > max ? value : max;
  }, undefined);

  return {
    dataset,
    regionsWithData: Number(regionCoverage?.area_count) || 0,
    districtsWithData: Number(districtCoverage?.area_count) || 0,
    totalRecordCount: coverageResult.rows.reduce((sum, row) => sum + (Number(row.total) || 0), 0),
    earliestDate,
    latestDate,
    statusCounts: statusResult.rows.map((row) => ({ status: row.status, count: Number(row.count) || 0 })),
    yearCounts: yearResult.rows.map((row) => ({ year: Number(row.year), count: Number(row.count) || 0 })),
  };
}

export async function getCatalogueGeoAreas(level?: string, parentId?: string): Promise<CatalogueGeoArea[]> {
  const pool = tryGetPool();
  if (!pool) return [];

  const conditions: string[] = [];
  const params: unknown[] = [];

  if (level) {
    params.push(level);
    conditions.push(`level = $${params.length}`);
  }

  if (parentId) {
    params.push(parentId);
    conditions.push(`parent_id = $${params.length}`);
  }

  const where = conditions.length ? `where ${conditions.join(" and ")}` : "";

  const result = await pool.query(
    `select id, level, parent_id, slug, name, pcode, geojson_feature_id, is_official, data_quality_note
     from catalogue_geo_areas
     ${where}
     order by name asc`,
    params,
  );

  return result.rows.map(mapGeoAreaRow);
}

export async function getCatalogueGeoAreaBySlug(slug: string): Promise<CatalogueGeoArea | undefined> {
  const pool = tryGetPool();
  if (!pool) return undefined;

  const result = await pool.query(
    `select ga.id, ga.level, ga.parent_id, ga.slug, ga.name, ga.pcode, ga.geojson_feature_id, ga.is_official, ga.data_quality_note,
            parent.slug as parent_slug, parent.name as parent_name, parent.level as parent_level
     from catalogue_geo_areas ga
     left join catalogue_geo_areas parent on parent.id = ga.parent_id
     where ga.slug = $1
     limit 1`,
    [slug],
  );

  if (!result.rows.length) return undefined;
  return mapGeoAreaRow(result.rows[0]);
}

export async function getCatalogueRegionProfile(slug: string) {
  const pool = tryGetPool();
  if (!pool) return undefined;

  const area = await getCatalogueGeoAreaBySlug(slug);
  if (!area || area.level !== "region") return undefined;

  const [availability, districtsResult] = await Promise.all([
    getDatasetAvailabilityForArea(pool, area.id),
    pool.query(
      `select ga.slug, ga.name, coalesce(sum(s.record_count), 0) as record_count
       from catalogue_geo_areas ga
       left join catalogue_dataset_geo_stats s on s.geo_area_id = ga.id
       where ga.parent_id = $1 and ga.level = 'district'
       group by ga.id, ga.slug, ga.name
       order by ga.name asc`,
      [area.id],
    ),
  ]);

  return {
    area,
    availability,
    districts: districtsResult.rows.map((row) => ({
      slug: row.slug,
      name: row.name,
      hasData: (Number(row.record_count) || 0) > 0,
    })),
  };
}

export async function getCatalogueDistrictProfile(slug: string) {
  const pool = tryGetPool();
  if (!pool) return undefined;

  const area = await getCatalogueGeoAreaBySlug(slug);
  if (!area || area.level !== "district") return undefined;

  const availability = await getDatasetAvailabilityForArea(pool, area.id);

  return { area, availability };
}

export async function searchCatalogueLocations(query: string) {
  const pool = tryGetPool();
  const trimmed = query.trim();
  if (!pool || !trimmed) return [];

  const result = await pool.query(
    `select ga.slug, ga.name, ga.level, parent.name as parent_name, parent.level as parent_level
     from catalogue_geo_areas ga
     left join catalogue_geo_areas parent on parent.id = ga.parent_id
     where ga.name ilike $1
     order by ga.level asc, ga.name asc
     limit 20`,
    [`%${trimmed}%`],
  );

  return result.rows.map((row) => ({
    slug: row.slug,
    name: row.name,
    level: row.level as CatalogueGeoLevel,
    parentName: row.parent_name || undefined,
    parentLevel: (row.parent_level as CatalogueGeoLevel) || undefined,
  }));
}

export type CatalogueCombinationFilterInput = {
  datasetSlug: string;
  regionSlug?: string;
  districtSlug?: string;
  status?: string;
  yearFrom?: number;
  yearTo?: number;
};

export type CatalogueCombinationFilterResult = {
  verdict: FilterVerdict;
  datasetName?: string;
  recordCount?: number;
  earliestDate?: string;
  latestDate?: string;
  reason?: string;
};

export async function getCatalogueCombinationFilter(
  params: CatalogueCombinationFilterInput,
): Promise<CatalogueCombinationFilterResult> {
  const pool = tryGetPool();
  if (!pool) {
    return { verdict: "verification_required", reason: "catalogue_unavailable" };
  }

  const datasetResult = await pool.query(
    `select id, name from catalogue_datasets where slug = $1 and status = 'published' limit 1`,
    [params.datasetSlug],
  );

  if (!datasetResult.rows.length) {
    return { verdict: "no_records_identified", reason: "unknown_dataset" };
  }

  const dataset = datasetResult.rows[0];
  const geoSlug = params.districtSlug || params.regionSlug;

  if (!geoSlug) {
    const totalsResult = await pool.query(
      `select coalesce(sum(record_count), 0) as total, min(earliest_date) as earliest_date, max(latest_date) as latest_date
       from catalogue_dataset_geo_stats
       where dataset_id = $1`,
      [dataset.id],
    );
    const total = Number(totalsResult.rows[0]?.total) || 0;
    return {
      verdict: total > 0 ? "data_identified" : "no_records_identified",
      datasetName: dataset.name,
      recordCount: total,
      earliestDate: toDateString(totalsResult.rows[0]?.earliest_date),
      latestDate: toDateString(totalsResult.rows[0]?.latest_date),
    };
  }

  const areaResult = await pool.query(`select id from catalogue_geo_areas where slug = $1 limit 1`, [geoSlug]);
  if (!areaResult.rows.length) {
    return { verdict: "verification_required", datasetName: dataset.name, reason: "unknown_location" };
  }

  const areaId = areaResult.rows[0].id;
  const availability = await getDatasetAvailabilityForArea(pool, areaId);
  const row = availability.find((item) => item.datasetSlug === params.datasetSlug);

  if (!row || row.availability === "none") {
    return { verdict: "no_records_identified", datasetName: dataset.name };
  }

  if (row.availability === "verification_required") {
    return { verdict: "verification_required", datasetName: dataset.name };
  }

  if (row.availability === "restricted" || row.availability === "partial") {
    return {
      verdict: "partial_availability",
      datasetName: dataset.name,
      recordCount: row.recordCount,
      earliestDate: row.earliestDate,
      latestDate: row.latestDate,
    };
  }

  if (params.yearFrom || params.yearTo) {
    const earliestYear = row.earliestDate ? new Date(row.earliestDate).getFullYear() : undefined;
    const latestYear = row.latestDate ? new Date(row.latestDate).getFullYear() : undefined;
    const outOfRange =
      (params.yearTo !== undefined && earliestYear !== undefined && params.yearTo < earliestYear) ||
      (params.yearFrom !== undefined && latestYear !== undefined && params.yearFrom > latestYear);

    if (outOfRange) {
      return { verdict: "no_records_identified", datasetName: dataset.name };
    }
  }

  if (params.status) {
    const statusResult = await pool.query(
      `select coalesce(sum(count), 0) as count
       from catalogue_dataset_status_counts
       where dataset_id = $1 and status = $2
         and geo_area_id in (select id from catalogue_geo_areas where id = $3 or parent_id = $3)`,
      [dataset.id, params.status, areaId],
    );
    const statusCount = Number(statusResult.rows[0]?.count) || 0;
    if (statusCount === 0) {
      return { verdict: "partial_availability", datasetName: dataset.name, reason: "status_not_found" };
    }
  }

  return {
    verdict: "data_identified",
    datasetName: dataset.name,
    recordCount: row.recordCount,
    earliestDate: row.earliestDate,
    latestDate: row.latestDate,
  };
}

// --- Admin: Data Catalogue -------------------------------------------------

export async function getAdminCatalogueDatasets(): Promise<CatalogueDataset[]> {
  const pool = getPool();
  const result = await pool.query(
    `select id, slug, name, category, description, status_options, display_order, status
     from catalogue_datasets
     order by display_order asc`,
  );
  return result.rows.map(mapDatasetRow);
}

export async function createCatalogueDataset(input: {
  slug: string;
  name: string;
  category: string;
  description?: string;
  statusOptions?: string[];
  displayOrder?: number;
  status?: string;
}): Promise<CatalogueDataset> {
  const pool = getPool();
  const result = await pool.query(
    `insert into catalogue_datasets (slug, name, category, description, status_options, display_order, status)
     values ($1, $2, $3, $4, $5, $6, $7)
     returning *`,
    [
      input.slug,
      input.name,
      input.category,
      input.description || null,
      input.statusOptions || [],
      input.displayOrder ?? 0,
      input.status || "published",
    ],
  );
  return mapDatasetRow(result.rows[0]);
}

export async function updateCatalogueDataset(
  id: string,
  input: {
    slug?: string;
    name?: string;
    category?: string;
    description?: string;
    statusOptions?: string[];
    displayOrder?: number;
    status?: string;
  },
): Promise<CatalogueDataset> {
  const pool = getPool();
  const result = await pool.query(
    `update catalogue_datasets set
       slug = coalesce($1, slug),
       name = coalesce($2, name),
       category = coalesce($3, category),
       description = coalesce($4, description),
       status_options = coalesce($5, status_options),
       display_order = coalesce($6, display_order),
       status = coalesce($7, status),
       updated_at = now()
     where id = $8
     returning *`,
    [
      input.slug || null,
      input.name || null,
      input.category || null,
      input.description ?? null,
      input.statusOptions || null,
      input.displayOrder ?? null,
      input.status || null,
      id,
    ],
  );
  if (!result.rows.length) throw new Error("Dataset not found");
  return mapDatasetRow(result.rows[0]);
}

export async function deleteCatalogueDataset(id: string) {
  const pool = getPool();
  await pool.query(`delete from catalogue_datasets where id = $1`, [id]);
}

export async function getAdminCatalogueGeoAreas(): Promise<CatalogueGeoArea[]> {
  const pool = getPool();
  const result = await pool.query(
    `select ga.id, ga.level, ga.parent_id, ga.slug, ga.name, ga.pcode, ga.geojson_feature_id, ga.is_official, ga.data_quality_note,
            parent.slug as parent_slug, parent.name as parent_name, parent.level as parent_level
     from catalogue_geo_areas ga
     left join catalogue_geo_areas parent on parent.id = ga.parent_id
     order by ga.level asc, ga.name asc`,
  );
  return result.rows.map(mapGeoAreaRow);
}

export async function createCatalogueGeoArea(input: {
  level: string;
  parentId?: string;
  slug: string;
  name: string;
  pcode?: string;
  geojsonFeatureId?: string;
  isOfficial?: boolean;
  dataQualityNote?: string;
}): Promise<CatalogueGeoArea> {
  const pool = getPool();
  const result = await pool.query(
    `insert into catalogue_geo_areas (level, parent_id, slug, name, pcode, geojson_feature_id, is_official, data_quality_note)
     values ($1, $2, $3, $4, $5, $6, $7, $8)
     returning *`,
    [
      input.level,
      input.parentId || null,
      input.slug,
      input.name,
      input.pcode || null,
      input.geojsonFeatureId || null,
      input.isOfficial ?? true,
      input.dataQualityNote || null,
    ],
  );
  return mapGeoAreaRow(result.rows[0]);
}

export async function updateCatalogueGeoArea(
  id: string,
  input: {
    level?: string;
    parentId?: string | null;
    slug?: string;
    name?: string;
    pcode?: string;
    geojsonFeatureId?: string;
    isOfficial?: boolean;
    dataQualityNote?: string;
  },
): Promise<CatalogueGeoArea> {
  const pool = getPool();
  const result = await pool.query(
    `update catalogue_geo_areas set
       level = coalesce($1, level),
       parent_id = case when $2::boolean then $3::uuid else parent_id end,
       slug = coalesce($4, slug),
       name = coalesce($5, name),
       pcode = coalesce($6, pcode),
       geojson_feature_id = coalesce($7, geojson_feature_id),
       is_official = coalesce($8, is_official),
       data_quality_note = coalesce($9, data_quality_note),
       updated_at = now()
     where id = $10
     returning *`,
    [
      input.level || null,
      input.parentId !== undefined,
      input.parentId || null,
      input.slug || null,
      input.name || null,
      input.pcode || null,
      input.geojsonFeatureId || null,
      input.isOfficial,
      input.dataQualityNote ?? null,
      id,
    ],
  );
  if (!result.rows.length) throw new Error("Geo area not found");
  return mapGeoAreaRow(result.rows[0]);
}

export async function deleteCatalogueGeoArea(id: string) {
  const pool = getPool();
  await pool.query(`delete from catalogue_geo_areas where id = $1`, [id]);
}

export type CatalogueStatInput = {
  datasetId: string;
  geoAreaId: string;
  recordCount?: number;
  settlementsRepresented?: number;
  earliestDate?: string;
  latestDate?: string;
  accessClassification?: string;
  dataQualityFlag?: string | null;
  notes?: string;
  source?: string;
};

export async function getAdminCatalogueStats() {
  const pool = getPool();
  const result = await pool.query(
    `select s.*, d.slug as dataset_slug, d.name as dataset_name, ga.slug as geo_area_slug, ga.name as geo_area_name
     from catalogue_dataset_geo_stats s
     join catalogue_datasets d on d.id = s.dataset_id
     join catalogue_geo_areas ga on ga.id = s.geo_area_id
     order by d.display_order asc, ga.name asc`,
  );
  return result.rows.map((row) => ({
    id: row.id,
    datasetId: row.dataset_id,
    datasetSlug: row.dataset_slug,
    datasetName: row.dataset_name,
    geoAreaId: row.geo_area_id,
    geoAreaSlug: row.geo_area_slug,
    geoAreaName: row.geo_area_name,
    recordCount: row.record_count,
    settlementsRepresented: row.settlements_represented,
    earliestDate: toDateString(row.earliest_date),
    latestDate: toDateString(row.latest_date),
    accessClassification: row.access_classification,
    dataQualityFlag: row.data_quality_flag || undefined,
    notes: row.notes || undefined,
    source: row.source,
    lastSyncedAt: row.last_synced_at?.toISOString(),
  }));
}

export async function upsertCatalogueStat(input: CatalogueStatInput) {
  const pool = getPool();
  const result = await pool.query(
    `insert into catalogue_dataset_geo_stats
       (dataset_id, geo_area_id, record_count, settlements_represented, earliest_date, latest_date, access_classification, data_quality_flag, notes, source)
     values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     on conflict (dataset_id, geo_area_id) do update set
       record_count = excluded.record_count,
       settlements_represented = excluded.settlements_represented,
       earliest_date = excluded.earliest_date,
       latest_date = excluded.latest_date,
       access_classification = excluded.access_classification,
       data_quality_flag = excluded.data_quality_flag,
       notes = excluded.notes,
       source = excluded.source,
       updated_at = now()
     returning *`,
    [
      input.datasetId,
      input.geoAreaId,
      input.recordCount ?? 0,
      input.settlementsRepresented ?? 0,
      input.earliestDate || null,
      input.latestDate || null,
      input.accessClassification || "public",
      input.dataQualityFlag || null,
      input.notes || null,
      input.source || "manual",
    ],
  );
  return result.rows[0];
}

export async function deleteCatalogueStat(id: string) {
  const pool = getPool();
  await pool.query(`delete from catalogue_dataset_geo_stats where id = $1`, [id]);
}

export async function getAdminCatalogueStatusCounts() {
  const pool = getPool();
  const result = await pool.query(
    `select c.*, d.slug as dataset_slug, d.name as dataset_name, ga.slug as geo_area_slug, ga.name as geo_area_name
     from catalogue_dataset_status_counts c
     join catalogue_datasets d on d.id = c.dataset_id
     join catalogue_geo_areas ga on ga.id = c.geo_area_id
     order by d.display_order asc, ga.name asc, c.status asc`,
  );
  return result.rows.map((row) => ({
    id: row.id,
    datasetId: row.dataset_id,
    datasetSlug: row.dataset_slug,
    datasetName: row.dataset_name,
    geoAreaId: row.geo_area_id,
    geoAreaSlug: row.geo_area_slug,
    geoAreaName: row.geo_area_name,
    status: row.status,
    count: row.count,
  }));
}

export async function upsertCatalogueStatusCount(input: {
  datasetId: string;
  geoAreaId: string;
  status: string;
  count: number;
}) {
  const pool = getPool();
  const result = await pool.query(
    `insert into catalogue_dataset_status_counts (dataset_id, geo_area_id, status, count)
     values ($1, $2, $3, $4)
     on conflict (dataset_id, geo_area_id, status) do update set
       count = excluded.count,
       updated_at = now()
     returning *`,
    [input.datasetId, input.geoAreaId, input.status, input.count],
  );
  return result.rows[0];
}

export async function deleteCatalogueStatusCount(id: string) {
  const pool = getPool();
  await pool.query(`delete from catalogue_dataset_status_counts where id = $1`, [id]);
}

export async function getAdminCatalogueYearCounts() {
  const pool = getPool();
  const result = await pool.query(
    `select y.*, d.slug as dataset_slug, d.name as dataset_name, ga.slug as geo_area_slug, ga.name as geo_area_name
     from catalogue_dataset_year_counts y
     join catalogue_datasets d on d.id = y.dataset_id
     join catalogue_geo_areas ga on ga.id = y.geo_area_id
     order by d.display_order asc, ga.name asc, y.year asc`,
  );
  return result.rows.map((row) => ({
    id: row.id,
    datasetId: row.dataset_id,
    datasetSlug: row.dataset_slug,
    datasetName: row.dataset_name,
    geoAreaId: row.geo_area_id,
    geoAreaSlug: row.geo_area_slug,
    geoAreaName: row.geo_area_name,
    year: row.year,
    count: row.count,
  }));
}

export async function upsertCatalogueYearCount(input: {
  datasetId: string;
  geoAreaId: string;
  year: number;
  count: number;
}) {
  const pool = getPool();
  const result = await pool.query(
    `insert into catalogue_dataset_year_counts (dataset_id, geo_area_id, year, count)
     values ($1, $2, $3, $4)
     on conflict (dataset_id, geo_area_id, year) do update set
       count = excluded.count,
       updated_at = now()
     returning *`,
    [input.datasetId, input.geoAreaId, input.year, input.count],
  );
  return result.rows[0];
}

export async function deleteCatalogueYearCount(id: string) {
  const pool = getPool();
  await pool.query(`delete from catalogue_dataset_year_counts where id = $1`, [id]);
}

function mapSyncLogRow(row: {
  id: string;
  started_at: Date;
  finished_at?: Date | null;
  status: string;
  triggered_by: string;
  datasets_synced: string[];
  records_processed: number;
  error_message?: string | null;
  details: Record<string, unknown>;
}): CatalogueSyncLog {
  return {
    id: row.id,
    startedAt: row.started_at.toISOString(),
    finishedAt: row.finished_at ? row.finished_at.toISOString() : undefined,
    status: row.status,
    triggeredBy: row.triggered_by,
    datasetsSynced: row.datasets_synced || [],
    recordsProcessed: row.records_processed,
    errorMessage: row.error_message || undefined,
    details: row.details || {},
  };
}

export async function getCatalogueSyncLogs(limit = 20): Promise<CatalogueSyncLog[]> {
  const pool = getPool();
  const result = await pool.query(
    `select id, started_at, finished_at, status, triggered_by, datasets_synced, records_processed, error_message, details
     from catalogue_sync_log
     order by started_at desc
     limit $1`,
    [limit],
  );
  return result.rows.map(mapSyncLogRow);
}

export async function insertCatalogueSyncLog(triggeredBy: "admin" | "cron"): Promise<CatalogueSyncLog> {
  const pool = getPool();
  const result = await pool.query(
    `insert into catalogue_sync_log (triggered_by) values ($1) returning *`,
    [triggeredBy],
  );
  return mapSyncLogRow(result.rows[0]);
}

export async function updateCatalogueSyncLog(
  id: string,
  patch: {
    status?: "running" | "success" | "partial" | "failed";
    datasetsSynced?: string[];
    recordsProcessed?: number;
    errorMessage?: string;
    details?: Record<string, unknown>;
    finished?: boolean;
  },
): Promise<CatalogueSyncLog> {
  const pool = getPool();
  const result = await pool.query(
    `update catalogue_sync_log set
       status = coalesce($1, status),
       datasets_synced = coalesce($2, datasets_synced),
       records_processed = coalesce($3, records_processed),
       error_message = coalesce($4, error_message),
       details = coalesce($5::jsonb, details),
       finished_at = case when $6::boolean then now() else finished_at end
     where id = $7
     returning *`,
    [
      patch.status || null,
      patch.datasetsSynced || null,
      patch.recordsProcessed ?? null,
      patch.errorMessage || null,
      patch.details ? JSON.stringify(patch.details) : null,
      patch.finished ?? false,
      id,
    ],
  );
  if (!result.rows.length) throw new Error("Sync log not found");
  return mapSyncLogRow(result.rows[0]);
}
