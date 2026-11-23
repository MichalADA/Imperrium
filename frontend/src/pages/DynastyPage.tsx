import { useMemo, useState } from "react";
import {
  ArrowRight, BookOpen, Crown, GitFork, Heart, Info, Landmark,
  Search, ShieldCheck, Sparkles, Users, X,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  dynastyPeople, dynastyPortrait, familyUnits, imperialRulers,
  personById, successionIds,
} from "../lib/deLaCruzGenealogy";
import type { DynastyFamily, DynastyPerson } from "../lib/deLaCruzGenealogy";

type StatusFilter = "wszyscy" | "zyjacy" | "historyczni";

function DynastyPortrait({ person, className = "" }: { person: DynastyPerson; className?: string }) {
  const src = dynastyPortrait(person.portrait);
  const initials = person.name.split(" ").slice(0, 2).map((part) => part[0]).join("");
  return (
    <div className={`relative overflow-hidden bg-gradient-to-b from-[#44311f] to-[#181318] ${className}`}>
      <span className="absolute inset-0 flex items-center justify-center font-serif text-3xl text-[#dfbc73]/35" aria-hidden="true">{initials}</span>
      {src && (
        <img
          src={src}
          alt={`Portret: ${person.name}`}
          loading="lazy"
          className="relative h-full w-full object-cover object-top"
          onError={(event) => { event.currentTarget.style.display = "none"; }}
        />
      )}
    </div>
  );
}

