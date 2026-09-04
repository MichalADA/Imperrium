import { Crown, GitBranch, Network, UsersRound } from "lucide-react";
import { Link } from "react-router-dom";

import { api } from "../api/client";
import { PageHeader } from "../components/PageHeader";
import { ErrorBlock, LoadingBlock } from "../components/StateBlock";
import { useAsync } from "../hooks/useAsync";

import type { Entry, EntryCard } from "../types";

const succession = [
  ["Octavian Wielki", "octavian-wielki", "Panował do 514"],
  ["Teodozjusz I", "teodozjusz-i", "514–521"],
  ["Francesco", "francesco-de-la-cruz", "521–556"],
  ["Teodozjusz II", "teodozjusz-ii", "556–591"],
  ["Ignacius", "ignacius-de-la-cruz", "591–obecnie"],
] as const;

type FamilyNode = {
  name: string;
  slug: string;
  note: string;
  twin?: boolean;
};

type Generation = {
  level: number;
  nodes: FamilyNode[];
};

function isDeLaCruz(entry: EntryCard): boolean {
  const haystack = [
    entry.title,
    ...entry.aliases,
    ...entry.tags,
    String(entry.infobox.dynastia ?? ""),
    String(entry.infobox.rod ?? ""),
  ]
    .join(" ")
    .toLocaleLowerCase("pl");

  return haystack.includes("de la cruz");
}

function getParents(entry: Entry): EntryCard[] {
  return entry.outgoing
    .filter(
      (relation) =>
        relation.type === "father" ||
        relation.type === "mother" ||
        relation.type === "parent",
    )
    .map((relation) => relation.target)
    .filter((target): target is EntryCard => Boolean(target));
}

function getChildren(entry: Entry, entriesBySlug: Map<string, Entry>): Entry[] {
  return Array.from(entriesBySlug.values()).filter((candidate) =>
    getParents(candidate).some((parent) => parent.slug === entry.slug),
  );
}

function isTwin(entry: Entry): boolean {
  return entry.outgoing.some(
    (relation) => relation.type === "twin" || relation.isTwin,
  );
}

function getParentNote(entry: Entry): string {
  const father = entry.outgoing.find(
    (relation) => relation.type === "father" && relation.target,
  )?.target;

  const mother = entry.outgoing.find(
    (relation) => relation.type === "mother" && relation.target,
  )?.target;

  if (father && mother) {
    return `dziecko ${father.title} i ${mother.title}`;
  }

  if (father) {
    const female =
      String(entry.infobox.płeć ?? "")
        .toLocaleLowerCase("pl")
        .includes("kob");

    return `${female ? "córka" : "syn"} ${father.title}`;
  }

  if (mother) {
    return `dziecko ${mother.title}`;
  }

  return "brak danych o rodzicach";
}

function calculateGenerationLevels(entries: Entry[]): Map<string, number> {
  const entriesBySlug = new Map(entries.map((entry) => [entry.slug, entry]));
  const levels = new Map<string, number>();

  const roots = entries.filter((entry) => {
    const parents = getParents(entry);

    return !parents.some((parent) => entriesBySlug.has(parent.slug));
  });

  const queue: Array<{ entry: Entry; level: number }> = roots.map((entry) => ({
    entry,
    level: 1,
  }));

  while (queue.length > 0) {
    const current = queue.shift();

    if (!current) {
      break;
    }

    const previousLevel = levels.get(current.entry.slug);

    if (previousLevel !== undefined && previousLevel <= current.level) {
      continue;
    }

    levels.set(current.entry.slug, current.level);

    for (const child of getChildren(current.entry, entriesBySlug)) {
      queue.push({
        entry: child,
        level: current.level + 1,
      });
    }
  }

  for (const entry of entries) {
    if (!levels.has(entry.slug)) {
      levels.set(entry.slug, 1);
    }
  }

  return levels;
}

function buildGenerations(entries: Entry[]): Generation[] {
  const levels = calculateGenerationLevels(entries);

  const grouped = new Map<number, Entry[]>();

  for (const entry of entries) {
    const level = levels.get(entry.slug) ?? 1;

    const existing = grouped.get(level) ?? [];
    existing.push(entry);
    grouped.set(level, existing);
  }

  return Array.from(grouped.entries())
    .sort(([a], [b]) => a - b)
    .map(([level, members]) => ({
      level,
      nodes: members
        .sort((a, b) => {
          if (a.birthYear !== null && b.birthYear !== null) {
            return a.birthYear - b.birthYear;
          }

          return a.title.localeCompare(b.title, "pl");
        })
        .map((entry) => ({
          name: entry.title,
          slug: entry.slug,
          note: getParentNote(entry),
          twin: isTwin(entry),
        })),
    }));
}

function FamilyCard({ node }: { node: FamilyNode }) {
  return (
    <Link
      to={`/postacie/${node.slug}`}
      className="surface-muted relative block min-w-0 flex-1 p-4 text-center transition hover:-translate-y-0.5 hover:border-gold/40"
    >
      {node.twin && <span className="badge mb-2">bliźnię</span>}

      <h3 className="font-serif text-lg text-cream">{node.name}</h3>

      <p className="mt-1 text-xs leading-5 text-white/38">{node.note}</p>
    </Link>
  );
}

