import { CalendarClock, Crown, Edit3, Link2, UsersRound } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Link, useParams } from "react-router-dom";
import { api } from "../api/client";
import { Infobox } from "../components/Infobox";
import { ErrorBlock, LoadingBlock } from "../components/StateBlock";
import { useAsync } from "../hooks/useAsync";
import { entryPath, entryTypeLabels, formatDate, mediaUrl } from "../lib/entry";
import { CURRENT_WORLD_YEAR, calculateAge } from "../lib/world";
import type { Entry, Relation, RelationType } from "../types";

const familyLabels: Record<Extract<RelationType, "father" | "mother" | "parent" | "sibling" | "twin" | "spouse" | "child">, string> = {
  father: "Ojciec",
  mother: "Matka",
  parent: "Rodzice",
  sibling: "Rodzeństwo",
  twin: "Rodzeństwo",
  spouse: "Małżonkowie",
  child: "Dzieci",
};

const successionLabels: Record<Extract<RelationType, "predecessor" | "successor">, string> = {
  predecessor: "Poprzednik",
  successor: "Następca",
};

function familyLabel(type: keyof typeof familyLabels, items: Relation[]): string {
  if (type !== "parent" || items.length !== 1) return familyLabels[type];
  const description = items[0].description.toLocaleLowerCase("pl");
  if (description.includes("matk")) return "Matka";
  if (description.includes("ojc")) return "Ojciec";
  return familyLabels[type];
}

function ageLabel(age: number): string {
  if (age === 1) return "1 rok";
  if (age % 10 >= 2 && age % 10 <= 4 && (age % 100 < 12 || age % 100 > 14)) return `${age} lata`;
  return `${age} lat`;
}

function RelationCard({ relation }: { relation: Relation }) {
  const linked = relation.target;
  if (!linked) return null;
  return (
    <Link to={entryPath(linked.type, linked.slug)} className="surface-muted block p-4 transition hover:border-gold/35">
      <div className="flex items-start justify-between gap-3">
        <p className="font-serif text-lg text-cream">{linked.title}</p>
        {(relation.isTwin || relation.type === "twin") && <span className="badge shrink-0">bliźnięta</span>}
      </div>
      {relation.description && <p className="mt-1 text-sm leading-5 text-white/42">{relation.description}</p>}
    </Link>
  );
}

