import { useMemo, useState } from "react";
import { ArrowRight, Crown, GitBranch, Heart, Search, Shield, UsersRound } from "lucide-react";
import { Link } from "react-router-dom";
import { CURRENT_WORLD_YEAR } from "../lib/world";

type Person = {
  key: string;
  name: string;
  dates: string;
  detail: string;
  image?: string;
  slug?: string;
  living?: boolean;
};

type Tab = "tree" | "living" | "succession";

const portraitRoot = "https://raw.githubusercontent.com/MichalADA/Imperrium/main/lore/images/characters/";

const family: Record<string, Person> = {
  izabela: { key: "izabela", name: "Izabela de la Cruz", dates: "409–449", detail: "Matka Octaviana Wielkiego i Octavii", slug: "izabela-de-la-cruz" },
  octavianGreat: { key: "octavianGreat", name: "Octavian Wielki", dates: "428–514", detail: "Założyciel dynastii cesarskiej", image: "octavian-wielki-de-la-cruz.png", slug: "octavian-wielki" },
  octavia: { key: "octavia", name: "Octavia de la Cruz", dates: "428–548", detail: "Bliźniacza siostra Octaviana Wielkiego", image: "octavia-de-la-cruz.png", slug: "octavia-de-la-cruz" },
  teodozjuszI: { key: "teodozjuszI", name: "Teodozjusz I", dates: "446–521", detail: "Najstarszy syn Octaviana Wielkiego i Octavii · cesarz 514–521", image: "teodozjusz-i-de-la-cruz.png", slug: "teodozjusz-i" },
  florentino: { key: "florentino", name: "Florentino de la Cruz", dates: "ur. 456 · zmarły", detail: "Drugi syn Octaviana Wielkiego i Octavii · zmarł bezdzietnie" },
  hiacynta: { key: "hiacynta", name: "Hiacynta de la Cruz", dates: "ur. 470", detail: "Córka Octaviana Wielkiego i Octavii · jej potomkowie żyją" },
  geneovea: { key: "geneovea", name: "Geneovea", dates: "daty nieustalone", detail: "Matka Francesco" },
  lara: { key: "lara", name: "Lara de la Cruz", dates: "127 lat · żyje", detail: "Matka Teodozjusza II · najstarsza żyjąca przedstawicielka rodziny", living: true },
  francesco: { key: "francesco", name: "Francesco de la Cruz", dates: "471–556", detail: "Syn Teodozjusza I i Geneovei · cesarz 521–556 · bezdzietny", image: "francesco-de-la-cruz.png", slug: "francesco-de-la-cruz" },
  teodozjuszII: { key: "teodozjuszII", name: "Teodozjusz II", dates: "501–591", detail: "Syn Teodozjusza I i Lary · cesarz 556–591", image: "teodozjusz-ii-de-la-cruz.png", slug: "teodozjusz-ii" },
  valeria: { key: "valeria", name: "Valeria de la Cruz", dates: "77 lat · żyje", detail: "Cesarzowa wdowa po Teodozjuszu II", living: true },
  octavianYounger: { key: "octavianYounger", name: "Octavian de la Cruz", dates: "557–588", detail: "Starszy syn Teodozjusza II i Valerii · ojciec Michała", slug: "octavian-syn-teodozjusza-ii" },
  ignacius: { key: "ignacius", name: "Ignacius de la Cruz", dates: "48 lat · żyje", detail: "Syn Teodozjusza II i Valerii · panujący cesarz od 591", image: "ignacius-de-la-cruz.png", slug: "ignacius-de-la-cruz", living: true },
  julian: { key: "julian", name: "Julian de la Cruz", dates: "40 lat · żyje", detail: "Syn Teodozjusza II i Valerii", living: true },
  teodora: { key: "teodora", name: "Teodora de la Cruz", dates: "33 lata · żyje", detail: "Córka Teodozjusza II i Valerii · Najwyższa Księżniczka", living: true },
  laura: { key: "laura", name: "Laura von Snith", dates: "wiek nieustalony · żyje", detail: "Wdowa po Octavianie · matka Michała", living: true },
  barbaraHan: { key: "barbaraHan", name: "Barbara Han", dates: "wiek nieustalony · żyje", detail: "Matka Konstancji i Liliany · mieszka w Hekanii", living: true },
  julia: { key: "julia", name: "Julia Han", dates: "wiek nieustalony · żyje", detail: "Małżonka Juliana", image: "julia.png", living: true },
  viqtor: { key: "viqtor", name: "Viqtor Delan", dates: "wiek nieustalony · żyje", detail: "Mąż Teodory", living: true },
  michal: { key: "michal", name: "Michał de la Cruz", dates: "21 lat · żyje", detail: "Syn Octaviana i Laury · trzeci w sukcesji", image: "michal-de-la-cruz.png", slug: "michal-de-la-cruz", living: true },
  konstancja: { key: "konstancja", name: "Konstancja de la Cruz", dates: "19 lat · żyje", detail: "Córka Ignaciusa i Barbary Han · pierwsza w sukcesji", image: "konstancja-de-la-cruz.png", slug: "konstancja-de-la-cruz", living: true },
  liliana: { key: "liliana", name: "Liliana de la Cruz", dates: "17 lat · żyje", detail: "Córka Ignaciusa i Barbary Han · druga w sukcesji", image: "liliana-de-la-cruz.png", slug: "liliana-de-la-cruz", living: true },
  nataniel: { key: "nataniel", name: "Nataniel de la Cruz", dates: "wiek nieustalony · żyje", detail: "Syn Teodory i Viqtora · szósty w sukcesji", living: true },
  barbara: { key: "barbara", name: "Barbara de la Cruz", dates: "3 lata · żyje", detail: "Córka Teodory i Viqtora · siódma w sukcesji", living: true },
  dominique: { key: "dominique", name: "Dominique De Cruz", dates: "62 lata · żyje", detail: "Dalsza gałąź rodu · ósmy w sukcesji; dokładne pokrewieństwo nieustalone", living: true },
};

