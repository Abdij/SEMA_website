# SEMA Official Website

Vercel-ready Next.js website for the Somalia Explosive Management Authority (SEMA).

The rebuilt site replaces the Streamlit prototype with an official public website structure for:

- SEMA institutional pages
- News and updates
- Contact form
- Data request process and form
- ArcGIS and Power BI dashboard embeds
- Publications and policy downloads
- Convention progress tracking
- Partners and external sources

## Local Development

```bash
npm install
npm run dev
```

Open the local URL printed by Next.js.

## Production Environment Variables

Create these in Vercel Project Settings:

```env
DATABASE_URL=postgresql://USER:NEW_PASSWORD@HOST:5432/SEMA_Website?sslmode=require
NEXT_PUBLIC_ARCGIS_DASHBOARD_URL=
NEXT_PUBLIC_POWERBI_REPORT_URL=
CONTACT_NOTIFICATION_EMAIL=info@sema.gov.so
```

Do not commit real credentials to GitHub.

## PostgreSQL

Run the schema in:

```text
db/schema.sql
```

Core tables:

- `news_posts`
- `publications`
- `dashboard_embeds`
- `partners`
- `contact_messages`
- `data_requests`
- `data_request_status_history`

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
