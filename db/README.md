# SEMA Website Database

The production site uses PostgreSQL through `DATABASE_URL`.

Recommended managed providers:

- Neon Postgres for a free or low-cost pilot.
- Supabase Postgres for production when SEMA also wants storage, auth, and database administration tools.

Run `schema.sql` against the production database before enabling form submissions.

Never commit real database credentials. Store them in Vercel Environment Variables.
