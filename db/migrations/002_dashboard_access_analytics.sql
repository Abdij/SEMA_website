-- Migration 002: Dashboard access gating + extended analytics
--
-- Safe to run multiple times (all statements are idempotent).
-- Apply against the existing SEMA database with:
--   psql "$DATABASE_URL" -f db/migrations/002_dashboard_access_analytics.sql
--
-- This is the same DDL that has been appended to db/schema.sql, kept here
-- standalone so it can be applied as an incremental migration against a
-- database that was already provisioned from an earlier version of schema.sql.

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

-- Rollback (manual, destructive — only run if you need to fully revert):
--
-- drop table if exists dashboard_accesses cascade;
-- alter table analytics_events
--   drop column if exists anonymous_visitor_id,
--   drop column if exists session_id,
--   drop column if exists dashboard_access_id,
--   drop column if exists event_category,
--   drop column if exists dashboard_id,
--   drop column if exists dashboard_title,
--   drop column if exists locale,
--   drop column if exists country_code,
--   drop column if exists region,
--   drop column if exists city,
--   drop column if exists device_category,
--   drop column if exists browser_category;
