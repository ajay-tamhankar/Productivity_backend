#!/bin/sh
set -eu

if [ -z "${DATABASE_URL:-}" ]; then
  echo "DATABASE_URL is required"
  exit 1
fi

echo "Running Prisma migrations..."

# Try migrate deploy first. If P3005 (DB already has schema but no migration history),
# baseline the migration as already applied, then retry.
MIGRATE_OUTPUT=$(npx prisma migrate deploy 2>&1) && echo "$MIGRATE_OUTPUT" || {
  if echo "$MIGRATE_OUTPUT" | grep -q "P3005"; then
    echo "Detected existing database schema (P3005). Baselining migration history..."
    npx prisma migrate resolve --applied "20260319000000_init"
    echo "Baseline done. Re-running migrations..."
    npx prisma migrate deploy
  else
    echo "$MIGRATE_OUTPUT" >&2
    exit 1
  fi
}

echo "Starting NestJS API on port ${PORT:-10000}..."
exec node dist/src/main.js
