# Archiwum Imperium Technokratycznego

Prywatna, lokalna encyklopedia fikcyjnego świata. Projekt zawiera responsywny frontend React, REST API w Node.js oraz bazę PostgreSQL zarządzaną przez Prisma.

## Uruchomienie

1. Skopiuj `.env.example` do `.env` i koniecznie ustaw własne, silne wartości `ADMIN_API_KEY` oraz haseł.
2. Uruchom:

```bash
docker compose up -d --build
```

3. Otwórz `http://localhost:8080`.

Pierwsze uruchomienie rozpoznaje bazę utworzoną przez starsze wersje, synchronizuje jej schemat i bezpiecznie rejestruje istniejące migracje jako baseline. Następne uruchomienia wykonują już wyłącznie oczekujące migracje Prisma oraz idempotentnie aktualizują seed. Dane PostgreSQL pozostają w wolumenie `imperium_postgres_data`, a zdjęcia w osobnym wolumenie `imperium_uploads`, więc oba rodzaje danych przetrwają restart kontenerów.

Obecny rok świata to **607**. Seed dynastii zapisuje genealogię (`father`, `mother`, `parent`, `child`, `sibling`, `twin`, `spouse`) niezależnie od sukcesji (`predecessor`, `successor`). Przed odtworzeniem kanonicznych relacji usuwa wcześniejsze błędne powiązania wewnątrz dynastii de la Cruz. Na końcu ponownie odczytuje daty i relacje z PostgreSQL; niespójność zatrzymuje start backendu.

## Przydatne polecenia

```bash
docker compose ps
docker compose logs -f backend
docker compose exec backend npm run test:integration
docker compose down
```

Pełna kontrola migracji, seedu, PostgreSQL, testów API, dokumentacji, frontendu oraz trwałości zdjęć po restarcie backendu:

```bash
./scripts/verify-compose.sh
```

Usunięcie kontenerów nie usuwa bazy. Jeżeli świadomie chcesz wyczyścić wszystkie dane, użyj `docker compose down -v`.

## API

Kompletne REST API obejmuje postacie, prowincje, miasta, rody, dynastie, języki, firmy, instytucje, uniwersytety, wydarzenia, technologie, lokacje, artykuły i relacje. Zasoby obsługują `GET`, `POST`, `PATCH` i `DELETE` oraz identyfikację przez UUID albo stabilny slug.

- `GET /api/dashboard`
- `GET /api/entries?type=CHARACTER`
- `GET /api/entries/:slug`
- `GET /api/search?q=Octavian`
- `GET /api/timeline`
- `POST /api/entries`
- `PUT /api/entries/:slug`
- `DELETE /api/entries/:slug`
- `POST /api/entries/:slug/image` — pole formularza `image`, JPG/PNG/WEBP, maks. 10 MB
- `DELETE /api/entries/:slug/image`
- `GET /api/entries/:slug/revisions`
- `GET /health/live`
- `GET /health/ready`
- `POST /api/admin/bulk` — transakcyjny import create-only
- `POST /api/admin/import?dryRun=true` — walidacja i symulacja upsertu
- `POST /api/characters/:idOrSlug/image`
- `POST /api/provinces/:idOrSlug/image`

Operacje zapisu wymagają `Authorization: Bearer <API_KEY>`. Klucz pochodzi wyłącznie ze zmiennej backendu `ADMIN_API_KEY`; bez ustawionego klucza zapis jest wyłączony. Panel pozwala podać klucz w przeglądarce bez umieszczania go w bundle aplikacji. Dokumentacja API jest dostępna pod `/api/docs`, a specyfikacja pod `/api/openapi.json`.

Praktyczne przykłady dodawania postaci, prowincji, firm, języków, wydarzeń, relacji i zdjęć kodem znajdują się w [`README-DODAWANIE-LORE.md`](./README-DODAWANIE-LORE.md).

Pliki zdjęć otrzymują losowe nazwy UUID. Backend sprawdza zadeklarowany MIME i sygnaturę zawartości, odrzuca przekroczenie limitu oraz nie wykorzystuje nazwy przesłanej przez użytkownika. PostgreSQL przechowuje tylko bezpieczną nazwę pliku i metadane. Model `Media` ma role `PROFILE`, `COVER` i `GALLERY`, dzięki czemu może zostać rozszerzony o galerie bez zmiany mechanizmu składowania.

## Rozwój bez Dockera

Frontend i backend mają osobne pliki `package.json`. Ustaw lokalny `DATABASE_URL`, uruchom PostgreSQL, a następnie:

```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npm run seed
npm run build
npm run verify:dynasty
npm run verify:media
npm run dev
```

W drugim terminalu:

```bash
cd frontend
npm install
npm run dev
```
# Imperrium
