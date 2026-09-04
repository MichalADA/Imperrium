#!/bin/sh
set -eu

docker compose up -d --build
docker compose exec -T backend node -e "if (!process.env.ADMIN_API_KEY) { console.error('Set ADMIN_API_KEY in .env before running verification.'); process.exit(1); }"
docker compose exec -T backend npx prisma migrate deploy
docker compose exec -T backend npm run seed:prod
docker compose exec -T backend npm run verify:database
docker compose exec -T backend npm run test:integration
docker compose exec -T backend node -e "fetch('http://127.0.0.1:3000/health/ready').then(async response => { if (!response.ok) throw new Error(await response.text()); console.log('Backend healthcheck:', await response.text()); })"
docker compose exec -T backend node -e "fetch('http://127.0.0.1:3000/api/openapi.json').then(async response => { const body = await response.json(); if (!response.ok || !body.paths['/api/admin/import']) throw new Error('Invalid OpenAPI document'); console.log('OpenAPI paths:', Object.keys(body.paths).length); })"
docker compose exec -T frontend wget -qO- http://127.0.0.1/health
docker compose exec -T backend npm run verify:persistence:prepare
docker compose restart backend

attempt=0
until docker compose exec -T backend node -e "fetch('http://127.0.0.1:3000/health/ready').then(response => process.exit(response.ok ? 0 : 1)).catch(() => process.exit(1))"; do
  attempt=$((attempt + 1))
  if [ "$attempt" -ge 30 ]; then
    echo "Backend did not become ready after restart." >&2
    exit 1
  fi
  sleep 2
done

docker compose exec -T backend npm run verify:persistence:check
echo "Wiki Imperium: full Docker Compose verification passed."
