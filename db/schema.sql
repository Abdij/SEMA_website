create extension if not exists pgcrypto;

create table if not exists news_posts (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  summary text not null,
  body text not null,
  category text not null,
  image_url text,
  source_label text,
  source_url text,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists publications (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  document_type text not null,
  description text not null,
  file_url text,
  file_name text,
  file_mime text,
  file_data bytea,
  source text not null default 'SEMA',
  publication_date date,
  status text not null default 'published' check (status in ('draft', 'published', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table publications add column if not exists file_name text;
alter table publications add column if not exists file_mime text;
alter table publications add column if not exists file_data bytea;
alter table publications alter column file_url drop not null;

create table if not exists dashboard_embeds (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  provider text not null check (provider in ('arcgis', 'powerbi', 'other')),
  description text not null,
  embed_url text not null,
  public_safe boolean not null default false,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists partners (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  partner_type text not null,
  description text not null,
  website_url text,
  logo_url text,
  status text not null default 'published' check (status in ('draft', 'published', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  organization text,
  email text not null,
  phone text,
  enquiry_type text not null,
  subject text not null,
  message text not null,
  status text not null default 'new' check (status in ('new', 'reviewing', 'responded', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists data_requests (
  id uuid primary key default gen_random_uuid(),
  request_ref text unique not null default ('DR-' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 10))),
  name text not null,
  organization text,
  role text,
  email text not null,
  phone text,
  requester_type text not null,
  data_requested text not null,
  geography text,
  time_period text,
  intended_use text not null,
  preferred_format text not null,
  deadline date,
  status text not null default 'submitted' check (status in ('submitted', 'screening', 'clarification_needed', 'approved', 'fulfilled', 'declined', 'closed')),
  sensitivity_level text not null default 'pending_review' check (sensitivity_level in ('pending_review', 'public', 'restricted', 'confidential')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists data_request_status_history (
  id uuid primary key default gen_random_uuid(),
  data_request_id uuid not null references data_requests(id) on delete cascade,
  status text not null,
  note text,
  changed_by text,
  created_at timestamptz not null default now()
);

create table if not exists analytics_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  label text,
  path text,
  target_url text,
  metadata jsonb not null default '{}'::jsonb,
  user_agent text,
  referer text,
  created_at timestamptz not null default now()
);

create index if not exists contact_messages_status_idx on contact_messages(status);
create index if not exists data_requests_status_idx on data_requests(status);
create index if not exists news_posts_status_published_idx on news_posts(status, published_at desc);
create index if not exists publications_status_idx on publications(status);
create index if not exists analytics_events_type_created_idx on analytics_events(event_type, created_at desc);
create index if not exists analytics_events_label_idx on analytics_events(label);
create index if not exists analytics_events_path_idx on analytics_events(path);

-- === Dashboard access gating + extended analytics (migration 002) ===

create table if not exists dashboard_accesses (
  id uuid primary key default gen_random_uuid(),

  organization_name text not null,
  organization_type text,
  organization_type_other text,

  activity_types text[] not null default '{}',
  activity_type_other text,

  country_of_operation text,

  dashboard_id uuid references dashboard_embeds(id) on delete set null,
  dashboard_title text,
  dashboard_url text,

  anonymous_visitor_id text,
  session_id text,

  visitor_country text,
  visitor_region text,
  visitor_city text,

  locale text,
  source_page text,
  referrer text,
  user_agent text,

  consent_given boolean not null default false,
  consent_version text,
  created_at timestamptz not null default now()
);

alter table analytics_events add column if not exists anonymous_visitor_id text;
alter table analytics_events add column if not exists session_id text;
alter table analytics_events add column if not exists dashboard_access_id uuid references dashboard_accesses(id) on delete set null;
alter table analytics_events add column if not exists event_category text;
alter table analytics_events add column if not exists dashboard_id uuid references dashboard_embeds(id) on delete set null;
alter table analytics_events add column if not exists dashboard_title text;
alter table analytics_events add column if not exists locale text;
alter table analytics_events add column if not exists country_code text;
alter table analytics_events add column if not exists region text;
alter table analytics_events add column if not exists city text;
alter table analytics_events add column if not exists device_category text;
alter table analytics_events add column if not exists browser_category text;

create index if not exists dashboard_accesses_created_at_idx on dashboard_accesses(created_at desc);
create index if not exists dashboard_accesses_org_name_idx on dashboard_accesses(organization_name);
create index if not exists dashboard_accesses_dashboard_id_idx on dashboard_accesses(dashboard_id);
create index if not exists dashboard_accesses_visitor_id_idx on dashboard_accesses(anonymous_visitor_id);
create index if not exists dashboard_accesses_activity_types_idx on dashboard_accesses using gin(activity_types);
create index if not exists dashboard_accesses_country_idx on dashboard_accesses(country_of_operation);
create index if not exists dashboard_accesses_session_id_idx on dashboard_accesses(session_id);

create index if not exists analytics_events_visitor_id_idx on analytics_events(anonymous_visitor_id);
create index if not exists analytics_events_session_id_idx on analytics_events(session_id);
create index if not exists analytics_events_dashboard_id_idx on analytics_events(dashboard_id);
create index if not exists analytics_events_category_idx on analytics_events(event_category);
create index if not exists analytics_events_dashboard_access_id_idx on analytics_events(dashboard_access_id);
