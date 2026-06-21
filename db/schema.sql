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
  file_url text not null,
  source text not null default 'SEMA',
  publication_date date,
  status text not null default 'published' check (status in ('draft', 'published', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

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

create index if not exists contact_messages_status_idx on contact_messages(status);
create index if not exists data_requests_status_idx on data_requests(status);
create index if not exists news_posts_status_published_idx on news_posts(status, published_at desc);
create index if not exists publications_status_idx on publications(status);