const historicOrder = [
  ["octavianGreat", "Do roku 514"],
  ["teodozjuszI", "514–521"],
  ["francesco", "521–556"],
  ["teodozjuszII", "556–591"],
  ["ignacius", "Od roku 591"],
] as const;

const heirs = ["konstancja", "liliana", "michal", "julian", "teodora", "nataniel", "barbara", "dominique"] as const;

const livingIds = [
  "lara", "valeria", "ignacius", "julian", "teodora",
  "konstancja", "liliana", "michal", "nataniel", "barbara",
  "dominique", "laura", "viqtor", "julia", "barbaraHan",
] as const;

function Portrait({ person, className = "" }: { person: Person; className?: string }) {
  const initials = person.name.split(" ").slice(0, 2).map((word) => word.charAt(0)).join("");
  return (
    <div className={"relative overflow-hidden bg-gradient-to-br from-[#4b384a] via-[#211c28] to-[#0b0e15] " + className}>
      <span aria-hidden="true" className="absolute inset-0 grid place-items-center font-serif text-3xl text-gold/35">{initials}</span>
      {person.image && (
        <img
          src={portraitRoot + person.image}
          alt={"Portret: " + person.name}
          loading="lazy"
          className="relative h-full w-full object-cover object-top"
          onError={(event) => { event.currentTarget.style.display = "none"; }}
        />
      )}
    </div>
  );
}

function PersonCard({ id, compact = false }: { id: string; compact?: boolean }) {
  const person = family[id];
  if (!person) return null;
  const body = (
    <>
      <Portrait person={person} className={compact ? "h-20 w-16 shrink-0 rounded-md" : "aspect-[4/3] w-full rounded-lg"} />
      <div className="min-w-0">
        <h3 className={"font-serif leading-snug text-cream " + (compact ? "text-base" : "mt-3 text-lg")}>{person.name}</h3>
        <p className="mt-1 text-xs text-gold/80">{person.dates}</p>
        <p className="mt-2 text-xs leading-5 text-white/50">{person.detail}</p>
        {person.slug && <span className="mt-2 inline-flex items-center gap-1 text-xs text-gold/70">Kartoteka <ArrowRight className="h-3 w-3" /></span>}
      </div>
    </>
  );
  const className = "group relative flex rounded-xl border border-gold/15 bg-[#16171c]/90 p-3 shadow-lg shadow-black/10 transition hover:border-gold/45 " +
    (compact ? "items-start gap-3" : "flex-col");
  if (person.slug) {
    return <Link to={"/postacie/" + person.slug} className={className}>{body}</Link>;
  }
  return <div className={className}>{body}</div>;
}

