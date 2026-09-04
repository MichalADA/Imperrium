# Dodawanie i aktualizowanie lore kodem

Ten poradnik opisuje zarządzanie danymi Wiki Imperium bez używania panelu administracyjnego. Najbezpieczniejsza metoda to pliki JSON w katalogu `lore/`, ponieważ przed właściwym importem wykonywany jest automatyczny dry-run.

## 1. Przygotowanie

Skopiuj konfigurację i ustaw własny klucz administratora:

```bash
cp .env.example .env
```

W `.env` zmień co najmniej:

```dotenv
ADMIN_API_KEY=tu-wstaw-dlugi-losowy-klucz
```

Następnie uruchom aplikację:

```bash
docker compose up -d --build
```

Publiczny frontend działa domyślnie pod `http://localhost:8080`, API pod `http://localhost:3000`, a interaktywna dokumentacja pod `http://localhost:3000/api/docs`.

Jeżeli chcesz uruchamiać skrypt importujący bezpośrednio na hoście, jednorazowo zainstaluj zależności backendu:

```bash
npm --prefix backend ci
```

## 2. Zalecana metoda: pliki JSON

Pliki można trzymać tematycznie, na przykład:

```text
lore/
  characters/de-la-cruz.json
  provinces/profan.json
  companies/xen.json
  languages/delan.json
  events/wielka-bitwa.json
  imports/pakiet-startowy.json
```

Każdy plik ma format zgodny z `POST /api/admin/import`:

```json
{
  "mode": "upsert",
  "characters": [],
  "provinces": [],
  "cities": [],
  "families": [],
  "dynasties": [],
  "languages": [],
  "companies": [],
  "institutions": [],
  "universities": [],
  "events": [],
  "technologies": [],
  "locations": [],
  "articles": [],
  "relationships": []
}
```

Nie trzeba wpisywać pustych kolekcji. Wystarczą te, które znajdują się w danym pliku.

### Tryby importu

- `"mode": "upsert"` — zalecany. Istniejący `slug` jest aktualizowany, a brakujący tworzony.
- `"mode": "create"` — import przerwie się, jeżeli którykolwiek `slug` już istnieje.
- `POST /api/admin/bulk` — zawsze działa jak `create` i służy do jednorazowego dodawania całej paczki.

Cały import jest jedną transakcją PostgreSQL. Jeżeli jeden wpis lub relacja jest błędna, nic z danego pliku nie zostanie zapisane.

### Walidacja i import

Sama walidacja, bez zmiany bazy:

```bash
npm run lore:validate ./lore/characters/de-la-cruz.json
```

Dry-run, a po jego powodzeniu właściwy import:

```bash
npm run lore:import ./lore/characters/de-la-cruz.json
```

Skrypt odczytuje `ADMIN_API_KEY` z głównego pliku `.env`. Inny adres API można ustawić tak:

```bash
IMPERIUM_API_URL=http://serwer-wiki:3000 npm run lore:import ./lore/imports/pakiet.json
```

## 3. Pola wpisów

Najczęściej używane pola:

| Pole | Znaczenie |
| --- | --- |
| `slug` | Stabilny, unikalny identyfikator używany w URL-ach i relacjach. |
| `firstName`, `lastName` | Imię i nazwisko postaci. |
| `title` | Tytuł honorowy postaci; dla pozostałych encji może być nazwą. |
| `name` lub `displayName` | Nazwa encji innej niż postać. |
| `summary` | Krótki opis na listach. |
| `description` lub `content` | Główna treść artykułu. |
| `aliases` | Tablica alternatywnych nazw. |
| `tags` | Tablica tagów. |
| `infobox` | Dowolne dodatkowe pola tekstowe, liczbowe, logiczne albo `null`. |
| `status` | `PUBLISHED` albo `DRAFT`. |
| `isFeatured` | Czy wpis ma być wyróżniony. |
| `birthYear`, `deathYear` | Rok urodzenia i śmierci postaci. |
| `reignStartYear`, `reignEndYear` | Początek i koniec panowania; `null` oznacza brak danych lub trwające panowanie. |
| `changeNote` | Opis zmiany zapisany przy rewizji. |

