# Operations Runbook

Operational guide for matlandgard.no. Covers deploys, monitoring, alerting, and
common incidents. Keep this doc in sync when you change infrastructure.

---

## Infrastructure

| Component | Where | Notes |
| --- | --- | --- |
| Production app | Dokploy (`https://dokploy.fjelldata.com`) | App `matlandgard.no`, single replica, auto-deploy on push to `main` |
| Domain | `matlandgard.no` + `www.matlandgard.no` | HTTPS via Let's Encrypt, port 3000 |
| Database | Supabase (`aws-1-eu-central-1`) | Pooled `DATABASE_URL` (port 6543) for runtime, `DIRECT_URL` (port 5432) for migrations |
| Backups | Backblaze B2 via `.github/workflows/backup-supabase.yml` | Daily at 03:00 UTC, 30-day retention |
| Error tracking | Sentry (org `fjelldata`, project `javascript-nextjs`, EU region) | Release tag = deployed commit SHA |
| Uptime | UptimeRobot | https://uptimerobot.com, monitor `matlandgard.no` → `/api/health` |

## Deploy

Push to `main` triggers Dokploy auto-build. Sequence:

1. `git push origin main`
2. Dokploy pulls, runs `next build` (Turbopack), uploads source maps to Sentry
3. Dokploy starts a new container; healthcheck gates promotion
4. Old container is replaced once the new one reports healthy

**Average deploy time**: 60–80 s (50 s build + 20 s migrations + startup).

### Health endpoint

`GET https://matlandgard.no/api/health` → 200/503, JSON body includes
`status`, `uptimeMs`, `nodeVersion`, `timestamp`, `checks.db.{status,latencyMs,error}`.
Returns 503 if the Supabase `SELECT 1` ping fails. Docker HEALTHCHECK and
UptimeRobot both hit this every 30 s / 5 min respectively.

`Sentry.init` ignores `/api/health` from the transaction sample (10 % server,
5 % client) so the healthcheck doesn't burn the quota.

## CI / Maintenance

| Workflow | Schedule | What it does |
| --- | --- | --- |
| `.github/workflows/ci.yml` | on push / PR | `npm ci` → `prisma generate` → `lint` → `build` |
| `.github/workflows/codeql.yml` | weekly + on push | TypeScript security-and-quality queries |
| `.github/workflows/backup-supabase.yml` | daily 03:00 UTC | `pg_dump` to Backblaze B2 |
| Renovate | every weekend | npm + GitHub Action updates, autolabel, automerge patches |
| Docker HEALTHCHECK | every 30 s | Hits `/api/health`; Dokploy kills the container after 3 fails |

Renovate opens a weekly PR. Patch + minor updates auto-merge once CI is green.
Major updates need review (the `breaking` label is auto-applied).

## Sentry

- **Project**: https://sentry.io/organizations/fjelldata/projects/javascript-nextjs/
- **Release tag**: every deploy is tagged with its commit SHA so stack frames
  resolve to the right commit. Look up a release at
  `https://sentry.io/organizations/fjelldata/releases/<sha>/`
- **Source maps**: uploaded by an explicit `sentry-cli sourcemaps upload`
  step in the Dockerfile after `next build`. The `@sentry/nextjs` plugin
  still runs (for SDK injection) but its Turbopack-era source-map hook
  is disabled in `next.config.ts` (`sourcemaps.disable: true`) because
  it is unreliable on Next.js 16's default Turbopack pipeline. The
  Dockerfile step is guarded on `SENTRY_AUTH_TOKEN` so a missing token
  does not fail the build.
- **Sample rates**: 5 % client traces / 5 % replays (100 % on error),
  10 % server + edge traces. Tunable in `sentry.{client,server,edge}.config.ts`.
- **Replays**: all text and media are masked/blocked — PII/address safe by
  default (`replayIntegration({ maskAllText: true, blockAllMedia: true })`).
- **Server init is wired by `instrumentation.ts`** at the repo root. Do not
  delete that file; without it the SDK builds successfully but events are
  never sent (the only symptom is a valid `eventId` returned from
  `captureException` with no matching issue in the dashboard).