function DescendantRow({ title, ids, description }: { title: string; ids: string[]; description?: string }) {
  return (
    <div className="relative mt-7">
      <div className="mx-auto h-7 w-px bg-gold/35" aria-hidden="true" />
      <div className="mx-auto mb-5 h-px w-3/4 bg-gradient-to-r from-transparent via-gold/30 to-transparent" aria-hidden="true" />
      <div className="mb-4 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gold/70">{title}</p>
        {description && <p className="mx-auto mt-2 max-w-3xl text-xs leading-5 text-white/45">{description}</p>}
      </div>
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {ids.map((id) => <PersonCard key={id} id={id} compact />)}
      </div>
    </div>
  );
}

function Relationship({ title, note, people }: { title: string; note: string; people: string[] }) {
  return (
    <section className="rounded-2xl border border-gold/15 bg-black/20 p-4 md:p-6">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <GitBranch className="h-5 w-5 text-gold/75" />
        <h3 className="font-serif text-xl">{title}</h3>
      </div>
      <p className="mb-5 text-sm leading-6 text-white/45">{note}</p>
      <div className="grid gap-3 sm:grid-cols-2">{people.map((id) => <PersonCard key={id} id={id} compact />)}</div>
    </section>
  );
}

function FamilyTree() {
  return (
    <div className="space-y-8">
      <section className="surface overflow-hidden p-5 md:p-8">
        <div className="flex items-center gap-2 text-gold"><GitBranch className="h-5 w-5" /><span className="eyebrow">Korzenie dynastii</span></div>
        <h2 className="mt-3 font-serif text-2xl md:text-3xl">Od Izabeli do Octaviana Wielkiego</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-white/50">Pierwsze pokolenia rodu, zgodnie z historią ustaloną dla lat 409–548.</p>
        <div className="mx-auto mt-6 max-w-sm"><PersonCard id="izabela" compact /></div>
        <DescendantRow
          title="Bliźnięta Izabeli · rok 428"
          ids={["octavianGreat", "octavia"]}
          description="Octavian Wielki i Octavia byli rodzeństwem bliźniaczym. Zgodnie z ustalonym kanonem są również rodzicami trojga dzieci przedstawionych poniżej."
        />
        <DescendantRow
          title="Troje dzieci Octaviana Wielkiego i Octavii"
          ids={["teodozjuszI", "florentino", "hiacynta"]}
          description="Teodozjusz I był najstarszym synem, Florentino drugim synem. Florentino zmarł bezdzietnie; potomkowie Hiacynty żyją, lecz ich imion i dalszego przebiegu gałęzi jeszcze nie ustalono."
        />
      </section>

      <section className="surface overflow-hidden p-5 md:p-8">
        <div className="flex items-center gap-2 text-gold"><Crown className="h-5 w-5" /><span className="eyebrow">Linia Teodozjusza I</span></div>
        <h2 className="mt-3 font-serif text-2xl md:text-3xl">Dwie linie synów cesarza</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-white/50">
          Francesco i Teodozjusz II byli przyrodnimi braćmi: mieli tego samego ojca, Teodozjusza I, lecz różne matki.
        </p>
        <div className="mx-auto mt-6 max-w-sm"><PersonCard id="teodozjuszI" compact /></div>
        <div className="mt-7 grid gap-4 lg:grid-cols-2">
          <Relationship title="Geneovea i Francesco" note="Geneovea była matką Francesco. Francesco objął tron w roku 521 i zmarł bezpotomnie." people={["geneovea", "francesco"]} />
          <Relationship title="Lara i Teodozjusz II" note="Lara jest matką Teodozjusza II. Nadal żyje w roku 607. Teodozjusz II objął tron po swoim przyrodnim bracie w 556 roku." people={["lara", "teodozjuszII"]} />
        </div>
      </section>

      <section className="surface overflow-hidden p-5 md:p-8">
        <div className="flex items-center gap-2 text-gold"><UsersRound className="h-5 w-5" /><span className="eyebrow">Główna rodzina cesarska · rok 607</span></div>
        <h2 className="mt-3 font-serif text-2xl md:text-3xl">Teodozjusz II i Valeria</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-white/50">
          Teodozjusz II zmarł w roku 591. Cesarzowa wdowa Valeria nadal żyje, podobnie jak troje spośród ich czworga dzieci.
        </p>
        <div className="mx-auto mt-6 grid max-w-2xl gap-3 sm:grid-cols-2">
          <PersonCard id="teodozjuszII" compact />
          <PersonCard id="valeria" compact />
        </div>
        <DescendantRow
          title="Dzieci Teodozjusza II i Valerii"
          ids={["octavianYounger", "ignacius", "julian", "teodora"]}
          description="Octavian (557–588), Ignacius (ur. 559), Julian (ur. 567), Teodora (ur. 574). Octavian zginął przed objęciem tronu przez Ignaciusa."
        />
        <div className="mt-8 grid gap-4 xl:grid-cols-2">
          <Relationship title="Gałąź Octaviana" note="Octavian i Laura von Snith byli rodzicami Michała. Octavian zmarł w roku 588." people={["laura", "michal"]} />
          <Relationship title="Gałąź Ignaciusa" note="Córkami cesarza Ignaciusa i Barbary Han są Konstancja oraz Liliana. Barbara mieszka obecnie w Hekanii; ma tam jeszcze córkę i syna z nowej rodziny." people={["konstancja", "liliana"]} />
          <Relationship title="Gałąź Juliana" note="Julian jest małżonkiem Julii Han. Nie dodano niepotwierdzonych funkcji ani dzieci." people={["julian", "julia"]} />
          <Relationship title="Gałąź Teodory" note="Teodora i Viqtor Delan są rodzicami Nataniela i Barbary. Dzieci występują w cesarskiej linii sukcesji przed ojcem." people={["nataniel", "barbara"]} />
        </div>
      </section>

      <section className="surface p-5 md:p-8">
        <div className="flex items-center gap-2 text-gold"><GitBranch className="h-5 w-5" /><span className="eyebrow">Nieprzypisana gałąź</span></div>
        <h2 className="mt-3 font-serif text-2xl">Dominique De Cruz</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-white/50">Dominique ma 62 lata i zajmuje ósme miejsce w sukcesji. Jego dokładne pokrewieństwo z główną linią rodu nie zostało ustalone, dlatego nie łączymy go arbitralną linią z innymi osobami. Tak samo nie przypisujemy jeszcze konkretnych osób do potomków Hiacynty.</p>
        <div className="mt-5 max-w-sm"><PersonCard id="dominique" compact /></div>
      </section>
    </div>
  );
}