Nieznane informacje zapisuj jako `null` albo pomijaj. Nie wpisuj wymyślonych wartości. W żądaniu `PATCH` pominięte pole pozostaje bez zmian, natomiast jawne `null` usuwa wartość pola opcjonalnego.

### Postać

```json
{
  "mode": "upsert",
  "characters": [
    {
      "slug": "octavia-de-la-cruz",
      "firstName": "Octavia",
      "lastName": "de la Cruz",
      "title": null,
      "birthYear": 428,
      "deathYear": 548,
      "summary": "Siostra bliźniaczka Octaviana Wielkiego.",
      "description": "Córka Izabeli de la Cruz i siostra bliźniaczka Octaviana Wielkiego.",
      "aliases": [],
      "tags": ["de la Cruz"],
      "status": "PUBLISHED",
      "changeNote": "Uzupełnienie kanonu dynastii"
    }
  ]
}
```

### Prowincja

```json
{
  "mode": "upsert",
  "provinces": [
    {
      "slug": "profan",
      "name": "Profan",
      "summary": "Prowincja jezior i mostów.",
      "content": "Opis zgodny z ustalonym lore.",
      "infobox": {
        "stolica": null,
        "status": "prowincja"
      },
      "tags": ["prowincja"],
      "status": "PUBLISHED"
    }
  ]
}
```

### Firma, język i wydarzenie w jednym imporcie

```json
{
  "mode": "upsert",
  "companies": [
    {
      "slug": "xen",
      "name": "Xen",
      "summary": "Brak danych.",
      "status": "DRAFT"
    }
  ],
  "languages": [
    {
      "slug": "delan",
      "name": "Delan",
      "description": "Język inspirowany portugalskim, flamandzkim i włoskim."
    }
  ],
  "events": [
    {
      "slug": "przykladowe-wydarzenie",
      "name": "Przykładowe wydarzenie",
      "description": "Brak danych.",
      "infobox": {
        "rok": null
      },
      "status": "DRAFT"
    }
  ]
}
```

## 4. Relacje postaci

`source` i `target` mogą być UUID-em albo slugiem. Typ relacji opisuje, kim `target` jest dla `source`.

| Zapis | Znaczenie | Automatyczna relacja odwrotna |
| --- | --- | --- |
| `A -> B, father` | B jest ojcem A | `B -> A, child` |
| `A -> B, mother` | B jest matką A | `B -> A, child` |
| `A -> B, parent` | B jest rodzicem A | `B -> A, child` |
| `A -> B, child` | B jest dzieckiem A | `B -> A, parent` |
| `A -> B, sibling` | B jest rodzeństwem A | `B -> A, sibling` |
| `A -> B, twin` | B jest bliźnięciem A | `B -> A, twin` |
| `A -> B, spouse` | B jest małżonkiem A | `B -> A, spouse` |
| `A -> B, predecessor` | B jest poprzednikiem A | `B -> A, successor` |
| `A -> B, successor` | B jest następcą A | `B -> A, predecessor` |
| `A -> B, other` | Inna opisana relacja | `B -> A, other` |

Genealogia nie jest wyliczana z sukcesji. `successor` nigdy nie tworzy `child`, a `predecessor` nigdy nie tworzy `parent`.

Przykładowy import:

```json
{
  "mode": "upsert",
  "relationships": [
    {
      "source": "konstancja-de-la-cruz",
      "target": "ignacius-de-la-cruz",
      "type": "father"
    },
    {
      "source": "octavia-de-la-cruz",
      "target": "octavian-wielki",
      "type": "twin",
      "description": "Siostra bliźniaczka / brat bliźniak."
    },
    {
      "source": "francesco-de-la-cruz",
      "target": "teodozjusz-ii",
      "type": "successor"
    }
  ]
}
```

Import relacji dodaje lub aktualizuje wskazane relacje, ale nie usuwa niewymienionych relacji. Do usuwania użyj `DELETE /api/relationships/:id` albo pełnej edycji zestawu relacji postaci opisanej niżej.

## 5. Pojedyncze operacje REST API

W poniższych przykładach zmienna zawiera ten sam klucz co `.env`:

```bash
export ADMIN_API_KEY='tu-wstaw-dlugi-losowy-klucz'
```

