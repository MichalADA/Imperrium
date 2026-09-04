import { prisma } from "../prisma.js";

const slugs = [
  "izabela-de-la-cruz",
  "octavian-wielki",
  "octavia-de-la-cruz",
  "teodozjusz-i",
  "francesco-de-la-cruz",
  "teodozjusz-ii",
  "octavian-syn-teodozjusza-ii",
  "ignacius-de-la-cruz",
  "konstancja-de-la-cruz",
] as const;

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const entries = await prisma.entry.findMany({
  where: { slug: { in: [...slugs] } },
  include: { outgoing: { include: { target: { select: { slug: true } } } } },
});
const bySlug = new Map(entries.map((entry) => [entry.slug, entry]));
const relation = (source: string, target: string, type: string) =>
  bySlug.get(source)?.outgoing.some((item) => item.target.slug === target && item.type === type) ?? false;

assert(entries.length === slugs.length, "PostgreSQL: brakuje postaci dynastii de la Cruz.");
assert(bySlug.get("francesco-de-la-cruz")?.birthYear === 471 && bySlug.get("francesco-de-la-cruz")?.deathYear === 556, "PostgreSQL: błędne daty Francesco.");
assert(bySlug.get("teodozjusz-ii")?.birthYear === 501 && bySlug.get("teodozjusz-ii")?.deathYear === 591, "PostgreSQL: błędne daty Teodozjusza II.");
assert(bySlug.get("ignacius-de-la-cruz")?.birthYear === 559 && 607 - 559 === 48, "PostgreSQL: błędny wiek Ignaciusa.");
assert(bySlug.get("konstancja-de-la-cruz")?.birthYear === 588 && 607 - 588 === 19, "PostgreSQL: błędny wiek Konstancji.");

assert(relation("francesco-de-la-cruz", "teodozjusz-i", "father"), "PostgreSQL: Teodozjusz I nie jest ojcem Francesco.");
assert(relation("francesco-de-la-cruz", "teodozjusz-ii", "sibling"), "PostgreSQL: Francesco i Teodozjusz II nie są braćmi.");
assert(!relation("francesco-de-la-cruz", "teodozjusz-ii", "child"), "PostgreSQL: sukcesja błędnie utworzyła relację child.");
assert(!relation("teodozjusz-ii", "francesco-de-la-cruz", "child"), "PostgreSQL: bracia są błędnie połączeni jako parent-child.");
assert(relation("konstancja-de-la-cruz", "ignacius-de-la-cruz", "father"), "PostgreSQL: brak ojca Konstancji.");
assert(relation("ignacius-de-la-cruz", "konstancja-de-la-cruz", "child"), "PostgreSQL: brak odwrotnej relacji dziecka Ignaciusa.");
assert(relation("octavian-wielki", "octavia-de-la-cruz", "twin") && relation("octavia-de-la-cruz", "octavian-wielki", "twin"), "PostgreSQL: bliźnięta nie są połączone dwukierunkowo.");
assert(relation("octavian-wielki", "izabela-de-la-cruz", "mother") && relation("octavia-de-la-cruz", "izabela-de-la-cruz", "mother"), "PostgreSQL: brak relacji Izabeli z dziećmi.");

const succession = ["octavian-wielki", "teodozjusz-i", "francesco-de-la-cruz", "teodozjusz-ii", "ignacius-de-la-cruz"];
for (let index = 0; index < succession.length - 1; index += 1) {
  assert(relation(succession[index], succession[index + 1], "successor"), `PostgreSQL: brak następcy po ${succession[index]}.`);
  assert(relation(succession[index + 1], succession[index], "predecessor"), `PostgreSQL: brak poprzednika dla ${succession[index + 1]}.`);
}

console.log("PostgreSQL verified: dynasty dates, family, twins, bidirectional relations and succession are consistent.");
await prisma.$disconnect();
