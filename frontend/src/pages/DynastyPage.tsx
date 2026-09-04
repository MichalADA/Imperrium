import { Crown, GitBranch, Network, UsersRound } from "lucide-react";
import { Link } from "react-router-dom";
import { PageHeader } from "../components/PageHeader";

const succession = [
  ["Octavian Wielki", "octavian-wielki", "Panował do 514"],
  ["Teodozjusz I", "teodozjusz-i", "514–521"],
  ["Francesco", "francesco-de-la-cruz", "521–556"],
  ["Teodozjusz II", "teodozjusz-ii", "556–591"],
  ["Ignacius", "ignacius-de-la-cruz", "591–obecnie"],
] as const;

type FamilyNode = { name: string; slug: string; note: string; twin?: boolean };

const generations: Array<{ label: string; nodes: FamilyNode[] }> = [
  { label: "Pokolenie 1", nodes: [{ name: "Izabela de la Cruz", slug: "izabela-de-la-cruz", note: "matka Octaviana i Octavii" }] },
  {
    label: "Pokolenie 2 · bliźnięta",
    nodes: [
      { name: "Octavian Wielki", slug: "octavian-wielki", note: "syn Izabeli", twin: true },
      { name: "Octavia de la Cruz", slug: "octavia-de-la-cruz", note: "córka Izabeli", twin: true },
    ],
  },
  { label: "Pokolenie 3", nodes: [{ name: "Teodozjusz I", slug: "teodozjusz-i", note: "syn Octaviana Wielkiego" }] },
  {
    label: "Pokolenie 4 · bracia",
    nodes: [
      { name: "Francesco", slug: "francesco-de-la-cruz", note: "starszy brat" },
      { name: "Teodozjusz II", slug: "teodozjusz-ii", note: "młodszy brat" },
    ],
  },
  {
    label: "Pokolenie 5 · bracia",
    nodes: [
      { name: "Octavian", slug: "octavian-syn-teodozjusza-ii", note: "syn Teodozjusza II" },
      { name: "Ignacius", slug: "ignacius-de-la-cruz", note: "syn Teodozjusza II" },
    ],
  },
  {
    label: "Pokolenie 6",
    nodes: [
      { name: "Michał de la Cruz", slug: "michal-de-la-cruz", note: "syn Octaviana" },
      { name: "Konstancja", slug: "konstancja-de-la-cruz", note: "córka Ignaciusa" },
    ],
  },
];

function FamilyCard({ node }: { node: FamilyNode }) {
  return (
    <Link to={`/postacie/${node.slug}`} className="surface-muted relative block min-w-0 flex-1 p-4 text-center transition hover:-translate-y-0.5 hover:border-gold/40">
      {node.twin && <span className="badge mb-2">bliźnię</span>}
      <h3 className="font-serif text-lg text-cream">{node.name}</h3>
      <p className="mt-1 text-xs leading-5 text-white/38">{node.note}</p>
    </Link>
  );
}

export function DynastyPage() {
  return (
    <>
      <PageHeader eyebrow="Dom panujący" title="Dynastia de la Cruz" description="Genealogia rodzinna i sukcesja cesarska są prezentowane jako dwie niezależne struktury. Konstancja nie jest obecnie cesarzową." />

      <section className="surface overflow-hidden">
        <div className="border-b border-gold/15 bg-gradient-to-r from-imperial/20 via-transparent to-transparent p-6 md:p-8">
          <div className="flex items-center gap-3"><Crown className="h-5 w-5 text-gold" /><p className="eyebrow">Linia cesarska</p></div>
          <h2 className="mt-3 font-serif text-2xl">Sukcesja główna</h2>
          <p className="mt-2 text-sm text-white/42">Następstwo tronu — niezależnie od relacji rodzic–dziecko.</p>
        </div>
        <div className="overflow-x-auto p-6 md:p-8">
          <div className="flex min-w-[820px] items-stretch">
            {succession.map(([name, slug, note], index) => (
              <div key={slug} className="flex flex-1 items-center">
                <Link to={`/postacie/${slug}`} className={`group flex min-h-40 flex-1 flex-col justify-between rounded-xl border p-4 transition hover:-translate-y-1 hover:border-gold/50 ${index === succession.length - 1 ? "border-gold/45 bg-gold/[0.09]" : "border-white/10 bg-white/[0.025]"}`}>
                  <div className="flex items-center justify-between"><span className="text-xs text-gold/70">{String(index + 1).padStart(2, "0")}</span>{index === succession.length - 1 && <Crown className="h-4 w-4 text-gold" />}</div>
                  <div><h3 className="font-serif text-lg text-cream">{name}</h3><p className="mt-1 text-xs leading-5 text-white/35">{note}</p></div>
                </Link>
                {index < succession.length - 1 && <GitBranch className="mx-2 h-4 w-4 shrink-0 rotate-90 text-gold/35" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="surface mt-6 overflow-hidden">
        <div className="border-b border-gold/15 p-6 md:p-8">
          <div className="flex items-center gap-3"><Network className="h-5 w-5 text-gold" /><p className="eyebrow">Więzy krwi</p></div>
          <h2 className="mt-3 font-serif text-2xl">Drzewo genealogiczne</h2>
          <p className="mt-2 text-sm text-white/42">Każdy wiersz oznacza jedno pokolenie. Oznaczenie bliźniąt nie wpływa na sukcesję.</p>
        </div>
        <div className="mx-auto max-w-3xl p-6 md:p-8">
          {generations.map((generation, index) => (
            <div key={generation.label}>
              {index > 0 && <div className="mx-auto h-8 w-px bg-gradient-to-b from-gold/15 to-gold/45" aria-hidden="true" />}
              <div>
                <p className="mb-2 text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-gold/55">{generation.label}</p>
                <div className={`mx-auto flex gap-3 ${generation.nodes.length === 1 ? "max-w-sm" : "max-w-2xl"}`}>
                  {generation.nodes.map((node) => <FamilyCard key={node.slug} node={node} />)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Link to="/postacie/octavian-syn-teodozjusza-ii" className="surface-muted p-6 transition hover:border-gold/35"><p className="eyebrow">Niedoszły następca</p><h2 className="mt-2 font-serif text-xl">Octavian, syn Teodozjusza II</h2><p className="mt-2 text-sm leading-6 text-white/42">Zmarł w wieku 30 lat, przed Teodozjuszem II. Nigdy nie został cesarzem.</p></Link>
        <Link to="/postacie/konstancja-de-la-cruz" className="surface-muted p-6 transition hover:border-gold/35"><div className="flex items-center gap-2"><UsersRound className="h-4 w-4 text-gold" /><p className="eyebrow">Obecne pokolenie</p></div><h2 className="mt-2 font-serif text-xl">Konstancja de la Cruz</h2><p className="mt-2 text-sm leading-6 text-white/42">Córka Ignaciusa, obecnie 19-letnia. Nie jest cesarzową.</p></Link>
      </div>
    </>
  );
}
