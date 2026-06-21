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
  title: string;
  type: string;
  description: string;
  href: string;
  source: string;
  publication_date?: string;
  status?: string;
};

export type DashboardEmbed = {
  title: string;
  description: string;
  url: string;
  provider?: string;
  public_safe?: boolean;
  status?: string;
  notes?: string;
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

function mapNewsRow(row: any): NewsPost {
  return {
    slug: row.slug,
    title: row.title,
    date: row.published_at ? new Date(row.published_at).toISOString().split("T")[0] : "",
    category: row.category,
    summary: row.summary,
    image: row.image_url || "/images/mine-survey.jpg",
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
    `select title, document_type, description, file_url, source, publication_date, status
     from publications
     where status = 'published'
     order by publication_date desc nulls last`,
  );

  if (!result.rows.length) {
    return fallbackPublications;
  }

  return result.rows.map((row) => ({
    title: row.title,
    type: row.document_type,
    description: row.description,
    href: row.file_url,
    source: row.source,
    publication_date: row.publication_date ? row.publication_date.toISOString().split("T")[0] : undefined,
    status: row.status,
  }));
}

export async function getAdminPublications() {
  const pool = tryGetPool();

  if (!pool) {
    return fallbackPublications;
  }

  const result = await pool.query(
    `select title, document_type, description, file_url, source, publication_date, status
     from publications
     order by publication_date desc nulls last`,
  );

  if (!result.rows.length) {
    return fallbackPublications;
  }

  return result.rows.map((row) => ({
    title: row.title,
    type: row.document_type,
    description: row.description,
    href: row.file_url,
    source: row.source,
    publication_date: row.publication_date ? row.publication_date.toISOString().split("T")[0] : undefined,
    status: row.status,
  }));
}

export async function getDashboardEmbeds() {
  const pool = tryGetPool();

  if (!pool) {
    return fallbackDashboardEmbeds.map((item) => ({
      title: item.title,
      description: item.description,
      url: item.url,
      provider: item.envKey || "other",
      public_safe: true,
      status: "published",
      notes: item.notes,
    }));
  }

  const result = await pool.query(
    `select title, provider, description, embed_url, public_safe, status
     from dashboard_embeds
     where status = 'published'
     order by created_at desc`,
  );

  if (!result.rows.length) {
    return fallbackDashboardEmbeds.map((item) => ({
      title: item.title,
      description: item.description,
      url: item.url,
      provider: item.envKey || "other",
      public_safe: true,
      status: "published",
      notes: item.notes,
    }));
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
    return fallbackDashboardEmbeds.map((item) => ({
      title: item.title,
      description: item.description,
      url: item.url,
      provider: item.envKey || "other",
      public_safe: true,
      status: "published",
      notes: item.notes,
    }));
  }

  const result = await pool.query(
    `select title, provider, description, embed_url, public_safe, status
     from dashboard_embeds
     order by created_at desc`,
  );

  if (!result.rows.length) {
    return fallbackDashboardEmbeds.map((item) => ({
      title: item.title,
      description: item.description,
      url: item.url,
      provider: item.envKey || "other",
      public_safe: true,
      status: "published",
      notes: item.notes,
    }));
  }

  return result.rows.map((row) => ({
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
  href: string;
  source: string;
  publication_date?: string;
  status?: string;
}) {
  const pool = getPool();
  const result = await pool.query(
    `insert into publications (title, document_type, description, file_url, source, publication_date, status)
     values ($1, $2, $3, $4, $5, $6, $7)
     returning *`,
    [
      input.title,
      input.type,
      input.description,
      input.href,
      input.source,
      input.publication_date || null,
      input.status || "published",
    ],
  );

  return {
    title: result.rows[0].title,
    type: result.rows[0].document_type,
    description: result.rows[0].description,
    href: result.rows[0].file_url,
    source: result.rows[0].source,
    publication_date: result.rows[0].publication_date ? result.rows[0].publication_date.toISOString().split("T")[0] : undefined,
    status: result.rows[0].status,
  };
}

export async function updatePublication(title: string, input: {
  type?: string;
  description?: string;
  href?: string;
  source?: string;
  publication_date?: string;
  status?: string;
}) {
  const pool = getPool();
  const result = await pool.query(
    `update publications set
      document_type = coalesce($1, document_type),
      description = coalesce($2, description),
      file_url = coalesce($3, file_url),
      source = coalesce($4, source),
      publication_date = coalesce($5, publication_date),
      status = coalesce($6, status),
      updated_at = now()
     where title = $7
     returning *`,
    [
      input.type || null,
      input.description || null,
      input.href || null,
      input.source || null,
      input.publication_date || null,
      input.status || null,
      title,
    ],
  );

  if (!result.rows.length) {
    throw new Error("Publication not found");
  }

  return {
    title: result.rows[0].title,
    type: result.rows[0].document_type,
    description: result.rows[0].description,
    href: result.rows[0].file_url,
    source: result.rows[0].source,
    publication_date: result.rows[0].publication_date ? result.rows[0].publication_date.toISOString().split("T")[0] : undefined,
    status: result.rows[0].status,
  };
}

export async function deletePublication(title: string) {
  const pool = getPool();
  await pool.query(`delete from publications where title = $1`, [title]);
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
      input.provider || "other",
      input.description,
      input.url,
      input.public_safe ?? false,
      input.status || "published",
    ],
  );

  return {
    title: result.rows[0].title,
    description: result.rows[0].description,
    url: result.rows[0].embed_url,
    provider: result.rows[0].provider,
    public_safe: result.rows[0].public_safe,
    status: result.rows[0].status,
    notes: "Published dashboard embed.",
  };
}

export async function updateDashboardEmbed(title: string, input: {
  description?: string;
  url?: string;
  provider?: string;
  public_safe?: boolean;
  status?: string;
}) {
  const pool = getPool();
  const result = await pool.query(
    `update dashboard_embeds set
      description = coalesce($1, description),
      embed_url = coalesce($2, embed_url),
      provider = coalesce($3, provider),
      public_safe = coalesce($4, public_safe),
      status = coalesce($5, status),
      updated_at = now()
     where title = $6
     returning *`,
    [
      input.description || null,
      input.url || null,
      input.provider || null,
      input.public_safe,
      input.status || null,
      title,
    ],
  );

  if (!result.rows.length) {
    throw new Error("Dashboard embed not found");
  }

  return {
    title: result.rows[0].title,
    description: result.rows[0].description,
    url: result.rows[0].embed_url,
    provider: result.rows[0].provider,
    public_safe: result.rows[0].public_safe,
    status: result.rows[0].status,
    notes: "Published dashboard embed.",
  };
}

export async function deleteDashboardEmbed(title: string) {
  const pool = getPool();
  await pool.query(`delete from dashboard_embeds where title = $1`, [title]);
}
