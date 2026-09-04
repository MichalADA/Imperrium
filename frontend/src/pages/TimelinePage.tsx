import { Clock3 } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../api/client";
import { PageHeader } from "../components/PageHeader";
import { ErrorBlock, LoadingBlock } from "../components/StateBlock";
import { useAsync } from "../hooks/useAsync";
import { entryPath } from "../lib/entry";

const filters = [
  ["", "Wszystko"], ["wojny", "Wojny"], ["polityka", "Polityka"], ["dynastia", "Dynastia"],
  ["technologia", "Technologia"], ["firmy", "Firmy"], ["katastrofy", "Katastrofy"], ["społeczne", "Społeczne"],
];

export function TimelinePage() {
  const [params] = useSearchParams();
  const category = params.get("kategoria") || "";
  const { data, loading, error, reload } = useAsync(() => api.timeline(category), [category]);
  return (
    <>
      <PageHeader eyebrow="Archiwum historyczne" title="Chronologia Imperium" description="Oś wydarzeń od przybycia ludzi z Ziemi po obecną dynastię de la Cruz. Dokładne daty pojawiają się wyłącznie tam, gdzie zostały ustalone w kanonie." />
      <div className="mb-8 flex flex-wrap gap-2">
        {filters.map(([value, label]) => <Link key={value} to={value ? `/chronologia?kategoria=${value}` : "/chronologia"} className={category === value ? "button-primary !min-h-9 !px-3 !py-1.5" : "button-secondary !min-h-9 !px-3 !py-1.5"}>{label}</Link>)}
      </div>
      {loading && <LoadingBlock />}
      {error && <ErrorBlock message={error} onRetry={reload} />}
      {data && (
        <div className="relative ml-3 border-l border-gold/25 pl-7 md:ml-8 md:pl-10">
          {data.events.map((event) => {
            const year = event.infobox.rok;
            const label = typeof year === "number" && year >= 0 ? `Rok ${year}` : String(year || event.infobox.epoka || "Data nieustalona");
            return (
              <Link key={event.id} to={entryPath(event.type, event.slug)} className="group relative mb-5 block surface-muted p-5 transition hover:border-gold/35 md:p-6">
                <span className="absolute -left-[35px] top-7 grid h-4 w-4 place-items-center rounded-full border border-gold/60 bg-ink md:-left-[49px]"><span className="h-1.5 w-1.5 rounded-full bg-gold" /></span>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div><p className="eyebrow">{label}</p><h2 className="mt-2 font-serif text-xl text-cream group-hover:text-[#f3dfb3]">{event.title}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-white/45">{event.summary}</p></div>
                  <Clock3 className="h-4 w-4 shrink-0 text-gold/45" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
