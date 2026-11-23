import { useState } from "react";
import { ArrowUpRight, Building2, Crown, Landmark, Network, Plus, Search, Shield, UsersRound } from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import { EntryCard } from "../components/EntryCard";
import { PageHeader } from "../components/PageHeader";
import { ErrorBlock, LoadingBlock } from "../components/StateBlock";
import { useAsync } from "../hooks/useAsync";
import { entryPath } from "../lib/entry";
import type { EntryCard as EntryRecord } from "../types";

const factions = [
  { name: "Technokraci", seats: 212 },
  { name: "Autokraci", seats: 162 },
  { name: "Liberałowie", seats: 67 },
  { name: "Demokraci", seats: 59 },
] as const;

const cabinet = [
  { office: "Minister spraw wewnętrznych", person: "Julian von Ribentrop", remark: "57 lat · 20 RNT", slug: "ministerstwo-spraw-wewnetrznych", confirmed: true },
  { office: "Minister wydobycia i energii", person: "Jocancus de la Rose", remark: "63 lata · 20 RNT", slug: "ministerstwo-wydobycia-i-energii", confirmed: true },
  { office: "Minister wojny", person: "Mariano Guraz", remark: "Frakcja autokratów", slug: "ministerstwo-wojny", confirmed: true },
  { office: "Minister zdrowia", person: "Florian Virzon", remark: "Frakcja liberałów", slug: "ministerstwo-zdrowia", confirmed: true },
  { office: "Minister technologii", person: "Adrian von Snith", remark: "Starsze zestawienie · obecny urząd niepotwierdzony", slug: "ministerstwo-technologii", confirmed: false },
  { office: "Minister skarbu", person: "Florent di Arbanco", remark: "Starsze zestawienie · obecny urząd niepotwierdzony", slug: "ministerstwo-skarbu", confirmed: false },
] as const;

const featuredIds = new Set([
  "rnt", "nrnt", "dwudziestka-rnt", "partia-technokratyczna", "mobius-syndykat",
  "rada-siedmiu", "urzad-premiera-rnt", "urzad-lorda-marszalka", "rada-ministrow-imperium",
  ...cabinet.map((item) => item.slug),
]);

function QuickEntry({ entry, kicker }: { entry: EntryRecord; kicker: string }) {
  return (
    <Link to={entryPath(entry.type, entry.slug)} className="group surface-muted block p-5 transition hover:-translate-y-0.5 hover:border-gold/40">
      <div className="flex justify-between gap-3">
        <span className="eyebrow !text-[10px] !tracking-[0.14em]">{kicker}</span>
        <ArrowUpRight className="h-4 w-4 shrink-0 text-white/30 transition group-hover:text-gold" />
      </div>
      <h3 className="mt-3 font-serif text-xl leading-tight text-cream">{entry.title}</h3>
      <p className="mt-3 text-sm leading-6 text-white/45">{entry.summary}</p>
    </Link>
  );
}

