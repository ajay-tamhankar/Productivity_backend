#!/bin/sh
set -eu

if [ -z "${DATABASE_URL:-}" ]; then
  echo "DATABASE_URL is required"
  exit 1
fi

echo "Running Prisma migrations..."
npx prisma migrate deploy

echo "Starting NestJS API on port ${PORT:-10000}..."
exec node dist/main.js