function LivingFamily() {
  const [search, setSearch] = useState("");
  const filtered = useMemo(() => livingIds
    .map((key) => family[key])
    .filter((person) => [person.name, person.detail].join(" ").toLocaleLowerCase("pl").includes(search.trim().toLocaleLowerCase("pl"))), [search]);

  return (
    <section className="surface p-5 md:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Żyjący w roku {CURRENT_WORLD_YEAR}</p>
          <h2 className="mt-2 font-serif text-2xl md:text-3xl">Rejestr rodziny cesarskiej</h2>
          <p className="mt-2 text-sm text-white/50">15 imiennie znanych osób z dynastii i jej najbliższego otoczenia rodzinnego przez małżeństwo.</p>
        </div>
        <label className="flex min-h-11 items-center gap-2 rounded-lg border border-gold/20 bg-black/25 px-3 text-sm text-white/50">
          <Search className="h-4 w-4 shrink-0" />
          <span className="sr-only">Szukaj członka rodziny</span>
          <input className="w-full bg-transparent text-cream outline-none placeholder:text-white/30 sm:w-56" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Szukaj w rodzinie…" />
        </label>
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((person) => <PersonCard key={person.key} id={person.key} compact />)}
      </div>
      {filtered.length === 0 && <p className="mt-6 text-sm text-white/55">Nie znaleziono osoby pasującej do wyszukiwania.</p>}
      <div className="mt-7 rounded-xl border border-gold/15 bg-gold/[0.04] p-4 text-sm leading-6 text-white/60">
        <Heart className="mr-2 inline h-4 w-4 text-gold" />
        Ponadto Barbara Han ma w Hekanii dwoje młodszych dzieci — córkę i syna, których imiona i wiek pozostają nieustalone.
      </div>
    </section>
  );
}

