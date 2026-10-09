# Daily database health checks

Vercel calls `/api/cron/database-health` daily at `12:17 UTC` (08:17 EDT / 07:17 EST).
Hobby scheduling may occur anywhere within that hour. Cron runs only on production
deployments and authenticates with the Production `CRON_SECRET` environment variable.

Each run makes three uncached read-only RPC calls to each database:

- AI CreditLab 2026: `wsnnriiqkcvazkvhrwdm`
- AI CreditLab Testing: `aqriexmnarkkuhplylzw`

Apply `supabase/migrations/20261009_database_health.sql` once to each project before
deploying. The function returns `true` without reading any customer tables, modifying
data, using AI, or bypassing row-level security. It is intentionally callable with a
limited publishable/anon API key; it exposes no customer information.

Production environment variables:

- `CRON_SECRET`: random private token, never committed or put in a URL.
- `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_HEALTH_ANON_KEY`: production connection, using its limited publishable key.
- `SUPABASE_TEST_URL` and `SUPABASE_TEST_ANON_KEY`: testing connection for this probe only.

The endpoint fails closed with 401 if the token is missing or incorrect. It checks
both projects independently and returns 503 if either check fails or configuration
is missing/mismatched. Responses and logs contain only project labels, timestamp,
and health status. No credentials or database contents are logged.

In Vercel Settings > Cron Jobs, use Run to verify the authenticated scheduled path.
Check Runtime Logs for `Database health check passed` or `Database health check failed`.
No email/SMS alert service is configured by this feature; failures are visible in logs.

Free-tier activity checks reduce inactivity risk, but they do not guarantee that
Supabase will never pause a project. Monitor warning emails and upgrade production
to Pro when uptime becomes critical. If a project is already paused, resume it in
Supabase first; this probe cannot resume projects.
