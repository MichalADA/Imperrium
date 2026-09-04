# Pliki lore Wiki Imperium

Pełny poradnik z przykładami wszystkich encji, relacji, zdjęć, poleceń `curl` i rozszerzania API znajduje się w [`../README-DODAWANIE-LORE.md`](../README-DODAWANIE-LORE.md).

Plik JSON ma ten sam format co `POST /api/admin/import`. Import jest transakcyjny i domyślnie działa jako `upsert` po stabilnym `slug`.

W podsumowaniu `relationshipsCreated` oznacza liczbę fizycznie utworzonych rekordów, łącznie z automatycznie dodanymi relacjami odwrotnymi.

```json
{
  "mode": "upsert",
  "characters": [
    {
      "slug": "octavia-de-la-cruz",
      "firstName": "Octavia",
      "lastName": "de la Cruz",
      "birthYear": 428,
      "deathYear": 548,
      "description": "Siostra bliźniaczka Octaviana Wielkiego."
    }
  ],
  "relationships": [
    {
      "source": "octavia-de-la-cruz",
      "target": "octavian-wielki",
      "type": "twin"
    }
  ]
}
```

Obsługiwane kolekcje: `characters`, `provinces`, `cities`, `families`, `dynasties`, `languages`, `companies`, `institutions`, `universities`, `events`, `technologies`, `locations`, `articles`, `relationships`.

Typy relacji rodzinnych: `father`, `mother`, `parent`, `child`, `sibling`, `twin`, `spouse`. Typy sukcesji: `predecessor`, `successor`. Dostępny jest też neutralny typ `other`.

Walidacja bez zapisu:

```bash
npm run lore:validate ./lore/imports/de-la-cruz.json
```

Walidacja, a następnie import:

```bash
npm run lore:import ./lore/imports/de-la-cruz.json
```

Skrypt odczytuje `ADMIN_API_KEY` z bieżącego środowiska albo z głównego pliku `.env`. Adres backendu można zmienić przez `IMPERIUM_API_URL`. Pełna dokumentacja i przykłady są dostępne w `/api/docs` oraz `/api/openapi.json`.