## UptimeRobot

- **Monitor**: `matlandgard.no` (HTTP/S)
- **URL**: `https://matlandgard.no/api/health`
- **Interval**: 5 min (free tier)
- **Keyword check**: `status: ok` (case-insensitive) — fails on 503 or a
  hypothetical 200-with-broken-app
- **Alerts**: configured per-account (email, SMS paid)

## Secrets

All secrets live in **Dokploy → Application → matlandgard.no → Environment**
(plain multiline `env` string) and **Build Args** (visible in `docker history`).

- **Runtime env** (in `env`): `SENTRY_DSN`, `DATABASE_URL`, `DIRECT_URL`,
  `NEXT_PUBLIC_SUPABASE_*`, `STRIPE_*`, `VIPPS_*`, `EMAIL_*`, `ADMIN_PASSWORD`.
- **Build args** (in `buildArgs`): `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`,
  `SENTRY_PROJECT`, `COMMIT_SHA`, plus all `NEXT_PUBLIC_SUPABASE_*` and
  Supabase URL/key needed at build time.

**Known follow-up**: the `env` field is a single multiline string. Converting
to per-key fields would let Dokploy mask them in the UI and reduce the
chance of accidental full-string copies.

**Sentry auth token** is scoped to `org:read, project:releases, project:write`
and lives in `buildArgs` (visible via `docker history` to anyone with shell
on the Dokploy host). Accepted trade-off — Dokploy does not expose build
secrets for this app. Rotate if the Dokploy host is ever shared.

## Common operations

### Restart the app (no rebuild)

Dokploy → Application → `matlandgard.no` → ⋯ → **Restart**.

The container stops, Dokploy starts a new one. The entrypoint reruns
`prisma migrate deploy` (no-op if no pending migrations) before booting
Next.js. Total downtime: 5–10 s.

### Roll back to a previous commit

`git revert <bad-sha>` → push. To skip CI checks on an emergency rollback,
push directly to a `hotfix/*` branch and merge via PR; or `git push -f`
after a `git reset --hard <good-sha>` (Dokploy will rebuild from the reset
HEAD).

### Inspect runtime logs

```bash
# Last 100 lines
Dokploy → Application → matlandgard.no → Logs → tail 100
# or via the dokploy MCP tool:
application.readLogs(applicationId="voz4K3oLUxJq3lW_XIUUe", tail=100)
```

Build logs are on the Dokploy host at
`/etc/dokploy/logs/fjelldata-matlandgardno-5x4pqu/`, not reachable from
this machine.

### Diagnose a Sentry event that didn't arrive

1. Check the runtime log for `Sentry Logger [warn]: Event dropped due to …`
   — usually `ignoreTransactions` or `beforeSend` returning `null`.
2. Check `process.env.SENTRY_DSN` is set in the container
   (Sentry debug mode shows it at init time).
3. Confirm the SDK actually loaded: the runtime log should show
   `Sentry Logger [log]: Http.Server Handling incoming request` etc.
   If absent, `instrumentation.ts` is missing or not being picked up.
4. Check the release in the Sentry dashboard — `firstEvent`/`lastEvent` are
   populated when events arrive.

### Common gotchas

- **Next.js private folders**: directories prefixed with `_` (e.g.
  `app/api/_debug/`) are not routable. Use plain names.
- **`DIRECT_URL` for migrations, `DATABASE_URL` for runtime**: the
  `scripts/docker-entrypoint.sh` handles this swap. Don't put `directUrl`
  in `prisma/schema.prisma` — the connection string is set per-step, not
  per-schema.
- **Renovate `lockFileMaintenance`**: runs Mondays 5 am Europe/Oslo. Expect
  a `package-lock.json` PR if deps drifted. Merge after CI is green.
- **First deploy after a Sentry env change**: the Sentry SDK must be
  re-initialized — push a small commit (whitespace fix) to retrigger a
  build, or Dokploy → Application → **Redeploy**.

## Drill procedures

A "drill" is an exercise that validates a recovery procedure before
you actually need it. Run each drill at least once after a major infra
change, and re-run after any incident that exposed a gap.

### Quarterly: full Supabase restore into a scratch project

