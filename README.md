# SEMA Official Website

Vercel-ready Next.js website for the Somalia Explosive Management Authority (SEMA).

The rebuilt site replaces the Streamlit prototype with an official public website structure for:

- SEMA institutional pages
- News and updates
- Contact form
- Data request process and form
- ArcGIS and Power BI dashboard embeds
- EORE (explosive ordnance risk education) resource downloads
- Convention progress tracking
- Partners and external sources

## Local Development

```bash
npm install
npm run dev
```

Open the local URL printed by Next.js.

## Production Environment Variables

Create these in Vercel Project Settings (see `.env.example` for the full list with
descriptions):

```env
DATABASE_URL=postgresql://USER:NEW_PASSWORD@HOST:5432/SEMA_Website?sslmode=require
ADMIN_PASSWORD=
NEXT_PUBLIC_ARCGIS_DASHBOARD_URL=
NEXT_PUBLIC_POWERBI_REPORT_URL=
CONTACT_NOTIFICATION_EMAIL=info@sema.gov.so

ANALYTICS_ENABLED=true
ANALYTICS_SESSION_TIMEOUT_MINUTES=30
ANALYTICS_RAW_EVENT_RETENTION_DAYS=365
ANALYTICS_EVENT_RATE_LIMIT_PER_MINUTE=60
NEXT_PUBLIC_ANALYTICS_SESSION_TIMEOUT_MINUTES=30
NEXT_PUBLIC_DASHBOARD_ACCESS_REMEMBER_DAYS=30
DASHBOARD_ACCESS_RETENTION_DAYS=730
DASHBOARD_ACCESS_CONSENT_VERSION=1.0
DASHBOARD_ACCESS_RATE_LIMIT_PER_HOUR=20
```

Do not commit real credentials to GitHub.

## PostgreSQL

Run the schema in:

```text
db/schema.sql
```

For an existing database, the same additive DDL is also available as a standalone
migration at `db/migrations/002_dashboard_access_analytics.sql` — see
`docs/ANALYTICS.md` for the full migration and rollback notes.

Core tables:

- `news_posts`
- `publications`
- `dashboard_embeds`
- `partners`
- `contact_messages`
- `data_requests`
- `data_request_status_history`
- `analytics_events`
- `dashboard_accesses`

## Website analytics and dashboard-access gate

Dashboard links on `/dashboards` open behind an organization-details form before
the Power BI / ArcGIS embed is shown. See `docs/ANALYTICS.md` for the full event
dictionary, admin analytics usage, export functionality, privacy/retention
behavior, and the Power BI "Publish to web" limitation.

## Vercel Deployment

1. Push the project to `https://github.com/Abdij/SEMA_website`.
2. Import the repository in Vercel.
3. Set the environment variables.
4. Run the PostgreSQL schema against the production database.
5. Deploy.

## Notes

- The old Streamlit files remain in the repository for reference during migration.
- `sema_reports.db` should not be included in the production branch or public repository history because it contains report records.
- Dashboard embeds must be reviewed for public-safety and data-sensitivity before publication.
