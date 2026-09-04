#!/bin/sh
set -eu

# Starsze instalacje projektu powstały przez `prisma db push` i nie mają tabeli
# `_prisma_migrations`. Przy pierwszym uruchomieniu synchronizujemy taki schemat
# i oznaczamy dołączone migracje jako baseline. Kolejne uruchomienia wykonują już
# wyłącznie oczekujące migracje, dzięki czemu nie powstaje konflikt P3005.
migration_history_status=0
node --input-type=module <<'NODE' || migration_history_status=$?
import { PrismaClient } from "@prisma/client";

const database = new PrismaClient();
try {
  const rows = await database.$queryRawUnsafe(
    `SELECT to_regclass('public."_prisma_migrations"') IS NOT NULL AS "exists"`,
  );
  process.exitCode = rows[0]?.exists ? 0 : 42;
} catch (error) {
  console.error("Nie udało się sprawdzić historii migracji:", error);
  process.exitCode = 1;
} finally {
  await database.$disconnect();
}
NODE

if [ "$migration_history_status" -eq 42 ]; then
  echo "Brak historii migracji. Synchronizuję istniejący schemat i tworzę baseline."
  npx prisma db push --skip-generate

  for migration_file in prisma/migrations/*/migration.sql; do
    [ -f "$migration_file" ] || continue
    migration_name=$(basename "$(dirname "$migration_file")")
    npx prisma migrate resolve --applied "$migration_name"
  done
elif [ "$migration_history_status" -ne 0 ]; then
  exit "$migration_history_status"
fi

npx prisma migrate deploy
node dist/prisma/seed.js
node dist/src/scripts/import-lore-files.js
exec node dist/src/index.js
