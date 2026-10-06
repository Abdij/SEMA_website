# Security operations

This release addresses audit findings 1–9 and 17. Catalogue feature work (10–14)
and Somali-language changes remain outside this pass. Production is currently
Vercel; the cPanel document describes a future migration.

## Deploy and verify

Apply `db/migrations/004_security.sql` before deploying; it is additive and idempotent.
If the catalogue backend migration has not yet been applied, also apply migration 003.
Fresh installations can instead use `db/schema.sql`. Retain both new tables during
an application rollback. Missing database tables or failed limiter queries fail
closed with HTTP 503 rather than allowing unthrottled requests.

Run `npm ci`, `npm test`, `npm run typecheck`, `npm run lint`, `npm run build`, and
`npm audit --omit=dev`. Optional database integration checks run with
`SECURITY_INTEGRATION=1 npm test` (PowerShell: `$env:SECURITY_INTEGRATION='1'; npm test`).
They use connection-local temporary tables in a rolled-back transaction, leaving
application data unchanged. They require the configured database to allow temporary tables.

The reviewed dependency tree reports zero production vulnerabilities. The full
development audit still reports five high alerts from the single unpatched
`braces` dependency chain used by Next's ESLint plugin (including its dependants).
The suggested automatic fix downgrades the Next lint configuration to version 14;
it is not a compatible repair for this Next 15 application. Track
[the upstream braces advisory](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm)
and keep linting restricted to trusted repository source patterns.

After deployment, check public English and Somali pages, the PDF download, dashboard
embeds, and admin sign-in/reload/sign-out. Verify an old Bearer password returns 401,
cross-origin admin writes return 403, and HTML scripts carry the response CSP nonce.
Do not submit real forms solely for deployment testing: information requests send mail.

## Admin access

The shared password is accepted only by `POST /api/admin/auth`, using constant-time
comparison. Successful login issues a random 256-bit token in a Secure (production),
HttpOnly, SameSite=Strict cookie scoped to `/api/admin`. Only its hash is stored in
PostgreSQL. Sessions expire after eight hours, sign-out revokes the current token,
and changing `ADMIN_PASSWORD` invalidates every session. The UI removes the old
localStorage password on first load. This remains shared-password administration;
individual accounts and MFA are not implemented.

Admin mutation endpoints reject cross-origin requests. The retention endpoint accepts
scheduled GET calls only with `CRON_SECRET`; browser administrators must use POST.

## Shared abuse limits

| Operation | Limit |
| --- | --- |
| Login | 8 attempts / client / 5 minutes (configurable) |
| Other admin API calls, including unauthenticated calls | 120 / client / minute |
| Retention authentication | 20 / client / 5 minutes |
| Contact form | 5 / client / hour |
| Information request | 3 / client / hour, 2 / recipient / hour, 100 total / hour |

Limits use atomic PostgreSQL updates shared by all workers. Bucket identities are
HMAC hashes using `SECURITY_HASH_SECRET` or, when unset, `ADMIN_PASSWORD`. Public
forms read at most 32 KiB of JSON and validate required field lengths and emails.
Login reads at most 4 KiB. Excess requests return 429 and Retry-After. Anonymous
analytics and dashboard registration retain their existing process-local best-effort
limits; they now use the same trusted client-IP selection described below.

Schedule `/api/admin/retention-cleanup` daily using a strong `CRON_SECRET` to remove
expired sessions and limit buckets alongside expired analytics/access data. Without
cleanup, expired sessions remain invalid but table storage grows.

## Proxy and geography configuration

On Vercel (`VERCEL=1`), use the protected `x-vercel-forwarded-for` header, falling back
to Vercel's overwritten `x-forwarded-for`. Outside Vercel, client-supplied IP headers
are ignored unless `TRUSTED_PROXY_IP_HEADER` explicitly names a header overwritten
by the deployment's trusted proxy. Missing or invalid IPs share the `unknown` bucket.

Before enabling that setting on Apache/Passenger, have the host overwrite the chosen
header from its verified client address, prevent direct public access to Node, and
test that supplying a fake header cannot change the address received by the app.
Do not merely forward the caller's X-Forwarded-For value. Keep the setting unset
until verified; the shared fallback limit is deliberately conservative.

Vercel geography headers are accepted only on Vercel. `TRUSTED_PROXY_GEO_PROVIDER=cloudflare`
enables country-only CF-IPCountry data only after the host verifies Cloudflare-only
ingress and header replacement. Without either trusted provider, geography is unavailable;
country/city charts cannot be promised on cPanel. Device and browser analytics still work.

Reference: [Vercel request headers](https://vercel.com/docs/headers/request-headers).

## Public data and browser protections

If any geography statistic for a dataset is restricted, all public numeric summaries
for that dataset are suppressed, including area profiles, indicators, date ranges,
district has-data flags, breakdowns and combination filters. Profiles may show a
restricted label and published descriptive metadata. This deliberately conservative
rule prevents inference from parent totals or other public rollups. Administrators
retain access to the underlying records.

HTML uses per-request CSP nonces and dynamic rendering; shared HTML caching is
disabled. ArcGIS and Power BI iframe origins remain allowed. Baseline headers add
HSTS, no-sniff, anti-framing, referrer and permissions policies. Downloads sanitize
ASCII filename fallbacks and encode Unicode filenames using RFC 5987.

Reference: [Next.js nonce-based CSP](https://nextjs.org/docs/app/guides/content-security-policy).