**Why**: confirms that the Backblaze B2 daily dump is actually
restorable, and that we know how long the process takes. The first
time you need a real restore, you do not want to be reading docs.

**Cadence**: every 90 days, or after a change to `backup-supabase.yml`.

**Procedure** (≈ 30 min):

1. **Create a scratch project** in the Supabase dashboard
   (`New project`, same region as production, smallest plan). Note its
   `host` and `service_role` key.
2. **Find the latest backup** in Backblaze B2. The bucket is
   `matlandgard-backups`, prefix `db/`. The most recent file is the
   largest one with today's or yesterday's date. Either:
   - open the Backblaze B2 web UI and copy the filename, or
   - run `b2 ls --recursive --versions b2://matlandgard-backups/db/ | tail -3`
3. **Download the dump** to your laptop:
   `b2 download-file-by-name b2://matlandgard-backups db/<file>.dump.gz .`
4. **Restore it** to the scratch project (the `service_role` connection
   string from step 1 must point at port 5432, not the pooler):
   ```bash
   gunzip -k <file>.dump.gz
   PGPASSWORD="<scratch-service-role-pw>" psql \
     -h db.<scratch-ref>.supabase.co -p 5432 -U postgres \
     -d postgres -f <file>.dump
   ```
   The `pg_dump` output is plain SQL (not `pg_dump -Fc` binary), so
   `psql` can replay it. It will be slow (15–30 min for a few hundred
   MB) and emit a few `ERROR: role ... does not exist` notices — these
   are expected and harmless (the dump tries to revoke/grab privileges
   on production-only roles).
5. **Verify row counts** match production:
   ```bash
   # In production
   psql $DATABASE_URL_DIRECT -c "SELECT count(*) FROM \"Order\";"

   # In scratch (replace with real creds)
   PGPASSWORD="..." psql -h db.<scratch-ref>.supabase.co ... \
     -c "SELECT count(*) FROM \"Order\";"
   ```
   Repeat for `Product`, `User`, and any other table the business
   cares about. A small drift (<1%) is fine if orders were in flight
   when the dump was taken.
6. **Record the result** in this section (date, duration, row counts
   match: yes/no, anything weird) so the next drill has a baseline.
7. **Delete the scratch project** to stop the meter.

**Last drill**: _not run yet_ — record below when first run.

| Date | Duration | Tables matched | Notes |
| --- | --- | --- | --- |

### Annual: confirm Sentry source maps are resolving

1. Trigger a thrown error from a tagged deploy. The easiest way: hit
   `/api/debug/sentry-test?msg=test-YYYYMMDD` if the endpoint is
   re-enabled; otherwise, raise a 500 from any route temporarily and
   revert.
2. Open the event in Sentry, find the top frame, click "View
   source". Confirm you see your file (not the bundled `chunks/*.js`).
3. If the frame is still opaque, check the release's
   `Source maps (debug files)` count > 0. If 0, the `sentry-cli`
   step in the Dockerfile is not running — check Dokploy build log
   for `>>> uploading Sentry source maps …` vs the skipped branch.

### One-time: enable meta-monitoring and budget alerts

These are user-side clicks, not code changes. Do them once and forget.

- **UptimeRobot "Monitor my monitors"**: UptimeRobot → Settings →
  "Monitor My Monitors" → toggle on. Emails you if UptimeRobot
  itself has an outage (otherwise the silence looks the same as your
  site being down).
- **Sentry quota alert**: Sentry → Settings → Subscription → "Set
  alert at 80% of monthly quota". Free tier = 5K errors/month and
  10K transactions/month; 80% gives ~5 days of runway.
- **Supabase project alerts**: Supabase project → Settings →
  Integrations → add a webhook or email for "Database size exceeds
  X MB" and "Disk usage exceeds X MB". Set X to ~80% of the free
  tier's 500 MB database cap.
- **Backblaze B2 budget alert**: Backblaze → Account → Billing →
  "Set a billing alert". The free tier is 10 GB storage; alert at
  8 GB so we can purge old dumps before hitting the cap.

**Status**: _not yet enabled_ — user to click the toggles above.