export function InstitutionsPage() {
  const { data, loading, error, reload } = useAsync(() => api.list("INSTITUTION"), []);
  const [query, setQuery] = useState("");
  const entries = data?.items ?? [];
  const bySlug = new Map(entries.map((entry) => [entry.slug, entry]));
  const term = query.trim().toLocaleLowerCase("pl");
  const matches = (value: string) => !term || value.toLocaleLowerCase("pl").includes(term);
  const link = (slug: string) => entryPath("INSTITUTION", slug);
  const highlights = [
    { slug: "rnt", kicker: "Izba wyższa · 500 miejsc" },
    { slug: "dwudziestka-rnt", kicker: "Ścisłe kierownictwo · 20 osób" },
    { slug: "nrnt", kicker: "Izba niższa · 300 miejsc" },
    { slug: "rada-siedmiu", kicker: "Odrębny szczebel · 7 osób" },
    { slug: "urzad-premiera-rnt", kicker: "Premier · Laurus la Cenae" },
    { slug: "urzad-lorda-marszalka", kicker: "Wysoki urząd polityczny" },
  ];
  const remaining = entries.filter((entry) => !featuredIds.has(entry.slug))
    .filter((entry) => matches(entry.title + " " + entry.summary));

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Ustrój państwa · rok 607"
        title="Instytucje i władza"
        description="RNT, elitarna Dwudziestka, frakcje Partii Technokratycznej, urzędy rządowe i syndykat Möbius — rozdzielone według rzeczywistej funkcji w ustroju."
        action={<Link to="/admin/nowy?type=INSTITUTION" className="button-secondary"><Plus className="h-4 w-4" /> Dodaj wpis</Link>}
      />

      <section className="surface relative overflow-hidden p-6 md:p-8">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full border border-gold/10 bg-imperial/15" />
        <div className="relative">
          <div className="flex items-center gap-2 text-gold"><Crown className="h-5 w-5" /><span className="eyebrow">21. RNT · stan na rok 607</span></div>
          <h2 className="mt-3 font-serif text-3xl leading-tight text-cream md:text-4xl">Jedna partia. Cztery frakcje.</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-white/55">
            Formalnie legalna jest Partia Technokratyczna. Technokraci, autokraci, liberałowie i demokraci
            to jej wewnętrzne frakcje, a nie cztery odrębne partie polityczne.
            W 500-osobowej RNT żadna z nich nie ma samodzielnej większości 251 mandatów.
          </p>
          <div className="mt-6 grid gap-3 lg:grid-cols-[minmax(0,1.55fr)_minmax(210px,0.8fr)]">
            <div className="rounded-xl border border-gold/15 bg-black/20 p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-serif text-lg">Mandaty w RNT</h3>
                <span className="text-xs text-white/40">500 / 500</span>
              </div>
              <div className="mt-5 space-y-4">
                {factions.map((faction) => (
                  <div key={faction.name}>
                    <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                      <span className="text-cream">{faction.name}</span>
                      <span className="font-medium tabular-nums text-gold">{faction.seats} <span className="font-normal text-white/40">({(faction.seats / 5).toFixed(1).replace(".", ",")}%)</span></span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-white/[0.07]">
                      <div className="h-full rounded-full bg-gradient-to-r from-[#7f6488] to-[#d6b46d]" style={{ width: String(faction.seats / 5) + "%" }} />
                    </div>
                  </div>
                ))}
              </div>
              <Link to={link("partia-technokratyczna")} className="mt-5 inline-flex items-center gap-2 text-xs text-gold/80 hover:text-gold">
                Partia Technokratyczna — pełny opis <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="rounded-xl border border-gold/15 bg-black/20 p-5">
              <span className="eyebrow !text-[10px]">Urząd premiera</span>
              <p className="mt-3 font-serif text-2xl text-cream">Laurus la Cenae</p>
              <p className="mt-2 text-sm leading-6 text-white/50">77 lat · wybrany przez 21. RNT</p>
              <p className="mt-5 font-serif text-4xl text-gold">280<span className="text-lg text-white/35"> / 500</span></p>
              <p className="mt-1 text-xs text-white/40">Głosy oddane za wyborem</p>
              <p className="mt-5 text-xs leading-5 text-white/45">Poprzednik: Everest Volis. Wcześniej Laurus kierował resortem zdrowia.</p>
              <Link to={link("urzad-premiera-rnt")} className="mt-4 inline-flex items-center gap-2 text-xs text-gold/80 hover:text-gold">Urząd premiera <ArrowUpRight className="h-3.5 w-3.5" /></Link>
            </div>
          </div>
        </div>
      </section>

      {loading && <LoadingBlock />}
      {error && <ErrorBlock message={error} onRetry={reload} />}
      {data && (
        <>
          <label className="flex min-h-11 items-center gap-3 rounded-lg border border-gold/20 bg-white/[0.025] px-4">
            <Search className="h-4 w-4 text-white/40" />
            <span className="sr-only">Szukaj instytucji</span>
            <input className="w-full bg-transparent text-sm text-cream outline-none placeholder:text-white/30" placeholder="Szukaj organu, urzędu lub syndykatu…" value={query} onChange={(event) => setQuery(event.target.value)} />
          </label>

          <section>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div><p className="eyebrow">Organy państwa</p><h2 className="mt-2 font-serif text-2xl text-cream">Hierarchia i izby</h2></div>
              <span className="inline-flex items-center gap-2 text-xs text-white/45"><Landmark className="h-4 w-4 text-gold/70" />RNT ≠ 20 RNT ≠ Rada Siedmiu</span>
            </div>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {highlights.map((item) => {
                const entry = bySlug.get(item.slug);
                return entry && matches(entry.title + " " + entry.summary) ? <QuickEntry key={item.slug} entry={entry} kicker={item.kicker} /> : null;
              })}
            </div>
          </section>

          {matches("Möbius syndykat finansowo inwestycyjny partia") && (
            <section className="surface p-5 md:p-7">
              <div className="flex items-center gap-3 text-gold"><Network className="h-5 w-5" /><span className="eyebrow">Syndykat powiązany z polityką</span></div>
              <h2 className="mt-3 font-serif text-2xl text-cream">Möbius nie jest partią ani organem państwa</h2>
              <p className="mt-3 max-w-4xl text-sm leading-7 text-white/55">
                Möbius to odrębny syndykat inwestycyjny, którego właściciele i rzeczywista kontrola pozostają niejawni.
                Jego powiązania z kierownictwem Partii Technokratycznej, z kapitałem państwa i systemami
                emerytalnymi pozwalają wywierać wpływ na korporacje. Mechanizm jest powiązany również z Parvah Di Banco
                i Siccario. Nie ma on mandatu w RNT i nie jest piątą frakcją.
              </p>
              {bySlug.has("mobius-syndykat") && (
                <Link to={link("mobius-syndykat")} className="mt-4 inline-flex items-center gap-2 text-sm text-gold/80 hover:text-gold">
                  Szczegóły syndykatu Möbius <ArrowUpRight className="h-4 w-4" />
                </Link>
              )}
            </section>
          )}

          <section>
            <div className="mb-4 flex items-center gap-2 text-gold"><UsersRound className="h-5 w-5" /><span className="eyebrow">Rząd i obsada resortów</span></div>
            <h2 className="font-serif text-2xl text-cream">Stanowiska ministrów</h2>
            <p className="mt-3 max-w-4xl text-sm leading-6 text-white/50">
              Poniżej są cztery stanowiska potwierdzone w ustaleniach dotyczących roku 607.
              Dwa nazwiska z wcześniejszych zestawień zachowujemy z wyraźnym zastrzeżeniem.
              Minister Julian von Ribentrop to inna osoba niż książę Julian de la Cruz.
            </p>
            <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {cabinet.filter((item) => matches(item.office + " " + item.person + " " + item.remark)).map((item) => (
                <Link key={item.slug} to={link(item.slug)} className="group surface-muted block p-5 transition hover:-translate-y-0.5 hover:border-gold/35">
                  <div className="flex items-center justify-between gap-3">
                    <span className="eyebrow !text-[10px]">{item.confirmed ? "Potwierdzona obsada" : "Obecna obsada niepotwierdzona"}</span>
                    <ArrowUpRight className="h-4 w-4 text-white/30 transition group-hover:text-gold" />
                  </div>
                  <h3 className="mt-3 font-serif text-lg text-cream">{item.office}</h3>
                  <p className="mt-2 text-sm text-gold/90">{item.person}</p>
                  <p className="mt-2 text-xs leading-5 text-white/45">{item.remark}</p>
                </Link>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link to={link("rada-ministrow-imperium")} className="button-secondary"><Building2 className="h-4 w-4" />Rada Ministrów</Link>
              <Link to={link("dwudziestka-rnt")} className="button-secondary"><Shield className="h-4 w-4" />20 RNT</Link>
            </div>
          </section>

          <section className="border-t border-gold/15 pt-7">
            <p className="eyebrow">Pozostałe wpisy</p>
            <h2 className="mt-2 font-serif text-2xl text-cream">Pozostałe instytucje i systemy</h2>
            <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {remaining.map((entry) => <EntryCard key={entry.id} entry={entry} />)}
            </div>
            {remaining.length === 0 && <p className="mt-4 text-sm text-white/45">Brak innych pozycji pasujących do wyszukiwania.</p>}
          </section>
        </>
      )}
      <footer className="border-t border-gold/15 pt-5 text-xs leading-6 text-white/40">
        Najnowsze ustalenia kanonu mają pierwszeństwo przed starszymi wariantami. Nieznane osoby,
        funkcje i resorty pozostają nieustalone. Möbius jest syndykatem, a nie partią ani instytucją rządową.
      </footer>
    </div>
  );
}