function CharacterRelations({ entry }: { entry: Entry }) {
  const familyTypes = Object.keys(familyLabels) as Array<keyof typeof familyLabels>;
  const family = familyTypes.map((type) => ({ type, items: entry.outgoing.filter((relation) => relation.type === type) }));
  const succession = (["predecessor", "successor"] as const).map((type) => ({ type, items: entry.outgoing.filter((relation) => relation.type === type) }));
  const other = entry.outgoing.filter((relation) => relation.type === "other");
  const reign = entry.reignStartYear == null ? "Brak danych" : `${entry.reignStartYear}–${entry.reignEndYear ?? "obecnie"}`;
  const noFamilyData = (type: keyof typeof familyLabels) => {
    if (type === "child" && String(entry.infobox.dzieci ?? "").toLocaleLowerCase("pl") === "brak") return "Brak — postać bezdzietna";
    return "Brak danych";
  };

  return (
    <>
      <section className="mt-10" aria-labelledby="family-heading">
        <div className="mb-4 flex items-center gap-2"><UsersRound className="h-4 w-4 text-gold" /><h2 id="family-heading" className="font-serif text-2xl">Rodzina</h2></div>
        <div className="grid gap-5 sm:grid-cols-2">
          {family.map(({ type, items }) => (
            <div key={type}>
              <p className="eyebrow !text-[10px]">{familyLabel(type, items)}</p>
              <div className="mt-2 space-y-2">
                {items.length ? items.map((relation) => <RelationCard key={relation.id} relation={relation} />) : <p className="surface-muted p-4 text-sm text-white/35">{noFamilyData(type)}</p>}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10" aria-labelledby="succession-heading">
        <div className="mb-4 flex items-center gap-2"><Crown className="h-4 w-4 text-gold" /><h2 id="succession-heading" className="font-serif text-2xl">Sukcesja</h2></div>
        <div className="grid gap-4 sm:grid-cols-3">
          {succession.map(({ type, items }) => (
            <div key={type}>
              <p className="eyebrow !text-[10px]">{successionLabels[type]}</p>
              <div className="mt-2 space-y-2">
                {items.length ? items.map((relation) => <RelationCard key={relation.id} relation={relation} />) : <p className="surface-muted p-4 text-sm text-white/35">Brak danych</p>}
              </div>
            </div>
          ))}
          <div>
            <p className="eyebrow !text-[10px]">Lata panowania</p>
            <p className="surface-muted mt-2 p-4 font-serif text-lg text-cream">{reign}</p>
          </div>
        </div>
      </section>

      {other.length > 0 && (
        <section className="mt-10">
          <div className="mb-4 flex items-center gap-2"><Link2 className="h-4 w-4 text-gold" /><h2 className="font-serif text-2xl">Inne powiązania</h2></div>
          <div className="grid gap-3 sm:grid-cols-2">{other.map((relation) => <RelationCard key={relation.id} relation={relation} />)}</div>
        </section>
      )}
    </>
  );
}

export function EntryDetailPage() {
  const { slug = "" } = useParams();
  const { data, loading, error, reload } = useAsync(() => api.get(slug, localStorage.getItem("imperium-admin-token") || ""), [slug]);
  if (loading) return <LoadingBlock label="Otwieranie karty archiwalnej…" />;
  if (error || !data) return <ErrorBlock message={error || "Nie znaleziono wpisu."} onRetry={reload} />;

  const provinceCover = data.type === "PROVINCE" ? mediaUrl(data.imagePath) : null;
  const genericRelations = data.outgoing.filter((relation) => relation.type === "other");
  const infobox = { ...data.infobox };
  const age = calculateAge(data.birthYear, data.deathYear);
  if (data.birthYear != null) infobox.urodzenie = data.birthYear;
  if (data.deathYear != null) infobox.śmierć = data.deathYear;
  if (age != null) {
    if (data.deathYear == null) infobox["obecny wiek"] = ageLabel(age);
    else infobox["wiek w chwili śmierci"] = ageLabel(age);
  }
  if (data.reignStartYear != null) {
    infobox.panowanie = `${data.reignStartYear}–${data.reignEndYear ?? "obecnie"}`;
    infobox["długość panowania"] = ageLabel((data.reignEndYear ?? CURRENT_WORLD_YEAR) - data.reignStartYear);
  }

  return (
    <article>
      {provinceCover && (
        <div className="relative mb-7 aspect-[16/6] min-h-56 overflow-hidden rounded-2xl border border-gold/15 shadow-imperial">
          <img src={provinceCover} alt={`Zdjęcie główne prowincji ${data.title}`} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/10" />
          <p className="absolute bottom-5 left-5 font-serif text-2xl text-cream md:bottom-7 md:left-7 md:text-3xl">{data.title}</p>
        </div>
      )}

      <div className="mb-6 flex flex-col gap-5 border-b border-gold/15 pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="eyebrow">{entryTypeLabels[data.type]} • {data.status === "PUBLISHED" ? "Opublikowano" : "Szkic"}</p>
          <h1 className="page-title !text-4xl md:!text-5xl">{data.title}</h1>
          {data.aliases.length > 0 && <p className="mt-2 text-sm text-white/35">Znany także jako: {data.aliases.join(", ")}</p>}
        </div>
        <Link to={`/admin/edytuj/${data.slug}`} className="button-secondary"><Edit3 className="h-4 w-4" /> Edytuj wpis</Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_330px] xl:gap-12">
        <div className="min-w-0">
          <p className="border-l-2 border-gold/60 pl-5 text-lg leading-8 text-cream/78">{data.summary}</p>
          <div className="article-copy mt-8"><ReactMarkdown>{data.content}</ReactMarkdown></div>

          {data.type === "CHARACTER" ? <CharacterRelations entry={data} /> : genericRelations.length > 0 && (
            <section className="mt-10">
              <div className="mb-4 flex items-center gap-2"><Link2 className="h-4 w-4 text-gold" /><h2 className="font-serif text-2xl">Relacje i powiązania</h2></div>
              <div className="grid gap-3 sm:grid-cols-2">{genericRelations.map((relation) => <RelationCard key={relation.id} relation={relation} />)}</div>
            </section>
          )}

          {data.tags.length > 0 && <div className="mt-10 flex flex-wrap gap-2">{data.tags.map((tag) => <span key={tag} className="badge">{tag}</span>)}</div>}
          <footer className="mt-8 flex items-center gap-2 border-t border-white/[0.07] pt-5 text-xs text-white/30"><CalendarClock className="h-3.5 w-3.5" /> Ostatnia aktualizacja: {formatDate(data.updatedAt)}</footer>
        </div>
        <Infobox title={data.title} data={infobox} imagePath={data.imagePath} showPortrait={data.type === "CHARACTER"} />
      </div>
    </article>
  );
}
