import { useMemo, useState } from "react";
import { ArrowUpRight, Building2, Filter, Landmark, Plus, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import { PageHeader } from "../components/PageHeader";
import { ErrorBlock, LoadingBlock } from "../components/StateBlock";
import { useAsync } from "../hooks/useAsync";
import { entryPath } from "../lib/entry";
import type { EntryCard } from "../types";

type Group = "główny" | "spółka zależna" | "marka" | "archiwalny" | "do potwierdzenia";
type FilterGroup = "wszystkie" | Group;

const groups: Array<{ id: FilterGroup; title: string; description?: string }> = [
  { id: "wszystkie", title: "Wszystkie" },
  { id: "główny", title: "Główne korporacje" },
  { id: "spółka zależna", title: "Spółki zależne" },
  { id: "marka", title: "Marki produktów" },
  { id: "archiwalny", title: "Wcześniejsze rozmowy" },
  { id: "do potwierdzenia", title: "Do potwierdzenia" },
];

/** Brak klasyfikacji oznacza istniejący wpis bazowy, nie automatyczne członkostwo w rankingu. */
function groupOf(entry: EntryCard): Group {
  if (entry.slug === "xair") return "spółka zależna";
  const raw = entry.infobox["kategoria rejestru"];
  if (raw === "główny" || raw === "spółka zależna" || raw === "marka" ||
      raw === "archiwalny" || raw === "do potwierdzenia") return raw;
  return "główny";
}

function sectorOf(entry: EntryCard): string {
  const value = entry.infobox.sektor ?? entry.infobox.branża ??
    entry.infobox.specjalizacja ?? entry.infobox.segment;
  return typeof value === "string" && value ? value : "Branża nieustalona";
}

const groupLabels: Record<Group, string> = {
  "główny": "Współczesne przedsiębiorstwo",
  "spółka zależna": "Spółka zależna",
  "marka": "Marka / linia produktów",
  "archiwalny": "Wzmianka archiwalna",
  "do potwierdzenia": "Status kanonu nieustalony",
};

function CompanyCard({ entry }: { entry: EntryCard }) {
  const group = groupOf(entry);
  return (
    <Link to={entryPath(entry.type, entry.slug)} className="group surface-muted block p-5 transition hover:-translate-y-0.5 hover:border-gold/35 hover:bg-gold/[0.045]">
      <div className="flex items-start justify-between gap-2">
        <span className="eyebrow !text-[10px] !tracking-[0.14em]">{groupLabels[group]}</span>
        <ArrowUpRight className="h-4 w-4 shrink-0 text-white/25 transition group-hover:text-gold" />
      </div>
      <h3 className="mt-3 font-serif text-xl leading-snug text-cream">{entry.title}</h3>
      <p className="mt-2 line-clamp-3 min-h-[3.8rem] text-sm leading-6 text-white/50">{entry.summary}</p>
      <div className="mt-4 border-t border-white/[0.07] pt-3 text-xs text-white/40">
        <span className="text-gold/70">Sektor:</span> {sectorOf(entry)}
      </div>
    </Link>
  );
}

export function CompaniesPage() {
  const { data, loading, error, reload } = useAsync(() => api.list("COMPANY"), []);
  const [filter, setFilter] = useState<FilterGroup>("wszystkie");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const term = query.trim().toLocaleLowerCase("pl");
    return (data?.items ?? [])
      .filter((entry) => filter === "wszystkie" || groupOf(entry) === filter)
      .filter((entry) => !term || [
        entry.title, entry.summary, sectorOf(entry), ...(entry.aliases ?? []),
      ].join(" ").toLocaleLowerCase("pl").includes(term))
      .sort((a, b) => a.title.localeCompare(b.title, "pl"));
  }, [data, filter, query]);

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Rejestr gospodarczy"
        title="Firmy i marki"
        description="Przedsiębiorstwa, banki, marki i grupy kapitałowe Imperium Technokratycznego — od największych korporacji roku 607 po nazwy zachowane z wcześniejszych rozmów."
        action={<Link to="/admin/nowy?type=COMPANY" className="button-secondary"><Plus className="h-4 w-4" /> Dodaj wpis</Link>}
      />

      <section className="surface relative overflow-hidden p-6 md:p-8">
        <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full border border-gold/15 bg-imperial/10" />
        <div className="relative">
          <div className="flex items-center gap-2 text-gold"><Landmark className="h-5 w-5" /><p className="eyebrow">Rok 607 · Potwierdzona pierwsza trójka</p></div>
          <h2 className="mt-3 font-serif text-2xl text-cream md:text-3xl">Gospodarcze filary Imperium</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-white/50">
            Tylko wartości trzech największych przedsiębiorstw zostały ustalone w najnowszym kanonie.
            Nie przypisujemy arbitralnych wycen ani miejsc w rankingu pozostałym firmom.
          </p>
          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {[
              { slug: "parvah-di-banco", name: "Parvah Di Banco", value: "30 bln", kind: "Bankowość" },
              { slug: "jugon", name: "Jugon", value: "12 bln", kind: "Przemysł zbrojeniowy" },
              { slug: "xen", name: "Xen Corporation", value: "5,28 bln", kind: "Technologie i usługi cyfrowe" },
            ].map((company, index) => (
              <Link key={company.slug} to={entryPath("COMPANY", company.slug)} className="group rounded-xl border border-gold/15 bg-black/20 p-4 transition hover:border-gold/40">
                <div className="flex justify-between gap-2 text-xs text-gold/65"><span>{index + 1}. miejsce</span><ArrowUpRight className="h-4 w-4 opacity-50 group-hover:opacity-100" /></div>
                <p className="mt-3 font-serif text-2xl text-cream">{company.value}</p>
                <p className="mt-1 text-xs text-white/35">orenów · wartość przedsiębiorstwa</p>
                <h3 className="mt-4 font-serif text-lg text-cream">{company.name}</h3>
                <p className="mt-1 text-xs text-white/45">{company.kind}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="surface p-5 md:p-6">
        <div className="flex flex-wrap items-center gap-2 text-gold"><Filter className="h-4 w-4" /><span className="eyebrow">Przeszukaj rejestr</span></div>
        <p className="mt-2 text-sm leading-6 text-white/45">
          Wcześniejsze wzmianki nie oznaczają automatycznie, że przedsiębiorstwo nadal działa w roku 607.
          Nazwy wymagające potwierdzenia są wyraźnie oddzielone od ustalonego kanonu.
        </p>
        <label className="mt-5 flex min-h-11 items-center gap-3 rounded-lg border border-gold/15 bg-black/20 px-4">
          <Search className="h-4 w-4 shrink-0 text-white/40" />
          <span className="sr-only">Wyszukaj firmę lub markę</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Nazwa, branża lub marka…" className="w-full bg-transparent text-sm text-cream outline-none placeholder:text-white/35" />
        </label>
        <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Filtr kategorii">
          {groups.map(({ id, title }) => (
            <button key={id} type="button" onClick={() => setFilter(id)} aria-pressed={filter === id}
              className={filter === id ? "button-primary !px-3 !py-2 !text-xs" : "button-secondary !px-3 !py-2 !text-xs"}>
              {title}
            </button>
          ))}
        </div>
      </section>

      {loading && <LoadingBlock />}
      {error && <ErrorBlock message={error} onRetry={reload} />}
      {data && (
        <section aria-label="Katalog firm i marek" className="space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-3 text-xs uppercase tracking-wider text-white/40">
            <span><Building2 className="mr-2 inline h-4 w-4 text-gold/70" />{filtered.length} z {data.total} wpisów</span>
            <span>Porządek alfabetyczny</span>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((entry) => <CompanyCard key={entry.id} entry={entry} />)}
          </div>
          {filtered.length === 0 && <p className="surface-muted p-5 text-sm text-white/50">Brak wyników pasujących do wyszukiwania i wybranej kategorii.</p>}
        </section>
      )}
      <footer className="text-xs leading-6 text-white/40">
        Produkty takie jak Candela, Agend, Scan Xen czy Jugon 11X nie są automatycznie odrębnymi firmami.
        Syndykaty inwestycyjne, m.in. Möbius i DiFamilia, również nie są utożsamiane z przedsiębiorstwami operacyjnymi.
      </footer>
    </div>
  );
}
