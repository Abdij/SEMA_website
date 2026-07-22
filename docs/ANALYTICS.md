# Dashboard access gate + website analytics

This document covers the dashboard-access gate and the site-wide analytics system
added on top of the existing SEMA website. It extends the existing Next.js /
PostgreSQL / `next-intl` architecture — no new services, frameworks, or databases
were introduced.

## 1. Feature overview

- Every SEMA dashboard link on `/dashboards` is gated behind a short "Access SEMA
  Mine Action Dashboard" form (`components/DashboardAccessModal.tsx`,
  `components/DashboardAccessGate.tsx`). The dashboard's embed URL is never sent to
  the browser until the visitor registers (or reuses a registration from the last
  30 days).
- Every dashboard opening — gated or reused — is recorded as a `dashboard_opened`
  analytics event.
- Site-wide analytics (page views, sessions, navigation clicks, downloads, form
  submissions, language changes, external link clicks) are recorded through the
  existing `/api/analytics` endpoint, extended with new event types and
  anonymous visitor/session identity, and enriched server-side with approximate
  geography and device/browser category.
- A new "Analytics" and "Dashboard access" tab in `/admin` report on all of the
  above, with filters and CSV export.

## 2. Database migrations

Two equivalent copies of the same additive DDL exist:

- `db/schema.sql` — the project's single source of truth, appended in place
  (matches the existing convention of `create table if not exists` /
  `alter table ... add column if not exists`, so re-running the whole file
  against an existing database is always safe).
- `db/migrations/002_dashboard_access_analytics.sql` — the same DDL as a
  standalone incremental migration, for applying to an already-provisioned
  database without re-running the full schema file:

  ```bash
  psql "$DATABASE_URL" -f db/migrations/002_dashboard_access_analytics.sql
  ```

**New table:** `dashboard_accesses` — one row per organization registration
(organization name/type/activities, approximate visitor geography, the
dashboard and consent version, timestamps). Indexed on `created_at`,
`organization_name`, `dashboard_id`, `anonymous_visitor_id`, `activity_types`
(GIN), `country_of_operation`, and `session_id`.

**Extended table:** `analytics_events` gained: `anonymous_visitor_id`,
`session_id`, `dashboard_access_id` (FK → `dashboard_accesses`), `event_category`,
`dashboard_id` (FK → `dashboard_embeds`), `dashboard_title`, `locale`,
`country_code`, `region`, `city`, `device_category`, `browser_category` — all
nullable, so existing rows and existing queries are unaffected.

### Rollback

The migration file includes a commented, manual rollback block (drops
`dashboard_accesses` and the new `analytics_events` columns). It is destructive
and not run automatically — copy it out and run it deliberately if you need to
revert.

## 3. Required environment variables

See `.env.example` for the full annotated list. Summary:

| Variable | Default | Purpose |
|---|---|---|
| `DATABASE_URL` | — | Existing Postgres connection string |
| `ADMIN_PASSWORD` | — | Existing admin auth |
| `ANALYTICS_ENABLED` | `true` | Kill switch — `false` makes `/api/analytics` a no-op |
| `ANALYTICS_SESSION_TIMEOUT_MINUTES` | `30` | Server-side reference value |
| `NEXT_PUBLIC_ANALYTICS_SESSION_TIMEOUT_MINUTES` | `30` | Same value, readable by the browser (session rotation logic runs client-side) |
| `ANALYTICS_RAW_EVENT_RETENTION_DAYS` | `365` | Used by `/api/admin/retention-cleanup` |
| `ANALYTICS_EVENT_RATE_LIMIT_PER_MINUTE` | `60` | Per-IP rate limit on `/api/analytics` |
| `NEXT_PUBLIC_DASHBOARD_ACCESS_REMEMBER_DAYS` | `30` | How long a browser skips the form on repeat dashboard clicks |
| `DASHBOARD_ACCESS_RETENTION_DAYS` | `730` | Used by `/api/admin/retention-cleanup` |
| `DASHBOARD_ACCESS_CONSENT_VERSION` | `1.0` | Stamped onto every `dashboard_accesses` row |
| `DASHBOARD_ACCESS_RATE_LIMIT_PER_HOUR` | `20` | Per-IP rate limit on `/api/dashboard-access` |
| `CRON_SECRET` | unset | Optional — lets a scheduler call `/api/admin/retention-cleanup` without the admin password |

Two variables are intentionally duplicated with a `NEXT_PUBLIC_` prefix: Next.js
only inlines `NEXT_PUBLIC_*` variables into the browser bundle, and both the
30-day "remember this organization" window and the 30-minute session timeout
need to be evaluated in the browser (not just the server). Keep the pair in sync
when changing either.

## 4. Local development

```bash
npm install
cp .env.example .env.local   # fill in DATABASE_URL and ADMIN_PASSWORD
psql "$DATABASE_URL" -f db/schema.sql
npm run dev
```