export function DynastyPage() {
  const {
    data: generations,
    loading,
    error,
    reload,
  } = useAsync(async () => {
    const response = await api.list("CHARACTER");

    const dynastyCards = response.items.filter(isDeLaCruz);

    const dynastyEntries = await Promise.all(
      dynastyCards.map((entry) => api.get(entry.slug)),
    );

    return buildGenerations(dynastyEntries);
  }, []);

  if (loading) {
    return <LoadingBlock label="Budowanie drzewa dynastii…" />;
  }

  if (error || !generations) {
    return (
      <ErrorBlock
        message={error || "Nie udało się zbudować drzewa genealogicznego."}
        onRetry={reload}
      />
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Dom panujący"
        title="Dynastia de la Cruz"
        description="Genealogia rodzinna i sukcesja cesarska są prezentowane jako dwie niezależne struktury. Konstancja nie jest obecnie cesarzową."
      />

      <section className="surface overflow-hidden">
        <div className="border-b border-gold/15 bg-gradient-to-r from-imperial/20 via-transparent to-transparent p-6 md:p-8">
          <div className="flex items-center gap-3">
            <Crown className="h-5 w-5 text-gold" />
            <p className="eyebrow">Linia cesarska</p>
          </div>

          <h2 className="mt-3 font-serif text-2xl">Sukcesja główna</h2>

          <p className="mt-2 text-sm text-white/42">
            Następstwo tronu — niezależnie od relacji rodzic–dziecko.
          </p>
        </div>

        <div className="overflow-x-auto p-6 md:p-8">
          <div className="flex min-w-[820px] items-stretch">
            {succession.map(([name, slug, note], index) => (
              <div key={slug} className="flex flex-1 items-center">
                <Link
                  to={`/postacie/${slug}`}
                  className={`group flex min-h-40 flex-1 flex-col justify-between rounded-xl border p-4 transition hover:-translate-y-1 hover:border-gold/50 ${
                    index === succession.length - 1
                      ? "border-gold/45 bg-gold/[0.09]"
                      : "border-white/10 bg-white/[0.025]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gold/70">
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    {index === succession.length - 1 && (
                      <Crown className="h-4 w-4 text-gold" />
                    )}
                  </div>

                  <div>
                    <h3 className="font-serif text-lg text-cream">{name}</h3>

                    <p className="mt-1 text-xs leading-5 text-white/35">
                      {note}
                    </p>
                  </div>
                </Link>

                {index < succession.length - 1 && (
                  <GitBranch className="mx-2 h-4 w-4 shrink-0 rotate-90 text-gold/35" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="surface mt-6 overflow-hidden">
        <div className="border-b border-gold/15 p-6 md:p-8">
          <div className="flex items-center gap-3">
            <Network className="h-5 w-5 text-gold" />
            <p className="eyebrow">Więzy krwi</p>
          </div>

          <h2 className="mt-3 font-serif text-2xl">Drzewo genealogiczne</h2>

          <p className="mt-2 text-sm text-white/42">
            Pokolenia są wyliczane automatycznie na podstawie relacji
            rodzinnych zapisanych w bazie.
          </p>
        </div>

        <div className="mx-auto max-w-5xl p-6 md:p-8">
          {generations.map((generation, index) => (
            <div key={generation.level}>
              {index > 0 && (
                <div
                  className="mx-auto h-8 w-px bg-gradient-to-b from-gold/15 to-gold/45"
                  aria-hidden="true"
                />
              )}

              <div>
                <p className="mb-2 text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-gold/55">
                  Pokolenie {generation.level}
                </p>

                <div
                  className={`mx-auto grid gap-3 ${
                    generation.nodes.length === 1
                      ? "max-w-sm grid-cols-1"
                      : generation.nodes.length === 2
                        ? "max-w-2xl grid-cols-1 sm:grid-cols-2"
                        : "max-w-5xl grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
                  }`}
                >
                  {generation.nodes.map((node) => (
                    <FamilyCard key={node.slug} node={node} />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Link
          to="/postacie/octavian-syn-teodozjusza-ii"
          className="surface-muted p-6 transition hover:border-gold/35"
        >
          <p className="eyebrow">Niedoszły następca</p>

          <h2 className="mt-2 font-serif text-xl">
            Octavian, syn Teodozjusza II
          </h2>

          <p className="mt-2 text-sm leading-6 text-white/42">
            Zmarł przed Teodozjuszem II. Nigdy nie został cesarzem.
          </p>
        </Link>

        <Link
          to="/postacie/konstancja-de-la-cruz"
          className="surface-muted p-6 transition hover:border-gold/35"
        >
          <div className="flex items-center gap-2">
            <UsersRound className="h-4 w-4 text-gold" />

            <p className="eyebrow">Obecne pokolenie</p>
          </div>

          <h2 className="mt-2 font-serif text-xl">
            Konstancja de la Cruz
          </h2>

          <p className="mt-2 text-sm leading-6 text-white/42">
            Córka Ignaciusa. Nie jest cesarzową.
          </p>
        </Link>
      </div>
    </>
  );
}