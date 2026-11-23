import { useState } from "react";
import { ArrowUpRight, GraduationCap, MapPin, Plus, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import { EntryCard } from "../components/EntryCard";
import { PageHeader } from "../components/PageHeader";
import { ErrorBlock, LoadingBlock } from "../components/StateBlock";
import { useAsync } from "../hooks/useAsync";
import { entryPath } from "../lib/entry";

const members: ReadonlyArray<{ slug: string; province: string }> = [
  { slug: "uniwersytet-michalusa", province: "Ldei" },
  { slug: "unisca", province: "Ldei" },
  { slug: "universitas-aurea-sapientiae", province: "Lacjum" },
  { slug: "universitas-iuris-imperialis", province: "Lacjum" },
  { slug: "universitas-scientiarum-novarum", province: "Lacjum" },
  { slug: "universitas-medica-lucensis", province: "Lacjum" },
  { slug: "hanische-militarakademie", province: "Han" },
  { slug: "profaner-wirtschaftsuniversitat", province: "Profan" },
  { slug: "montes-rechtsuniversitat", province: "Montes" },
  { slug: "universa-serenora-de-delan", province: "Delanium" },
  { slug: "akademia-navera-de-montreli", province: "Montreli" },
  { slug: "ecole-superieure-architecture-ingenierie-berrane", province: "Berrani" },
  { slug: "vaa1-seng4-hok6", province: "Vir" },
  { slug: "universitas-aureliae-medicinae", province: "Aurelia" },
  { slug: "universitas-simarinae-diplomatica", province: "Simarina" },
  { slug: "universitas-technologica-fedunasnae", province: "Fedunasna" },
];

const memberSlugs = new Set(members.map((member) => member.slug));
const provinces = [...new Set(members.map((member) => member.province))];

export function UniversitiesPage() {
  const { data, loading, error, reload } = useAsync(() => api.list("UNIVERSITY"), []);
  const [query, setQuery] = useState("");
  const [province, setProvince] = useState("wszystkie");
  const entries = data?.items ?? [];
  const bySlug = new Map(entries.map((entry) => [entry.slug, entry]));
  const visibleMembers = members.filter((member) => bySlug.has(member.slug));
  const term = query.trim().toLocaleLowerCase("pl");
  const matchesSearch = (entry: { title: string; summary: string }) =>
    !term || (entry.title + " " + entry.summary).toLocaleLowerCase("pl").includes(term);
  const league = visibleMembers.filter((member) => {
    const entry = bySlug.get(member.slug);
    return entry && matchesSearch(entry) && (province === "wszystkie" || member.province === province);
  });
  const otherUniversities = entries.filter((entry) =>
    !memberSlugs.has(entry.slug) && matchesSearch(entry) &&
    (province === "wszystkie" || entry.infobox.prowincja === province)
  );

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Rejestr akademicki"
        title="Uczelnie Imperium"
        description="Foedus Ambrae — Liga Szesnastu najbardziej prestiżowych uniwersytetów, a także pozostałe szkoły wyższe Imperium."
        action={<Link to="/admin/nowy?type=UNIVERSITY" className="button-secondary"><Plus className="h-4 w-4" /> Dodaj wpis</Link>}
      />

      <section className="surface relative overflow-hidden p-6 md:p-8">
        <div className="flex items-center gap-3 text-gold"><GraduationCap className="h-5 w-5" /><span className="eyebrow">Foedus Ambrae</span></div>
        <h2 className="mt-4 font-serif text-3xl text-cream md:text-4xl">Liga Szesnastu</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-white/55">
          Elitarna liga obejmuje dokładnie 16 uczelni. Cztery znajdują się w Lacjum, a pozostałe reprezentują inne prowincje.
          Kolejność poniżej oznacza kolejność w spisie, nie ranking jakościowy.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {[
            ["16", "Członków ligi"],
            ["4", "Uczelnie w Lacjum"],
            [String(visibleMembers.length), "Wpisów obecnych w bazie"],
          ].map(([value, title]) => (
            <div key={title} className="rounded-xl border border-gold/15 bg-black/20 p-4">
              <div className="font-serif text-3xl text-gold">{value}</div>
              <p className="mt-1 text-xs text-white/45">{title}</p>
            </div>
          ))}
        </div>
      </section>

      {loading && <LoadingBlock />}
      {error && <ErrorBlock message={error} onRetry={reload} />}

      {data && (
        <>
          {visibleMembers.length < members.length && (
            <div className="rounded-xl border border-gold/30 bg-gold/[0.05] p-4 text-sm text-white/70">
              W bazie jest {visibleMembers.length} z 16 wpisów ligi. Uruchom ponownie backend, aby zaimportować
              brakujące dane z pliku lore/imports/foedus-ambrae.json.
            </div>
          )}

          <div className="flex flex-col gap-3 md:flex-row">
            <label className="flex min-h-11 flex-1 items-center gap-3 rounded-lg border border-gold/15 bg-white/[0.02] px-4">
              <Search className="h-4 w-4 text-white/40" />
              <span className="sr-only">Szukaj uczelni</span>
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Szukaj uczelni…" className="w-full bg-transparent text-sm text-cream outline-none placeholder:text-white/35" />
            </label>
            <label className="flex min-h-11 items-center gap-2 rounded-lg border border-gold/15 bg-white/[0.02] px-4 text-sm">
              <MapPin className="h-4 w-4 text-gold/60" />
              <span className="sr-only">Prowincja</span>
              <select value={province} onChange={(event) => setProvince(event.target.value)} className="bg-[#141419] text-cream outline-none">
                <option value="wszystkie">Wszystkie prowincje</option>
                {provinces.map((value) => <option key={value} value={value}>{value}</option>)}
              </select>
            </label>
          </div>

          <section aria-labelledby="foedus-heading">
            <div className="mb-4 flex items-end justify-between gap-3">
              <h2 id="foedus-heading" className="font-serif text-2xl text-cream">Uniwersytety Foedus Ambrae</h2>
              <span className="text-xs text-white/40">{league.length} widocznych</span>
            </div>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {league.map((member) => {
                const entry = bySlug.get(member.slug);
                return entry && (
                  <Link key={member.slug} to={entryPath(entry.type, entry.slug)} className="group surface-muted block p-5 transition hover:-translate-y-0.5 hover:border-gold/40">
                    <div className="flex items-center justify-between"><span className="eyebrow !text-[10px]">Foedus Ambrae</span><ArrowUpRight className="h-4 w-4 text-white/20 group-hover:text-gold" /></div>
                    <h3 className="mt-3 font-serif text-xl leading-snug text-cream">{entry.title}</h3>
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-white/45">{entry.summary}</p>
                    <div className="mt-4 flex items-center gap-2 border-t border-white/[0.06] pt-3 text-xs text-white/45"><MapPin className="h-3.5 w-3.5 text-gold/70" />{member.province}</div>
                  </Link>
                );
              })}
            </div>
            {!league.length && <p className="text-sm text-white/50">Brak wpisów zgodnych z filtrami.</p>}
          </section>

          <section aria-labelledby="other-heading" className="border-t border-gold/15 pt-7">
            <h2 id="other-heading" className="font-serif text-2xl text-cream">Pozostałe uczelnie</h2>
            <p className="mt-2 mb-4 text-sm leading-6 text-white/50">
              Uczelnie spoza ustalonej listy Foedus Ambrae. Dotychczasowe wpisy pozostają zachowane.
            </p>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {otherUniversities.map((entry) => <EntryCard key={entry.id} entry={entry} />)}
            </div>
            {!otherUniversities.length && <p className="text-sm text-white/50">Brak pozostałych wpisów zgodnych z filtrami.</p>}
          </section>
        </>
      )}
    </div>
  );
}