Run the checks used in CI/before a release:

```bash
npm run typecheck
npm run lint
npm run test        # vitest run
npm run build
```

## 5. Deployment to Vercel

No change to the existing deployment process:

1. Push to the repository connected to the Vercel project.
2. Add/update the environment variables above in Vercel Project Settings
   (Production and Preview).
3. Run `db/schema.sql` (or the standalone migration) against the production
   database if it hasn't been applied yet.
4. Deploy. The dashboard-access gate and analytics activate immediately — no
   feature flag beyond `ANALYTICS_ENABLED`.

Optional: schedule `/api/admin/retention-cleanup` (GET or POST) with
[Vercel Cron](https://vercel.com/docs/cron-jobs) and a `CRON_SECRET`, or trigger
it manually as an authenticated admin, to enforce the retention windows above.
Nothing deletes old data automatically otherwise.

## 6. Analytics event dictionary

All events are written to `analytics_events` via `POST /api/analytics` (or,
for dashboard events, directly by `POST /api/dashboard-access`). Every event may
carry: `path`, `label`, `target_url`, `locale`, `anonymous_visitor_id`,
`session_id`, `device_category`, `browser_category`, `country_code`, `region`,
`city` (the last three from trusted server-side headers), plus a small
`metadata` JSON object with only the fields listed below.

| Event | Category | Fired from | Key metadata |
|---|---|---|---|
| `page_view` | navigation | `PageViewTracker` (every route change) | — |
| `session_started` | session | `PageViewTracker` (once per new session) | — |
| `nav_click` / `navigation_click` | navigation | `TrackedLink` (header/footer/mobile nav) | nav label is the visible link text |
| `header_action_click` | navigation | `TrackedLink` (header CTA) | — |
| `dashboard_gate_opened` | dashboard | `DashboardAccessGate` on "Open Dashboard" click | `sourcePage`, `reused` |
| `dashboard_gate_cancelled` | dashboard | `DashboardAccessGate` on modal Cancel/Escape | — |
| `dashboard_access_submitted` | dashboard | `POST /api/dashboard-access` (register mode) | `organizationType`, `activityTypeCount` |
| `dashboard_opened` | dashboard | `POST /api/dashboard-access` (register **and** reuse mode) | `popupShown`, `reused` |
| `publication_downloaded` | publication | `PublicationLink` | `publicationId`, `fileType`, `sourcePage` |
| `data_request_started` | form | `DataRequestForm` on mount | — |
| `data_request_submitted` | form | `DataRequestForm` on success | `requesterType`, `preferredFormat` |
| `contact_form_submitted` | form | `ContactForm` on success | `enquiryType` |
| `external_link_clicked` | external | `TrackedAnchor` (footer gov links, X, Somalia portal, unlocked dashboard link) | — |
| `language_changed` | locale | `LanguageSwitcher` | `previousLocale`, `newLocale`, `page` |
| `search_performed` | — | *not wired — the site has no search feature yet* | — |
| `file_downloaded` | — | *accepted by the API; publications currently cover the site's only downloads* | — |

**Legacy naming note:** `nav_click`, `header_action_click`, and `dashboard_open`
predate this feature and are kept for continuity with existing stored data and
the existing `TrackedLink` component; they map onto the spec's "navigation" and
"dashboard" categories described above rather than being renamed.

## 7. Visitor and session identity

- `lib/analytics-client.ts` generates a random anonymous visitor ID
  (`crypto.randomUUID()`), stored in `localStorage` (`sema_visitor_id`) — no
  fingerprinting, no device signals beyond a coarse UA-derived device/browser
  category computed server-side from the `User-Agent` header.
- A session ID is stored in `sessionStorage` and rotates after
  `ANALYTICS_SESSION_TIMEOUT_MINUTES` (default 30) of inactivity.
- **"Unique visitors" and "sessions" are estimates** of distinct
  browsers/devices, not verified individual people — the same person on two
  devices, or after clearing storage, is counted twice. This is stated in the
  admin UI (`analyticsOverview.note`) and in the public privacy notice
  (`/privacy`).
- Rate limiting (`lib/analytics-server.ts checkRateLimit`) is an in-memory,
  per-serverless-instance sliding window — a reasonable abuse deterrent, not a
  distributed guarantee. Under real traffic across multiple Vercel instances,
  the effective limit is looser than the configured number.

## 8. Approximate location

`lib/analytics-server.ts getRequestGeo()` reads `x-vercel-ip-country`,
`x-vercel-ip-country-region`, `x-vercel-ip-city` (Vercel's edge-provided
headers), falling back to Cloudflare's `cf-ipcountry` if present. No browser
geolocation permission is ever requested, no precise coordinates are collected,
and the raw IP address is never stored or displayed — only country/region/city
strings, and only when the hosting infrastructure provides them.

## 9. Admin analytics usage

In `/admin`, two new tabs:

- **Analytics** — 12 summary cards (page views, estimated unique visitors,
  sessions, returning-visitor rate, dashboard opens, unique organizations, form
  submissions/completion rate, publication downloads, data requests, contact
  forms, external link clicks), the dashboard-access popup funnel
  (opened → submitted / cancelled), and ranked lists for dashboards, pages, nav
  clicks, publications, referrers, device/browser categories, English vs Somali
  usage, approximate country/city, and daily trend lines for visits and
  dashboard opens. Filterable by date range, dashboard, page, and language.
- **Dashboard access** — a searchable, filterable table of every organization
  registration (organization, type, activities, country, dashboard, approximate
  visitor location, source page, date, repeat-access flag), plus breakdowns by
  activity type / organization type / country.

Both tabs use the existing admin password auth (`requireAdminAuth`) — nothing
here is reachable without it, and no analytics page is publicly exposed.

## 10. Export functionality

All exports require admin auth and are logged server-side (`console.info`) as a
basic audit trail:

- `GET /api/admin/dashboard-access?export=csv` — organization access records,
  respecting the same filters as the admin table.
- `GET /api/admin/analytics?export=summary` — the 12 summary metrics as CSV.
- `GET /api/admin/analytics?export=events` — up to 10,000 raw `analytics_events`
  rows (no PII — event type, category, label, path, dashboard, locale, coarse
  geography, device/browser category, timestamp only).
- The pre-existing `/api/admin/reports` CSV exports (data requests, contact
  messages, news, legacy dashboard/nav clicks) are unchanged.

**Excel export was not added** — the project has no existing Excel-generation
dependency, and adding one was judged out of scope; the CSV exports open
directly in Excel/Google Sheets.

## 11. Privacy and retention

`/privacy` (linked from the footer and from the dashboard-access modal) explains
what is collected, why, that organization information is never public, that
location is approximate, that visitor counts are estimates, and how to contact
SEMA about the data. `DASHBOARD_ACCESS_CONSENT_VERSION` is stamped onto every
`dashboard_accesses.consent_version` so SEMA can identify which notice text a
given registration accepted.

Retention is configurable (`ANALYTICS_RAW_EVENT_RETENTION_DAYS`,
`DASHBOARD_ACCESS_RETENTION_DAYS`) and enforced by
`POST`/`GET /api/admin/retention-cleanup`, callable by an authenticated admin or
a scheduled job. It is **not** run automatically on a timer by this
implementation — wire it to Vercel Cron (or run it manually) if scheduled
cleanup is required.

## 12. Power BI "Publish to web" limitation

The access form is a **stakeholder-engagement and analytics gate, not a
security control.** If a dashboard uses Power BI "Publish to web," the
underlying report has its own public URL; anyone who already has that direct
link can open it independent of this website, regardless of the gate. This
implementation:

- Retrieves the trusted embed URL server-side only, from `dashboard_embeds` in
  the database — the browser never receives it until after a successful
  registration/reuse call.
- Never accepts a dashboard URL from the client — `POST /api/dashboard-access`
  looks the URL up by `dashboardId` and ignores any URL field in the request
  body.
- Keeps the door open for a future authenticated Power BI Embedded integration
  (the gate's server-side "resolve a trusted URL for this visitor" pattern is
  already the right shape for that) — but does not implement it now.

## 13. Troubleshooting

- **Dashboard shows "temporarily unavailable" instead of the gate:** the
  dashboard row has no database `id` (the site is running off the static
  `lib/content.ts` fallback because `DATABASE_URL` is unset or the DB has no
  published `dashboard_embeds` rows). Gating requires a real
  `dashboard_embeds.id` to register an access record against.
- **Modal keeps reappearing every visit:** check that `localStorage` isn't
  disabled/blocked in the browser, and that
  `NEXT_PUBLIC_DASHBOARD_ACCESS_REMEMBER_DAYS` is set consistently between
  deploys.
- **Admin analytics tab is empty:** confirm the admin password is correct
  (401s silently fall back to "no data" rather than showing a raw error) and
  that `DATABASE_URL` is configured — analytics has no static fallback.
- **`.next` build cache errors:** pre-existing issue — delete `.next/` and
  rebuild (see main project memory / README).

## 14. Rollback procedure

1. Revert the application deployment to the previous release (standard Vercel
   rollback).
2. The database changes are additive and backward compatible — the previous
   application version ignores the new table/columns and continues to work
   without any DB rollback. A DB-level rollback is only necessary if you want
   the schema itself reverted; use the commented block at the bottom of
   `db/migrations/002_dashboard_access_analytics.sql`.
3. Set `ANALYTICS_ENABLED=false` to stop new event writes without rolling back
   code, if you need to keep the release but pause analytics collection.