### Dodanie postaci

```bash
curl -X POST http://localhost:3000/api/characters \
  -H "Authorization: Bearer $ADMIN_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{
    "slug": "nowa-postac",
    "firstName": "Nowa",
    "lastName": "Postać",
    "birthYear": 607,
    "deathYear": null,
    "description": "Brak danych."
  }'
```

### Odczyt po slugu

Odczyt opublikowanych danych nie wymaga klucza:

```bash
curl http://localhost:3000/api/characters/octavia-de-la-cruz
```

Lista z wyszukiwaniem i paginacją:

```bash
curl 'http://localhost:3000/api/characters?search=Teodo&page=1&limit=20'
```

### Częściowa aktualizacja

```bash
curl -X PATCH http://localhost:3000/api/characters/nowa-postac \
  -H "Authorization: Bearer $ADMIN_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{
    "summary": "Nowy krótki opis.",
    "changeNote": "Aktualizacja opisu"
  }'
```

### Usunięcie wpisu

```bash
curl -X DELETE http://localhost:3000/api/characters/nowa-postac \
  -H "Authorization: Bearer $ADMIN_API_KEY"
```

### Dodanie jednej relacji

```bash
curl -X POST http://localhost:3000/api/relationships \
  -H "Authorization: Bearer $ADMIN_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{
    "source": "konstancja-de-la-cruz",
    "target": "ignacius-de-la-cruz",
    "type": "father"
  }'
```

Backend zapisze również odwrotność `Ignacius -> Konstancja, child` w tej samej transakcji.

### Lista i usuwanie relacji

```bash
curl 'http://localhost:3000/api/relationships?source=konstancja-de-la-cruz'
```

Z odpowiedzi skopiuj `id` relacji, a następnie:

```bash
curl -X DELETE http://localhost:3000/api/relationships/UUID_RELACJI \
  -H "Authorization: Bearer $ADMIN_API_KEY"
```

Usunięta zostanie również relacja odwrotna.

### Pełna edycja rodziny i sukcesji postaci

Ten endpoint zastępuje cały zarządzany zestaw relacji postaci. Trzeba przesłać kompletny oczekiwany stan, nie tylko jedno zmieniane pole.

```bash
curl -X PATCH http://localhost:3000/api/characters/konstancja-de-la-cruz/relationships \
  -H "Authorization: Bearer $ADMIN_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{
    "father": "ignacius-de-la-cruz",
    "mother": null,
    "parents": [],
    "siblings": [],
    "spouses": [],
    "children": [],
    "predecessor": null,
    "successor": null
  }'
```

Rodzeństwo bliźniacze zapisuje się tak:

```json
{
  "siblings": [
    { "target": "octavian-wielki", "type": "twin" }
  ]
}
```

Do zwykłego, pojedynczego dodania relacji bez zastępowania pozostałych używaj `POST /api/relationships`.

## 6. Import przez curl

Dry-run:

```bash
curl -X POST 'http://localhost:3000/api/admin/import?dryRun=true' \
  -H "Authorization: Bearer $ADMIN_API_KEY" \
  -H 'Content-Type: application/json' \
  --data-binary @lore/imports/de-la-cruz.json
```

Właściwy import:

```bash
curl -X POST http://localhost:3000/api/admin/import \
  -H "Authorization: Bearer $ADMIN_API_KEY" \
  -H 'Content-Type: application/json' \
  --data-binary @lore/imports/de-la-cruz.json
```

Poprawny dry-run zwraca `"valid": true`. Błędy zawierają nazwę encji, slug, pole i komunikat, a baza pozostaje niezmieniona.

## 7. Zdjęcia postaci i prowincji

Obrazów nie wpisuje się do JSON-a jako base64. Najpierw utwórz albo zaktualizuj wpis, a potem prześlij plik osobnym żądaniem.

Zdjęcie profilowe postaci:

```bash
curl -X POST http://localhost:3000/api/characters/octavia-de-la-cruz/image \
  -H "Authorization: Bearer $ADMIN_API_KEY" \
  -F 'image=@./obrazy/octavia.webp'
```

Zdjęcie główne prowincji:

