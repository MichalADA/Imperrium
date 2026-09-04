import { UserRound } from "lucide-react";
import { initials, mediaUrl } from "../lib/entry";

type InfoboxProps = {
  title: string;
  data: Record<string, string | number | boolean | null>;
  imagePath?: string | null;
  showPortrait?: boolean;
};

export function Infobox({ title, data, imagePath, showPortrait = false }: InfoboxProps) {
  const rows = Object.entries(data);
  const image = mediaUrl(imagePath);
  return (
    <aside className="surface overflow-hidden lg:sticky lg:top-24">
      {showPortrait && (
        <div className="relative aspect-[3/4] overflow-hidden border-b border-gold/15 bg-gradient-to-br from-imperial/20 via-[#17191d] to-black">
          {image ? (
            <img src={image} alt={`Portret: ${title}`} className="h-full w-full object-cover object-top" />
          ) : (
            <div className="flex h-full flex-col items-center justify-center text-gold/55" aria-label={`Brak zdjęcia postaci ${title}`}>
              <UserRound className="h-14 w-14 opacity-45" aria-hidden="true" />
              <span className="mt-3 font-serif text-2xl tracking-[0.18em]">{initials(title)}</span>
            </div>
          )}
        </div>
      )}
      <div className="border-b border-gold/15 bg-gradient-to-r from-imperial/25 to-transparent px-5 py-4">
        <p className="text-xs uppercase tracking-[0.2em] text-gold/70">Archiwalny infobox</p>
        <h2 className="mt-1 font-serif text-xl text-cream">{title}</h2>
      </div>
      <dl className="divide-y divide-white/[0.055] p-2">
        {rows.map(([key, value]) => (
          <div key={key} className="grid gap-1 px-3 py-3 sm:grid-cols-[minmax(100px,0.75fr)_1.25fr] lg:block xl:grid">
            <dt className="text-xs font-semibold uppercase tracking-wide text-white/35">{key.replaceAll("_", " ")}</dt>
            <dd className="text-sm leading-5 text-cream/80">{value === null || value === "" ? "Brak danych" : String(value)}</dd>
          </div>
        ))}
        {!rows.length && <div className="p-4 text-sm text-white/40">Brak danych</div>}
      </dl>
    </aside>
  );
}