function PersonTile({ id, active, onSelect }: { id: string; active: boolean; onSelect: (id: string) => void }) {
  const person = personById[id];
  return (
    <button
      type="button"
      onClick={() => onSelect(id)}
      aria-pressed={active}
      className={`group relative flex min-w-0 flex-col items-center rounded-xl border px-2.5 py-3 text-center transition duration-200 hover:-translate-y-0.5 hover:border-gold/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold ${active ? "border-gold/65 bg-gold/[0.12]" : "border-white/10 bg-[#14141a] hover:bg-[#211b20]"}`}
    >
      {person.rank && <span className="absolute right-2 top-2 z-10 rounded-md border border-gold/25 bg-black/75 px-1.5 py-0.5 text-[10px] text-gold">#{person.rank}</span>}
      <DynastyPortrait person={person} className="h-20 w-16 rounded-lg border border-gold/15 shadow-lg sm:h-24 sm:w-[72px]" />
      <span className="mt-2 line-clamp-2 min-h-10 font-serif text-sm leading-5 text-cream sm:text-[15px]">{person.name}</span>
      <span className="mt-1 text-[11px] leading-4 text-gold/75">{person.life}</span>
      <span className={`mt-2 inline-flex items-center gap-1 text-[10px] ${person.status === "żyje" ? "text-emerald-300/75" : "text-white/35"}`}>
        <span className={`h-1.5 w-1.5 rounded-full ${person.status === "żyje" ? "bg-emerald-400" : "bg-white/30"}`} />{person.status === "żyje" ? "Żyje" : "Postać historyczna"}
      </span>
    </button>
  );
}

function FamilyPanel({ family, activeId, onSelect }: { family: DynastyFamily; activeId: string; onSelect: (id: string) => void }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-gold/15 bg-gradient-to-br from-[#19171b] via-[#111216] to-[#131016]">
      <div className="border-b border-white/[0.06] px-4 pb-4 pt-5 sm:px-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gold/60">{family.era}</p>
        <h3 className="mt-2 font-serif text-lg leading-tight text-cream">{family.title}</h3>
      </div>
      <div className="p-4 sm:p-5">
        <div className="grid grid-cols-2 justify-center gap-2">
          {family.parents.map((id) => <PersonTile key={id} id={id} active={activeId === id} onSelect={onSelect} />)}
        </div>
        <div className="mx-auto h-7 w-px bg-gradient-to-b from-gold/55 to-gold/20" aria-hidden="true" />
        <div className="mx-auto mb-3 flex w-24 items-center justify-center gap-2 text-gold/65" aria-label="Dzieci">
          <span className="h-px flex-1 bg-gold/30" /><GitFork className="h-4 w-4" /><span className="h-px flex-1 bg-gold/30" />
        </div>
        <div className={`grid gap-2 ${family.children.length >= 3 ? "grid-cols-2" : family.children.length === 1 ? "grid-cols-1 max-w-[170px] mx-auto" : "grid-cols-2"}`}>
          {family.children.map((id) => <PersonTile key={id} id={id} active={activeId === id} onSelect={onSelect} />)}
        </div>
        {family.note && <p className="mt-4 border-t border-white/[0.06] pt-3 text-xs leading-5 text-white/45">{family.note}</p>}
      </div>
    </article>
  );
}

function PersonDetails({ person, onSelect }: { person: DynastyPerson; onSelect: (id: string) => void }) {
  return (
    <section aria-label={`Szczegóły postaci ${person.name}`} className="overflow-hidden rounded-2xl border border-gold/25 bg-[#131319]">
      <div className="relative h-36 overflow-hidden bg-gradient-to-br from-[#412236] to-[#1c1b27]">
        <div className="absolute -right-8 -top-12 h-48 w-48 rounded-full border border-gold/15" />
        <div className="absolute left-5 top-5 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-gold/70"><Crown className="h-4 w-4" /> Archiwum osoby</div>
        <DynastyPortrait person={person} className="absolute bottom-0 right-5 h-[118px] w-24 rounded-t-xl border border-b-0 border-gold/25" />
      </div>
      <div className="p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-gold/25 bg-gold/10 px-2.5 py-1 text-[10px] text-gold">{person.status === "żyje" ? "Żyjący członek rodziny" : "Postać historyczna"}</span>
          {person.rank && <span className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] text-white/65">{person.rank}. w sukcesji</span>}
        </div>
        <h3 className="mt-3 font-serif text-2xl leading-tight text-cream">{person.name}</h3>
        <p className="mt-1 text-sm text-gold/80">{person.life}</p>
        <p className="mt-3 text-sm font-medium text-cream/85">{person.role}</p>
        <p className="mt-2 text-sm leading-6 text-white/55">{person.note}</p>
        {person.parents && person.parents.length > 0 && (
          <div className="mt-5 border-t border-white/10 pt-4">
            <h4 className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gold/70">Rodzice</h4>
            <div className="mt-2 flex flex-wrap gap-2">
              {person.parents.map((id) => <button key={id} type="button" onClick={() => onSelect(id)} className="rounded-lg border border-white/10 px-2.5 py-1.5 text-xs text-white/70 hover:border-gold/40 hover:text-gold">{personById[id].name}</button>)}
            </div>
          </div>
        )}
        {person.partners && person.partners.length > 0 && (
          <div className="mt-4">
            <h4 className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gold/70">Partnerzy / małżonkowie</h4>
            <div className="mt-2 flex flex-wrap gap-2">
              {person.partners.map((id) => <button key={id} type="button" onClick={() => onSelect(id)} className="rounded-lg border border-white/10 px-2.5 py-1.5 text-xs text-white/70 hover:border-gold/40 hover:text-gold">{personById[id].name}</button>)}
            </div>
          </div>
        )}
        {dynastyPeople.some((entry) => entry.parents?.includes(person.id)) && (
          <div className="mt-4">
            <h4 className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gold/70">Dzieci uwzględnione w genealogii</h4>
            <div className="mt-2 flex flex-wrap gap-2">
              {dynastyPeople.filter((entry) => entry.parents?.includes(person.id)).map((entry) => <button key={entry.id} type="button" onClick={() => onSelect(entry.id)} className="rounded-lg border border-white/10 px-2.5 py-1.5 text-xs text-white/70 hover:border-gold/40 hover:text-gold">{entry.name}</button>)}
            </div>
          </div>
        )}
        {person.articleSlug && <Link to={`/postacie/${person.articleSlug}`} className="mt-5 inline-flex items-center gap-2 text-sm text-gold/90 hover:text-gold"><BookOpen className="h-4 w-4" /> Artykuł w archiwum <ArrowRight className="h-3.5 w-3.5" /></Link>}
      </div>
    </section>
  );
}

const portraitLeaders = ["octavian-wielki", "ignacius", "konstancja"];

export function DynastyPage() {
  const [selectedId, setSelectedId] = useState("octavian-wielki");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("wszyscy");
  const selected = personById[selectedId];
  const living = dynastyPeople.filter((person) => person.status === "żyje").length;
  const results = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("pl");
    return dynastyPeople.filter((person) =>
      (statusFilter === "wszyscy" || (statusFilter === "zyjacy" ? person.status === "żyje" : person.status === "zmarł")) &&
      (!query || [person.name, person.role, person.life, person.note].join(" ").toLocaleLowerCase("pl").includes(query)),
    );
  }, [search, statusFilter]);
  const selectPerson = (id: string) => setSelectedId(id);

  return (
    <div className="space-y-9">
      <section className="relative overflow-hidden rounded-[28px] border border-gold/25 bg-gradient-to-br from-[#221724] via-[#12121a] to-[#0d1013] px-6 py-8 shadow-imperial sm:px-9 sm:py-10 xl:px-12">
        <div className="pointer-events-none absolute -right-24 -top-28 h-80 w-80 rounded-full border border-gold/15" />
        <div className="pointer-events-none absolute -bottom-24 left-1/3 h-72 w-72 rounded-full bg-imperial/10 blur-3xl" />
        <div className="relative grid items-center gap-7 lg:grid-cols-[1fr_0.72fr]">
          <div>
            <div className="flex items-center gap-3 text-gold"><Crown className="h-5 w-5" /><p className="text-[11px] font-semibold uppercase tracking-[0.26em]">Imperium Technokratyczne · rok 607</p></div>
            <h1 className="mt-5 max-w-2xl font-serif text-4xl leading-[1.08] text-cream sm:text-5xl xl:text-6xl">Genealogia rodu <span className="text-gold">de la Cruz</span></h1>
            <p className="mt-5 max-w-xl text-sm leading-7 text-white/60 sm:text-base">Od Izabeli, Octaviana Wielkiego i Octavii, przez pięciu cesarzy, aż po obecną rodzinę cesarza Ignaciusa. Powiązania krwi, boczna linia De Cruz i następstwo Tronu Światła.</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a className="button-primary gap-2" href="#drzewo"><GitFork className="h-4 w-4" /> Odkryj drzewo</a>
              <a className="button-secondary gap-2" href="#sukcesja"><Crown className="h-4 w-4" /> Kolejność sukcesji</a>
            </div>
          </div>
          <div className="grid grid-cols-3 items-end gap-2 sm:gap-3" aria-label="Portrety kolejnych pokoleń dynastii">
            {portraitLeaders.map((id, index) => {
              const person = personById[id];
              return <button type="button" onClick={() => selectPerson(id)} key={id} className={`group overflow-hidden rounded-xl border border-gold/25 bg-black/20 text-left transition hover:border-gold/70 ${index === 1 ? "translate-y-3" : ""}`}>
                <DynastyPortrait person={person} className="aspect-[2/3] w-full" />
                <span className="block truncate border-t border-gold/15 px-2 py-3 text-center font-serif text-xs text-cream/90 sm:text-sm">{person.name.split(" ")[0]}</span>
              </button>;
            })}
          </div>
        </div>
        <div className="relative mt-9 grid grid-cols-2 gap-3 border-t border-white/10 pt-6 md:grid-cols-4">
          {[{ number: "607", label: "Rok obecny" }, { number: "5", label: "Potwierdzonych cesarzy" }, { number: String(living), label: "Imiennie znanych żyjących" }, { number: "8", label: "Osób w sukcesji" }].map((item) =>
            <div key={item.label}><p className="font-serif text-3xl text-gold">{item.number}</p><p className="mt-1 text-xs text-white/45">{item.label}</p></div>,
          )}
        </div>
      </section>

      <section id="panowanie" className="scroll-mt-24">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div><p className="eyebrow">Dom panujący</p><h2 className="mt-2 font-serif text-2xl text-cream sm:text-3xl">Cesarze dynastii</h2></div>
          <span className="hidden text-xs text-white/35 sm:block">Chronologia panowania ≠ genealogia</span>
        </div>
        <div className="grid gap-2 md:grid-cols-5">
          {imperialRulers.map((id, i) => {
            const person = personById[id];
            return <button type="button" key={id} onClick={() => selectPerson(id)} className={`group flex items-center gap-3 rounded-xl border p-3 text-left transition hover:border-gold/45 md:flex-col md:text-center ${selectedId === id ? "border-gold/60 bg-gold/[0.08]" : "border-gold/15 bg-white/[0.025]"}`}>
              <DynastyPortrait person={person} className="h-16 w-14 shrink-0 rounded-lg md:h-28 md:w-24" />
              <div className="min-w-0"><p className="text-[10px] tracking-[0.1em] text-gold/65">0{i+1} · {person.reign}</p><p className="mt-1 font-serif text-sm text-cream">{person.name}</p></div>
            </button>;
          })}
        </div>
      </section>

      <section id="drzewo" className="scroll-mt-24">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <div><p className="eyebrow">Więzy krwi</p><h2 className="mt-2 font-serif text-2xl text-cream sm:text-3xl">Drzewo genealogiczne</h2><p className="mt-2 text-sm text-white/45">Wybierz dowolną osobę, aby zobaczyć rodziców, partnerów i znane potomstwo.</p></div>
          <span className="inline-flex items-center gap-2 rounded-full border border-gold/20 px-3 py-1.5 text-xs text-gold/70"><GitFork className="h-3.5 w-3.5" /> Relacje potwierdzone</span>
        </div>
        <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_310px]">
          <div className="grid gap-4 md:grid-cols-2">
            {familyUnits.map((family) => <FamilyPanel key={family.title} family={family} activeId={selectedId} onSelect={selectPerson} />)}
          </div>
          <div className="xl:sticky xl:top-24"><PersonDetails person={selected} onSelect={selectPerson} /></div>
        </div>
      </section>

      <section id="sukcesja" className="scroll-mt-24 rounded-2xl border border-gold/15 bg-gradient-to-b from-[#181620] to-[#101115] p-5 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div><div className="flex items-center gap-2 text-gold"><Crown className="h-5 w-5" /><p className="eyebrow">Tron Światła</p></div><h2 className="mt-3 font-serif text-2xl text-cream sm:text-3xl">Aktualna kolejność sukcesji</h2><p className="mt-2 max-w-xl text-sm leading-6 text-white/45">Rok 607. Panującym cesarzem jest Ignacius; poniższa lista przedstawia jego następców, nie poprzednich władców.</p></div>
          <div className="rounded-lg border border-gold/25 bg-gold/[0.08] px-4 py-2 text-sm text-gold"><Landmark className="mr-2 inline h-4 w-4" /> Ignacius · cesarz od 591</div>
        </div>
        <div className="mt-6 grid gap-2 md:grid-cols-2">
          {successionIds.map((id, i) => {
            const person = personById[id];
            return <button key={id} type="button" onClick={() => {selectPerson(id); document.getElementById("drzewo")?.scrollIntoView({ behavior: "smooth", block: "start" });}} className="flex items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.025] p-3 text-left transition hover:border-gold/40 hover:bg-gold/[0.045]">
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border font-serif text-xl ${i === 0 ? "border-gold/50 bg-gold/20 text-gold" : "border-gold/15 text-gold/65"}`}>{i + 1}</span>
              <DynastyPortrait person={person} className="h-12 w-10 shrink-0 rounded-md" />
              <div className="min-w-0 flex-1"><p className="font-serif text-sm text-cream sm:text-base">{person.name}</p><p className="mt-0.5 text-xs text-white/40">{person.life}</p></div>
              <ArrowRight className="h-4 w-4 shrink-0 text-gold/40" />
            </button>;
          })}
        </div>
      </section>

      <section id="rejestr" className="scroll-mt-24">
        <div className="mb-5"><p className="eyebrow">Rejestr genealogiczny</p><h2 className="mt-2 font-serif text-2xl text-cream sm:text-3xl">Wszyscy znani członkowie i bliscy</h2><p className="mt-2 text-sm text-white/45">Obejmuje również zmarłych przodków, małżonków z innych rodów i boczną gałąź De Cruz.</p></div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="relative flex-1"><Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-white/35" /><span className="sr-only">Wyszukaj osobę</span><input className="field !pl-10" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Szukaj po imieniu, nazwisku lub relacji…" />{search && <button type="button" aria-label="Wyczyść wyszukiwanie" onClick={() => setSearch("")} className="absolute right-3 top-3.5 text-white/50 hover:text-cream"><X className="h-4 w-4" /></button>}</label>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filtruj według statusu">
            {([{ value: "wszyscy", label: "Wszyscy" }, { value: "zyjacy", label: "Żyjący" }, { value: "historyczni", label: "Historyczni" }] as const).map((option) =>
              <button key={option.value} type="button" aria-pressed={statusFilter === option.value} onClick={() => setStatusFilter(option.value)} className={`min-h-11 rounded-lg border px-3 text-xs transition ${statusFilter === option.value ? "border-gold/50 bg-gold/[0.15] text-gold" : "border-white/10 text-white/55 hover:border-gold/30"}`}>{option.label}</button>,
            )}
          </div>
        </div>
        <p className="my-3 text-xs text-white/35">Wyświetlono {results.length} z {dynastyPeople.length} osób</p>
        {results.length === 0 && <div className="rounded-xl border border-white/10 p-6 text-sm text-white/50">Brak osób pasujących do tego wyszukiwania.</div>}
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((person) =>
            <button key={person.id} type="button" onClick={() => {selectPerson(person.id); document.getElementById("drzewo")?.scrollIntoView({ behavior: "smooth", block: "start" });}} className="flex items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.02] p-3 text-left transition hover:border-gold/35">
              <DynastyPortrait person={person} className="h-16 w-12 shrink-0 rounded-md" />
              <span className="min-w-0 flex-1"><span className="block font-serif text-sm text-cream">{person.name}</span><span className="mt-1 block text-xs text-gold/60">{person.life}</span><span className="mt-1 block text-[11px] leading-4 text-white/40">{person.role}</span></span>
            </button>,
          )}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-gold/15 bg-white/[0.025] p-5">
          <div className="flex items-center gap-2 text-gold"><Heart className="h-4 w-4" /><h3 className="font-serif text-lg">Rodzina Barbary Han</h3></div>
          <p className="mt-3 text-sm leading-6 text-white/50">Konstancja i Liliana odnalazły matkę w Hekanii. Barbara Han wychowuje tam młodszą córkę i syna. Ich imiona oraz dane drugiego rodzica nie są jeszcze potwierdzone, dlatego nie dodano im fikcyjnych kart.</p>
        </div>
        <div className="rounded-xl border border-gold/15 bg-white/[0.025] p-5">
          <div className="flex items-center gap-2 text-gold"><Info className="h-4 w-4" /><h3 className="font-serif text-lg">Uwagi archiwisty</h3></div>
          <p className="mt-3 text-sm leading-6 text-white/50">* Przy Larze zachowano ostatnio podany wiek 107 lat; starszy zapis roku urodzenia 480 jest z nim sprzeczny i wymaga rozstrzygnięcia. Podobnie starsze wpisy o Teodorze i młodszym Octavianie różnią się od aktualnego kanonu. Nie dopisujemy nieznanych urzędów, tytułów ani krewnych.</p>
        </div>
      </section>

      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-gold/10 pt-5 text-xs text-white/30"><span className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-gold/50" /> Rejestr dynastii · stan świata: 607</span><span className="inline-flex items-center gap-2"><Sparkles className="h-4 w-4" /> Portrety z archiwum Imperrium</span></footer>
    </div>
  );
}
