#!/bin/sh
set -e

# Prisma migrations need a DIRECT (session-mode) database connection.
# Our runtime DATABASE_URL points at the pgbouncer transaction pooler
# (port 6543, pgbouncer=true), which does NOT support the advisory locks
# and DDL that `migrate deploy` requires — running migrations against it
# hangs forever. If DIRECT_URL is set (session pooler, port 5432), use it
# for the migration step only; the app itself keeps using DATABASE_URL.
if [ -n "$DIRECT_URL" ]; then
  MIGRATE_DATABASE_URL="$DIRECT_URL"
else
  MIGRATE_DATABASE_URL="$DATABASE_URL"
fi

echo "[entrypoint] Running Prisma migrations..."
DATABASE_URL="$MIGRATE_DATABASE_URL" ./node_modules/.bin/prisma migrate deploy
echo "[entrypoint] Migrations complete."

echo "[entrypoint] Starting Next.js..."
exec node server.js
