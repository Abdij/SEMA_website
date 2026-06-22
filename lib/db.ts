import { Pool } from "pg";
import {
  dashboardEmbeds as fallbackDashboardEmbeds,
  newsPosts as fallbackNewsPosts,
  publications as fallbackPublications,
} from "./content";

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
  label?: string;
  path?: string;
  targetUrl?: string;
  metadata?: Record<string, unknown>;
  userAgent?: string;
  referer?: string;
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

export async function getNewsPosts() {
  const pool = tryGetPool();

  if (!pool) {
    return fallbackNewsPosts;
  }

  const result = await pool.query(
    `select slug, title, summary, image_url, body, category, source_label, source_url, status, published_at
     from news_posts
     where status = 'published'
     order by published_at desc
     limit 6`,
  );

  if (!result.rows.length) {
    return fallbackNewsPosts;
  }

  return result.rows.map(mapNewsRow);
}

export async function getNewsPostBySlug(slug: string) {
  const pool = tryGetPool();

  if (!pool) {
    return fallbackNewsPosts.find((post) => post.slug === slug);
  }

  const result = await pool.query(
    `select slug, title, summary, image_url, body, category, source_label, source_url, status, published_at
     from news_posts
     where slug = $1
     limit 1`,
    [slug],
  );

  if (!result.rows.length) {
    return fallbackNewsPosts.find((post) => post.slug === slug);
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
    return fallbackDashboardEmbeds.map(mapFallbackDashboard);
  }

  const result = await pool.query(
    `select title, provider, description, embed_url, public_safe, status
     from dashboard_embeds
     where status = 'published'
     order by created_at desc`,
  );

  if (!result.rows.length) {
    return fallbackDashboardEmbeds.map(mapFallbackDashboard);
  }

  return result.rows.map((row) => ({
    title: row.title,
    description: row.description,
    url: row.embed_url,
    provider: row.provider,
    public_safe: row.public_safe,
    status: row.status,
    notes: row.public_safe ? "Published dashboard embed." : "Private or draft dashboard embed."
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
    `insert into analytics_events (event_type, label, path, target_url, metadata, user_agent, referer)
     values ($1, $2, $3, $4, $5::jsonb, $6, $7)`,
    [
      input.eventType,
      input.label || null,
      input.path || null,
      input.targetUrl || null,
      JSON.stringify(input.metadata ?? {}),
      input.userAgent || null,
      input.referer || null,
    ],
  );
}
