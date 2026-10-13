-- Require organization/role and add data category/subcategory on data_requests (migration 006).
-- Safe to run multiple times (all statements are idempotent).
-- This DDL is also folded into db/schema.sql so fresh databases get it automatically.
-- Apply against the existing SEMA database with:
--   psql "$DATABASE_URL" -f db/migrations/006_data_request_categories.sql
begin;

update data_requests set organization = 'Not provided' where organization is null;
update data_requests set role = 'Not provided' where role is null;
alter table data_requests alter column organization set not null;
alter table data_requests alter column role set not null;

alter table data_requests add column if not exists data_category text not null default 'Not specified';
alter table data_requests add column if not exists data_subcategory text not null default 'Not specified';
alter table data_requests alter column data_category drop default;
alter table data_requests alter column data_subcategory drop default;

commit;
