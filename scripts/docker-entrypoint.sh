#!/bin/sh
set -eu

if [ -z "${DATABASE_URL:-}" ]; then
  echo "DATABASE_URL is required"
  exit 1
fi

echo "Resolving Prisma migration baseline..."
npx prisma migrate resolve --applied 20260319000000_init || true

echo "Running Prisma migrations..."
npx prisma migrate deploy

echo "Starting NestJS API on port ${PORT:-10000}..."
exec node dist/src/main.js
