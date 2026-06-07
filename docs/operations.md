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
- **Source maps**: uploaded by the `@sentry/nextjs` build plugin. The
  `withSentryConfig` block in `next.config.ts` controls upload behavior.
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
