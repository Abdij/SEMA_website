# Deployment Plan — cPanel Hosting for sema.org.so

This is the deployment package for standing up the SEMA website on a cPanel host under the
domain **sema.org.so**, including the PostgreSQL database. Share this file directly with the
hosting provider / hosting team.

## 0. Decision point — confirm with the hosting provider first

Two facts determine which path below applies. Ask the host (or check cPanel yourself) before
starting:

1. **Does the cPanel plan include "Setup Node.js App" (CloudLinux Node.js Selector /
   Passenger)?** Next.js 15 needs a running Node process — this is not a static-HTML or PHP
   site. Almost all modern cPanel/WHM hosts have this, but budget shared-hosting plans
   sometimes disable it.
   - **If yes** → Section 3 (Node.js App setup) applies directly.
   - **If no** → the plan changes to a VPS-with-PM2-and-Nginx setup instead of cPanel's
     Passenger integration. Flag this back before proceeding.

2. **Does the cPanel plan include "PostgreSQL Databases" in cPanel (not just MySQL)?** This
   app uses PostgreSQL (`pg` driver), and most shared cPanel hosting only ships MySQL/MariaDB
   — native PostgreSQL is a WHM-level feature the host must have enabled.
   - **If yes** → use **Path A** in Section 4 (database fully on cPanel).
   - **If no** → use **Path B** in Section 4 (keep the database on a managed Postgres
     provider — Neon or Supabase — and only the app itself runs on cPanel). This is a fully
     supported hybrid setup and often simpler to operate long-term (managed backups, no DB
     administration burden on the host).

Everything below assumes Path A or Path B is chosen up front; the two only differ in Section 4.

## 1. Domain / DNS — sema.org.so

1. In the registrar's DNS panel for `sema.org.so`, either:
   - Point the domain's **nameservers** to the cPanel host's nameservers (if the host will
     manage DNS), or
   - Keep the registrar's DNS and add an **A record** for `sema.org.so` (and `www.sema.org.so`)
     pointing at the cPanel server's public IP address, provided by the host.
2. In cPanel, add `sema.org.so` as the account's **primary domain** (or as an **Addon Domain**
   if the cPanel account currently has a different primary domain). This creates the document
   root the site will deploy into (e.g. `~/sema.org.so` or `~/public_html`).
3. Decide on `www` vs apex as canonical (recommend apex `sema.org.so` with `www` redirecting to
   it) and set a redirect rule in cPanel → Domains once the site is live.
4. DNS propagation can take up to 24–48 hours; do the rest of the setup while waiting.

## 2. Runtime requirements

- **Node.js 18.18+** (20 LTS or 22 LTS recommended) — required by Next.js 15.
- npm (ships with Node).

## 3. Deploying the app via cPanel "Setup Node.js App"

1. **Get the code onto the server.** Either:
   - cPanel → **Git Version Control** → clone this repository directly on the server, or
   - Upload a zip of the repo via **File Manager** and extract it, or
   - `git clone` over SSH if shell access is available.
   Place it in a directory *outside* `public_html` if possible (e.g. `~/sema-website`) — the
   Node.js App tool manages its own proxy into the domain's public URL, so the app folder does
   not need to be the doc root.
2. cPanel → **Software** → **Setup Node.js App** → **Create Application**:
   - Node.js version: 20 LTS (or 22 LTS).
   - Application mode: Production.
   - Application root: the folder from step 1 (e.g. `sema-website`).
   - Application URL: `sema.org.so`.
   - Application startup file: not used directly by Next.js — instead set the **startup
     command** below.
3. Open the app's terminal (the "Run NPM Install" button plus the provided shell command shown
   at the top of the Node.js App page) and run:
   ```
   npm install
   npm run build
   ```
4. Set the app's **start command** to:
   ```
   npm run start
   ```
   Passenger will keep this process running and reverse-proxy `sema.org.so` (port 80/443) to
   it internally — no manual port/proxy configuration needed.
5. Click **Restart** on the Node.js App page after any future deploy (new `git pull` + `npm
   install` + `npm run build` + Restart).

**If `sharp` fails to install** (it needs native binaries and some shared hosts restrict
native module compilation): set `images: { unoptimized: true }` in `next.config.ts` as a
fallback and rebuild. This disables on-the-fly image optimization but keeps the site fully
functional.

## 4. Database setup

No separate file-storage volume is needed either way — publication uploads are stored as
`bytea` inside Postgres (`db/schema.sql`), not on disk.

### Path A — PostgreSQL is available natively in cPanel

1. cPanel → **PostgreSQL Databases**:
   - Create a database (e.g. `sema_website`).
   - Create a database user with a strong generated password.
   - Add the user to the database with **ALL PRIVILEGES**.
2. Note the connection details cPanel shows — host is typically `localhost` from the app's
   perspective, port `5432`, and the actual database/user names are usually prefixed with the
   cPanel account username (e.g. `cpaneluser_sema_website`).
3. Build the connection string:
   ```
   DATABASE_URL=postgresql://CPANELUSER_dbuser:PASSWORD@localhost:5432/CPANELUSER_sema_website
   ```
   (No `sslmode=require` needed for a same-host local connection — see Section 6 note.)
