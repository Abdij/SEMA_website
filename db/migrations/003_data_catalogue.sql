-- Data Catalogue schema (migration 003).
--
-- Adds the sanitized public "Data Catalogue" entities: a geography hierarchy
-- (state -> region -> district -> settlement), datasets, aggregate
-- availability stats per dataset x geo area, status/year breakdowns, and an
-- IMSMA sync log. This schema stores only aggregate counts and dates, never
-- raw IMSMA records, PII, or exact hazard coordinates.
--
-- Idempotent: safe to run multiple times. Apply with:
--   psql "$DATABASE_URL" -f db/migrations/003_data_catalogue.sql
--
-- This DDL is also appended to db/schema.sql so a fresh database gets it
-- automatically.

create table if not exists catalogue_geo_areas (
  id uuid primary key default gen_random_uuid(),
  level text not null check (level in ('state', 'region', 'district', 'settlement')),
  parent_id uuid references catalogue_geo_areas(id) on delete cascade,
  slug text unique not null,
  name text not null,
  pcode text,
  geojson_feature_id text,
  is_official boolean not null default true,
  data_quality_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists catalogue_datasets (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  category text not null check (category in ('nts', 'hazardous_area', 'accident', 'eod', 'eore', 'clearance')),
  description text,
  status_options text[] not null default '{}',
  display_order int not null default 0,
  status text not null default 'published' check (status in ('draft', 'published', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists catalogue_dataset_geo_stats (
  id uuid primary key default gen_random_uuid(),
  dataset_id uuid not null references catalogue_datasets(id) on delete cascade,
  geo_area_id uuid not null references catalogue_geo_areas(id) on delete cascade,
  record_count int not null default 0,
  settlements_represented int not null default 0,
  earliest_date date,
  latest_date date,
  access_classification text not null default 'public' check (access_classification in ('public', 'restricted')),
  data_quality_flag text check (data_quality_flag in ('verified', 'needs_review', 'verification_required')),
  notes text,
  source text not null default 'manual' check (source in ('manual', 'imsma_sync')),
  last_synced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (dataset_id, geo_area_id)
);

create table if not exists catalogue_dataset_status_counts (
  id uuid primary key default gen_random_uuid(),
  dataset_id uuid not null references catalogue_datasets(id) on delete cascade,
  geo_area_id uuid not null references catalogue_geo_areas(id) on delete cascade,
  status text not null,
  count int not null default 0,
  updated_at timestamptz not null default now(),
  unique (dataset_id, geo_area_id, status)
);

create table if not exists catalogue_dataset_year_counts (
  id uuid primary key default gen_random_uuid(),
  dataset_id uuid not null references catalogue_datasets(id) on delete cascade,
  geo_area_id uuid not null references catalogue_geo_areas(id) on delete cascade,
  year int not null check (year between 1900 and 2100),
  count int not null default 0,
  updated_at timestamptz not null default now(),
  unique (dataset_id, geo_area_id, year)
);

create table if not exists catalogue_sync_log (
  id uuid primary key default gen_random_uuid(),
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  status text not null default 'running' check (status in ('running', 'success', 'partial', 'failed')),
  triggered_by text not null check (triggered_by in ('admin', 'cron')),
  datasets_synced text[] not null default '{}',
  records_processed int not null default 0,
  error_message text,
  details jsonb not null default '{}'::jsonb
);

create index if not exists catalogue_geo_areas_parent_idx on catalogue_geo_areas(parent_id);
create index if not exists catalogue_geo_areas_level_idx on catalogue_geo_areas(level);
create index if not exists catalogue_dataset_geo_stats_dataset_idx on catalogue_dataset_geo_stats(dataset_id);
create index if not exists catalogue_dataset_geo_stats_geo_idx on catalogue_dataset_geo_stats(geo_area_id);
create index if not exists catalogue_status_counts_lookup_idx on catalogue_dataset_status_counts(dataset_id, geo_area_id);
create index if not exists catalogue_year_counts_lookup_idx on catalogue_dataset_year_counts(dataset_id, geo_area_id, year);
create index if not exists catalogue_sync_log_started_idx on catalogue_sync_log(started_at desc);

-- Rollback (manual, uncomment and run by hand if this migration needs to be reverted):
--
-- drop table if exists catalogue_sync_log cascade;
-- drop table if exists catalogue_dataset_year_counts cascade;
-- drop table if exists catalogue_dataset_status_counts cascade;
-- drop table if exists catalogue_dataset_geo_stats cascade;
-- drop table if exists catalogue_datasets cascade;
-- drop table if exists catalogue_geo_areas cascade;
