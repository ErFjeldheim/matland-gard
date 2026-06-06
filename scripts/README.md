# Scripts

Utility scripts for data sync, migrations, QA, and one-off operations.
All run via `npm run <name>` from the repo root, or directly with `tsx <file>.ts`.

## Daily operations & QA

| npm script | File | Purpose |
|---|---|---|
| `qa:env` | `qa-verify-env.ts` | Verify required env vars are present |
| `qa:data` | `qa-verify-data.ts` | Verify Prisma can read products/settings |
| `qa:orders` | `qa-diagnose-orders.ts` | Diagnose order-related issues |
| `scripts:ops-check` | `ops-check.sh` | SSH to production, check `.env` perms + git status |

## Inspect / debug

| npm script | File | Purpose |
|---|---|---|
| `scripts:list-orders` | `list-last-orders.ts` | Print last 10 orders with customer + status |
| `scripts:list-products` | `list-products.ts` | Dump all products as JSON |
| `scripts:test-prisma` | `test-prisma.ts` | Round-trip a Prisma query against `DATABASE_URL` |
| `scripts:test-email` | `test-email.ts` | Send a test order confirmation + admin email |
| `scripts:check-stock` | `check-stock-units.ts` | Print current `stockUnit` per product |

## Data updates (one-off)

| npm script | File | Purpose |
|---|---|---|
| `scripts:update-stock` | `update-stock.ts` | Reset all product stock to 1000 |
| `scripts:update-stock-units` | `update-stock-units.ts` | Assign `stockUnit` (`storsekk` / `tonn` / `stk.`) by product name |
| `scripts:update-product-images` | `update-all-product-images.ts` | Walk `public/images/products/*` and write `image` + `images[]` to DB |
| `scripts:add-slugs` | `add-slugs.ts` | Backfill URL slugs on existing products |
| `scripts:seed-settings` | `seed-settings.ts` | Upsert default shipping/price/contact settings |

## Local dev helpers

| npm script | File | Purpose |
|---|---|---|
| `scripts:sync-prod` | `sync-prod-data.sh` | `pg_dump` from production → import to local `docker-compose.dev.yml` DB |

## Legacy / unmaintained

These predate the reorganization. Keep for reference; don't run unless you know what you're doing.

- `check-hero-text.js`, `check-settings.js`, `insert-settings.js` — one-off checks from early development
- `debug-order-full.js`, `send-email-manual.js`, `test-render.js`, `test-simple.ts` — ad-hoc debug helpers

## Conventions

- New TypeScript scripts: add to `scripts/`, expose via `package.json` under a `scripts:*` namespace
- New shell scripts: `scripts/*.sh`, expose via `package.json` under `scripts:*` (use `bash` not `sh`)
- One-off fixes should still be checked in — they form an audit trail of what changed and when