```bash
curl -X POST http://localhost:3000/api/provinces/profan/image \
  -H "Authorization: Bearer $ADMIN_API_KEY" \
  -F 'image=@./obrazy/profan.jpg'
```

Zmiana zdjęcia używa tego samego `POST`. Usunięcie:

```bash
curl -X DELETE http://localhost:3000/api/characters/octavia-de-la-cruz/image \
  -H "Authorization: Bearer $ADMIN_API_KEY"
```

Dozwolone są JPG, JPEG, PNG i WEBP do 10 MB. Backend sprawdza MIME i rzeczywistą sygnaturę pliku. Obrazy są przechowywane w trwałym wolumenie `imperium_uploads`, nie w PostgreSQL.

## 8. Dostępne endpointy zasobów

Każdy z poniższych endpointów obsługuje `GET`, `POST`, `PATCH /:idOrSlug` oraz `DELETE /:idOrSlug`:

- `/api/characters`
- `/api/provinces`
- `/api/cities`
- `/api/families`
- `/api/dynasties`
- `/api/languages`
- `/api/companies`
- `/api/institutions`
- `/api/universities`
- `/api/events`
- `/api/technologies`
- `/api/locations`
- `/api/articles`

Pełne schematy żądań i odpowiedzi są zawsze dostępne w Swagger UI pod `/api/docs` oraz jako JSON pod `/api/openapi.json`.

## 9. Kiedy zmieniać seed

Do zwykłego rozwijania świata używaj plików `lore/*.json`. Seed w `backend/prisma/seed.ts` jest przeznaczony dla bazowego, kanonicznego zestawu danych potrzebnego po postawieniu pustej bazy.

Jeżeli zmieniasz seed:

1. Zachowaj operacje idempotentne (`upsert` zamiast bezwarunkowego `create`).
2. Nie twórz drugiej kopii istniejącej postaci pod innym slugiem.
3. Relacje rodzinne i sukcesję zapisuj osobno.
4. Nie wyliczaj rodziny z kolejności panowania.
5. Po zmianie uruchom pełną kontrolę:

```bash
./scripts/verify-compose.sh
```

## 10. Dodanie całkiem nowej kategorii encji

Ta sekcja dotyczy programisty rozbudowującego samo API, a nie dodawania kolejnego wpisu do istniejącej kategorii.

1. Dodaj wartość do `EntryType` w `backend/prisma/schema.prisma`.
2. Utwórz migrację Prisma.
3. Dodaj mapowanie pluralnej nazwy endpointu w `resourceDefinitions` w `backend/src/services/resources.ts`.
4. Dodaj kolekcję do `resourceCollections` w `backend/src/schemas/resource.ts`.
5. Jeżeli encja ma specjalne pola lub reguły, dodaj je do schematu wejściowego i serwisu zasobów.
6. Dodaj test integracyjny CRUD i importu.
7. OpenAPI wygeneruje standardowe ścieżki automatycznie z `resourceDefinitions`; specjalne operacje trzeba dopisać ręcznie.
8. Jeżeli nowa encja ma być dostępna w panelu, dodaj ją również do nawigacji i formularzy frontendu.

Po zmianie uruchom:

```bash
npm --prefix backend run test:static
npm --prefix frontend run build
./scripts/verify-compose.sh
```

## 11. Najczęstsze pułapki

- Nie zmieniaj slugu po opublikowaniu, jeżeli inne pliki używają go w relacjach.
- `deathYear` nie może być mniejszy niż `birthYear`.
- `reignEndYear` nie może być mniejszy niż `reignStartYear`.
- Postać nie może być własnym rodzicem, dzieckiem, rodzeństwem ani małżonkiem.
- Backend blokuje oczywiste cykle rodzic-dziecko.
- Duża różnica wieku między rodzeństwem i bardzo długie życie są dozwolone — to fikcyjny świat.
- `PATCH /api/characters/:slug/relationships` zastępuje cały zestaw rodziny i sukcesji tej postaci.
- `POST /api/relationships` dodaje jedną relację bez usuwania pozostałych.
- Nie zapisuj obrazów jako base64 w JSON-ie ani w PostgreSQL.
- Nie umieszczaj `ADMIN_API_KEY` w kodzie frontendu ani w repozytorium.