4. From the app's terminal in the Node.js App shell:
   ```
   node scripts/apply_schema.js "$DATABASE_URL"
   psql "$DATABASE_URL" -f db/migrations/002_dashboard_access_analytics.sql
   ```
   (If `psql` isn't available in the shell, ask the host to run the migration file for you, or
   run it via cPanel's phpPgAdmin if included.)

### Path B — keep Postgres external (Neon or Supabase), app on cPanel

1. Provision the production database on Neon or Supabase as already documented in
   `db/README.md`.
2. Run against it from any machine with `psql`/Node access (does not need to be the cPanel
   server):
   ```
   node scripts/apply_schema.js "postgresql://USER:PASSWORD@HOST:5432/DBNAME?sslmode=require"
   psql "postgresql://USER:PASSWORD@HOST:5432/DBNAME?sslmode=require" -f db/migrations/002_dashboard_access_analytics.sql
   ```
3. Use that same connection string (with `sslmode=require`) as `DATABASE_URL` in the cPanel
   app's environment variables (Section 5). The cPanel-hosted Next.js app connects to it over
   the public internet exactly as it does today on Vercel — no other change needed.

## 5. Environment variables

In the Node.js App page, cPanel exposes an **Environment Variables** section — add these
there (do not commit real values to git; `.env`/`.env.local` are already gitignored).

| Var | Purpose |
|---|---|
| `DATABASE_URL` | From Section 4, Path A or B |
| `ADMIN_PASSWORD` | Admin panel password |
| `CONTACT_NOTIFICATION_EMAIL` | Where contact-form submissions notify (e.g. `dahiru@sema.org.so`) |
| `ADMIN_LOGIN_RATE_LIMIT_PER_5MIN` | Optional, default `8` is fine |
| `NEXT_PUBLIC_ARCGIS_DASHBOARD_URL` / `NEXT_PUBLIC_POWERBI_REPORT_URL` | Fallback only, used when the DB has no published dashboard rows |
| `ANALYTICS_ENABLED` | `true`/`false` |
| `ANALYTICS_SESSION_TIMEOUT_MINUTES` | Analytics session timeout |
| `ANALYTICS_RAW_EVENT_RETENTION_DAYS` | Analytics raw event retention |
| `ANALYTICS_EVENT_RATE_LIMIT_PER_MINUTE` | Analytics event rate limit |
| `NEXT_PUBLIC_ANALYTICS_SESSION_TIMEOUT_MINUTES` | Must match `ANALYTICS_SESSION_TIMEOUT_MINUTES` |
| `NEXT_PUBLIC_DASHBOARD_ACCESS_REMEMBER_DAYS` | "Remember this organization" window for the dashboard-access gate |
| `DASHBOARD_ACCESS_RETENTION_DAYS` | Dashboard-access record retention |
| `DASHBOARD_ACCESS_CONSENT_VERSION` | Dashboard-access consent version string |
| `DASHBOARD_ACCESS_RATE_LIMIT_PER_HOUR` | Dashboard-access gate rate limit |
| `CRON_SECRET` | Only needed if `/api/admin/retention-cleanup` is scheduled via cron (Section 8) |

After adding/changing variables, click **Restart** on the Node.js App page — Passenger only
picks up new env vars on restart.

## 6. SSL / HTTPS

1. Once DNS for `sema.org.so` resolves to the cPanel server, go to cPanel → **SSL/TLS
   Status** → run **AutoSSL** (or request a free Let's Encrypt certificate if AutoSSL isn't
   automatic on the plan). This covers both `sema.org.so` and `www.sema.org.so`.
2. Confirm cPanel → **Domains** has "Force HTTPS Redirect" enabled for the domain.
3. **SSL note on the DB connection:** `lib/db.ts` enables SSL on the Postgres connection only
   when `DATABASE_URL` contains `sslmode=require`, `supabase`, or `neon.tech`. Path B (Neon/
   Supabase) already satisfies this. Path A (local cPanel Postgres, connecting via
   `localhost`) does not need SSL for a same-host connection — leave `sslmode` off the
   connection string in that case.

## 7. Verification checklist after go-live

- [ ] `https://sema.org.so` loads over HTTPS with a valid certificate.
- [ ] `https://www.sema.org.so` redirects to the apex (or vice versa, per Section 1).
- [ ] Home, About, News, Publications, Contact, Data Request, and Dashboards pages all render.
- [ ] `/admin` login works with `ADMIN_PASSWORD`.
- [ ] Creating a test news post / publication in `/admin` and seeing it appear on the public
      site confirms the database write path works end-to-end.
- [ ] Submitting the public Contact form and Data Request form succeeds and rows appear under
      `/admin` → Contact Messages / Data Requests.
- [ ] Any leftover "Updates Admin API Smoke Test" news items are deleted/archived via `/admin`
      (see `db/README.md` / project notes — these only ever appear when a real DB is connected).

## 8. Optional — cron job for data retention cleanup

If `CRON_SECRET` is set, schedule cPanel → **Cron Jobs** to call the retention-cleanup
endpoint periodically (e.g. daily):

```
curl -s -X POST https://sema.org.so/api/admin/retention-cleanup \
  -H "Authorization: Bearer $CRON_SECRET"
```

## 9. Redeploy workflow (future updates)

```
git pull
npm install
npm run build
```
Then click **Restart** on the Node.js App page in cPanel. Database schema changes ship as new
files under `db/migrations/` and are applied manually with `psql` the same way as Section 4.

## 10. Rollback

Keep the previous build's `.next/` output or a tagged git commit before deploying. If a deploy
breaks the live site, `git checkout <previous-tag>`, `npm install`, `npm run build`, and
Restart — this restores service in minutes since the database schema is additive-only and not
touched by a code rollback.