function Succession() {
  return (
    <div className="space-y-6">
      <section className="surface overflow-hidden">
        <div className="border-b border-gold/15 bg-gradient-to-r from-[#4b3348]/35 to-transparent p-5 md:p-8">
          <p className="eyebrow">Historyczne następstwo tronu</p>
          <h2 className="mt-2 font-serif text-2xl md:text-3xl">Cesarze dynastii de la Cruz</h2>
          <p className="mt-2 text-sm text-white/50">Kolejność panowania nie jest tym samym co genealogia rodzic–dziecko.</p>
        </div>
        <div className="grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 md:p-8">
          {historicOrder.map(([key, reign], index) => {
            const person = family[key];
            return (
              <div key={key}>
                <p className="mb-2 text-xs text-gold/70">{String(index + 1).padStart(2, "0")} · {reign}</p>
                <PersonCard id={key} compact />
              </div>
            );
          })}
        </div>
      </section>

      <section className="surface p-5 md:p-8">
        <div className="flex items-center gap-2 text-gold"><Shield className="h-5 w-5" /><span className="eyebrow">Stan na rok {CURRENT_WORLD_YEAR}</span></div>
        <h2 className="mt-3 font-serif text-2xl md:text-3xl">Aktualna kolejność sukcesji</h2>
        <p className="mt-2 text-sm text-white/50">Panuje Ignacius de la Cruz. Poniższa lista dotyczy następców tronu, a nie wszystkich żyjących krewnych.</p>
        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {heirs.map((id, index) => {
            const person = family[id];
            return (
              <div key={id} className="flex items-start gap-3 rounded-xl border border-gold/15 bg-white/[0.025] p-3">
                <span className={"flex h-10 w-10 shrink-0 items-center justify-center rounded-lg font-serif text-xl " + (index === 0 ? "bg-gold text-[#19150f]" : "bg-gold/10 text-gold")}>{index + 1}</span>
                <div className="min-w-0 flex-1"><PersonCard id={id} compact /></div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

export function GenealogyPage() {
  const [tab, setTab] = useState<Tab>("tree");
  const tabs: Array<{ id: Tab; label: string }> = [
    { id: "tree", label: "Drzewo genealogiczne" },
    { id: "living", label: "Żyjący członkowie" },
    { id: "succession", label: "Sukcesja" },
  ];
  return (
    <div className="space-y-7">
      <section className="surface relative overflow-hidden p-6 md:p-9">
        <div className="pointer-events-none absolute -right-24 -top-28 h-72 w-72 rounded-full border border-gold/15 bg-[#4e2b52]/20" />
        <div className="relative">
          <div className="flex items-center gap-3 text-gold"><Crown className="h-5 w-5" /><p className="eyebrow">Archiwum Domu Panującego · rok {CURRENT_WORLD_YEAR}</p></div>
          <h1 className="mt-4 max-w-4xl font-serif text-4xl leading-tight text-cream md:text-5xl">Genealogia rodu <span className="text-gold">de la Cruz</span></h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-white/55 md:text-base">Od Octaviana Wielkiego i jego potomków po cztery żyjące pokolenia współczesnej rodziny cesarskiej. Portrety pochodzą z archiwum Imperium; nieznane więzi rodzinne pozostają nieoznaczone.</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {[["428", "Narodziny Octaviana Wielkiego"], ["591", "Początek rządów Ignaciusa"], ["607", "Aktualny rok Imperium"]].map(([value, label]) => (
              <div key={value} className="rounded-xl border border-gold/15 bg-black/20 p-4"><p className="font-serif text-3xl text-gold">{value}</p><p className="mt-1 text-xs text-white/50">{label}</p></div>
            ))}
          </div>
        </div>
      </section>
      <nav aria-label="Widoki genealogii" className="flex flex-wrap gap-2">
        {tabs.map((item) => <button key={item.id} type="button" onClick={() => setTab(item.id)} aria-pressed={tab === item.id} className={tab === item.id ? "button-primary" : "button-secondary"}>{item.label}</button>)}
      </nav>
      {tab === "tree" && <FamilyTree />}
      {tab === "living" && <LivingFamily />}
      {tab === "succession" && <Succession />}
      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-gold/15 py-5 text-xs leading-6 text-white/40">
        <span>Nieustalone daty, osoby i relacje nie są dopowiadane. Dane odnoszą się do roku {CURRENT_WORLD_YEAR}.</span>
        <Link to="/dynastia" className="inline-flex items-center gap-1 text-gold/70 hover:text-gold">Starszy widok dynastii <ArrowRight className="h-3 w-3" /></Link>
      </footer>
    </div>
  );
}
