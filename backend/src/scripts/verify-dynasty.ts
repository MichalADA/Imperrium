import { allEntries, relations } from "../../prisma/seed.js";

const CURRENT_WORLD_YEAR = 607;
const allowedRelationTypes = new Set(["father", "mother", "parent", "child", "sibling", "twin", "spouse", "predecessor", "successor", "other"]);
const entries = new Map(allEntries.map((entry) => [entry.slug, entry]));
const relationKey = (source: string, target: string, type: string) => `${source}|${target}|${type}`;
const relationKeys = new Set(relations.map(([source, target, type]) => relationKey(source, target, type)));

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function assertDates(slug: string, birthYear: number, deathYear: number | null, reignStartYear: number | null = null, reignEndYear: number | null = null): void {
  const entry = entries.get(slug);
  assert(entry, `Brak wpisu ${slug}`);
  assert(entry.birthYear === birthYear, `Błędny rok urodzenia: ${slug}`);
  assert((entry.deathYear ?? null) === deathYear, `Błędny rok śmierci: ${slug}`);
  assert((entry.reignStartYear ?? null) === reignStartYear, `Błędny początek panowania: ${slug}`);
  assert((entry.reignEndYear ?? null) === reignEndYear, `Błędny koniec panowania: ${slug}`);
}

assertDates("izabela-de-la-cruz", 409, 449);
assertDates("octavian-wielki", 428, 514);
assertDates("octavia-de-la-cruz", 428, 548);
assertDates("teodozjusz-i", 446, 521, 514, 521);
assertDates("francesco-de-la-cruz", 471, 556, 521, 556);
assertDates("teodozjusz-ii", 501, 591, 556, 591);
assertDates("octavian-syn-teodozjusza-ii", 556, 586);
assertDates("ignacius-de-la-cruz", 559, null, 591, null);
assertDates("konstancja-de-la-cruz", 588, null);

assert(CURRENT_WORLD_YEAR - 559 === 48, "Ignacius powinien mieć 48 lat");
assert(CURRENT_WORLD_YEAR - 588 === 19, "Konstancja powinna mieć 19 lat");
assert(CURRENT_WORLD_YEAR - 591 === 16, "Panowanie Ignaciusa powinno trwać 16 lat");

const succession = ["octavian-wielki", "teodozjusz-i", "francesco-de-la-cruz", "teodozjusz-ii", "ignacius-de-la-cruz"];
for (let index = 0; index < succession.length - 1; index += 1) {
  assert(relationKeys.has(relationKey(succession[index], succession[index + 1], "successor")), `Brak następcy po ${succession[index]}`);
  assert(relationKeys.has(relationKey(succession[index + 1], succession[index], "predecessor")), `Brak poprzednika dla ${succession[index + 1]}`);
}

assert(relationKeys.has(relationKey("francesco-de-la-cruz", "teodozjusz-ii", "sibling")), "Francesco i Teodozjusz II muszą być braćmi");
assert(!relationKeys.has(relationKey("francesco-de-la-cruz", "teodozjusz-ii", "child")), "Teodozjusz II nie jest dzieckiem Francesco");
assert(!relationKeys.has(relationKey("francesco-de-la-cruz", "octavian-wielki", "father")), "Octavian Wielki nie jest ojcem Francesco");
assert(!relationKeys.has(relationKey("octavian-wielki", "francesco-de-la-cruz", "child")), "Francesco nie jest dzieckiem Octaviana Wielkiego");
assert(!relationKeys.has(relationKey("teodozjusz-ii", "francesco-de-la-cruz", "child")), "Francesco nie jest dzieckiem Teodozjusza II");

const twinRelations = relations.filter(([source, target, type, , isTwin]) =>
  type === "twin" && isTwin && new Set([source, target]).has("octavian-wielki") && new Set([source, target]).has("octavia-de-la-cruz"));
assert(twinRelations.length === 2, "Relacja bliźniąt musi istnieć w obu kierunkach");

for (const [, , type] of relations) assert(allowedRelationTypes.has(type), `Niedozwolony typ relacji: ${type}`);

console.log("Dynasty seed verified: dates, ages, genealogy, twins and succession are consistent.");
