-- Make the information request form's "Full name" field optional (migration 007).
-- Safe to run multiple times (idempotent).
-- This DDL is also folded into db/schema.sql so fresh databases get it automatically.
-- Apply against the existing SEMA database with:
--   psql "$DATABASE_URL" -f db/migrations/007_data_request_name_optional.sql
begin;

alter table data_requests alter column name drop not null;

commit;
