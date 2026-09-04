import { Building2, Crown, Dice5, Globe2, Languages, Map, ScrollText, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import { EntryCard } from "../components/EntryCard";
import { ErrorBlock, LoadingBlock } from "../components/StateBlock";
import { useAsync } from "../hooks/useAsync";
import { entryPath, formatDate } from "../lib/entry";
import { CURRENT_WORLD_YEAR } from "../lib/world";

const statIcons = [Users, Map, Languages, Building2, ScrollText];

export function DashboardPage() {
  const { data, loading, error, reload } = useAsync(api.dashboard, []);
  if (loading) return <LoadingBlock label="Otwieranie rejestru centralnego…" />;
  if (error || !data) return <ErrorBlock message={error || "Brak danych."} onRetry={reload} />;

  const stats = [
    { label: "Postacie", value: data.stats.characters, suffix: "opisanych" },
    { label: "Prowincje", value: `${data.stats.provinces} / ${data.worldScale.provinces}`, suffix: "w archiwum" },
    { label: "Języki", value: `${data.stats.languages} / ${data.worldScale.languages}`, suffix: "8 urzędowych" },
    { label: "Firmy", value: data.stats.companies, suffix: "zarejestrowanych" },
    { label: "Wydarzenia", value: data.stats.events, suffix: "na osi czasu" },
  ];

  const importantCharacters = data.featured.filter((entry) => entry.type === "CHARACTER").slice(0, 4);
  const importantPlaces = data.featured.filter((entry) => entry.type === "PROVINCE").slice(0, 3);

  return (
    <div className="space-y-8">
      <section className="surface relative overflow-hidden p-6 md:p-9">
        <div className="pointer-events-none absolute -right-24 -top-28 h-80 w-80 rounded-full border border-gold/10 bg-imperial/10 blur-sm" />
        <div className="pointer-events-none absolute right-16 top-12 hidden h-36 w-36 rotate-45 border border-gold/[0.08] lg:block" />
        <div className="relative max-w-3xl">
          <div className="flex items-center gap-3">
            <span className="h-px w-10 bg-gold/70" />
            <p className="eyebrow">Rejestr centralny • Rok {CURRENT_WORLD_YEAR}</p>
          </div>
          <h1 className="mt-5 max-w-2xl font-serif text-4xl font-medium leading-[1.08] tracking-tight text-cream md:text-6xl">
            Imperium <span className="text-gold">Technokratyczne</span>
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-white/52 md:text-lg">
            Kanoniczne archiwum postaci, prowincji, instytucji i sześciu stuleci historii Imperium.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link to="/postacie" className="button-primary"><Users className="h-4 w-4" /> Otwórz kartotekę</Link>
            <Link to="/chronologia" className="button-secondary"><ScrollText className="h-4 w-4" /> Zobacz chronologię</Link>
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5" aria-label="Statystyki Wiki">
        {stats.map((stat, index) => {
          const Icon = statIcons[index];
          return (
            <div key={stat.label} className="surface-muted p-5">
              <div className="flex items-start justify-between">
                <p className="text-sm text-white/42">{stat.label}</p>
                <Icon className="h-4 w-4 text-gold/60" />
              </div>
              <p className="mt-3 font-serif text-3xl text-cream">{stat.value}</p>
              <p className="mt-1 text-xs text-white/28">{stat.suffix}</p>
            </div>
          );
        })}
      </section>

      <div className="grid gap-7 xl:grid-cols-[1.55fr_0.75fr]">
        <section>
          <div className="mb-4 flex items-end justify-between gap-4">
            <div><p className="eyebrow">Kartoteka</p><h2 className="mt-1 font-serif text-2xl text-cream">Najważniejsze postacie</h2></div>
            <Link to="/postacie" className="text-sm text-gold/75 hover:text-gold">Wszystkie postacie →</Link>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {importantCharacters.map((entry) => <EntryCard key={entry.id} entry={entry} />)}
          </div>
        </section>

        <aside className="surface p-5 md:p-6">
          <div className="flex items-center gap-2 text-gold"><Dice5 className="h-4 w-4" /><span className="eyebrow">Losowy artykuł</span></div>
          {data.random && (
            <>
              <h2 className="mt-5 font-serif text-2xl text-cream">{data.random.title}</h2>
              <p className="mt-3 text-sm leading-6 text-white/48">{data.random.summary}</p>
              <Link to={entryPath(data.random.type, data.random.slug)} className="button-secondary mt-6 w-full">Otwórz artykuł</Link>
            </>
          )}
          <div className="archive-rule my-7" />
          <div className="flex items-center gap-2"><Crown className="h-4 w-4 text-gold" /><h3 className="font-serif text-lg">Dynastia de la Cruz</h3></div>
          <p className="mt-2 text-sm leading-6 text-white/42">Od Octaviana Wielkiego do obecnego cesarza Ignaciusa.</p>
          <Link to="/dynastia" className="mt-4 inline-flex text-sm text-gold/75 hover:text-gold">Przejdź do linii sukcesji →</Link>
        </aside>
      </div>

      <section>
        <div className="mb-4 flex items-end justify-between gap-4">
          <div><p className="eyebrow">Terytorium</p><h2 className="mt-1 font-serif text-2xl text-cream">Prowincje o znaczeniu imperialnym</h2></div>
          <Link to="/prowincje" className="text-sm text-gold/75 hover:text-gold">Pełny rejestr →</Link>
        </div>
        <div className="grid gap-3 md:grid-cols-3">{importantPlaces.map((entry) => <EntryCard key={entry.id} entry={entry} />)}</div>
      </section>

      <section>
        <div className="mb-4"><p className="eyebrow">Rejestr zmian</p><h2 className="mt-1 font-serif text-2xl text-cream">Ostatnio edytowane</h2></div>
        <div className="surface overflow-hidden divide-y divide-white/[0.055]">
          {data.recent.map((entry) => (
            <Link key={entry.id} to={entryPath(entry.type, entry.slug)} className="flex flex-col gap-1 px-5 py-4 transition hover:bg-gold/[0.04] sm:flex-row sm:items-center sm:justify-between">
              <span className="text-sm text-cream">{entry.title}</span>
              <span className="text-xs text-white/32">Aktualizacja: {formatDate(entry.updatedAt)}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="surface-muted flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-4"><Globe2 className="mt-1 h-5 w-5 text-gold" /><div><h2 className="font-serif text-xl">Skala Imperium</h2><p className="mt-1 text-sm text-white/42">30 prowincji • 15 języków • 8 języków urzędowych</p></div></div>
        <Link to="/jezyki" className="button-secondary">Atlas języków</Link>
      </section>
    </div>
  );
}
