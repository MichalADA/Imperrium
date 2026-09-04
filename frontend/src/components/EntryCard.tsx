import { ArrowUpRight, UserRound } from "lucide-react";
import { Link } from "react-router-dom";
import { entryPath, entryTypeLabels, initials, mediaUrl } from "../lib/entry";
import type { EntryCard as EntryCardType } from "../types";

export function EntryCard({ entry, compact = false }: { entry: EntryCardType; compact?: boolean }) {
  const firstInfo = Object.entries(entry.infobox).find(([, value]) => value && value !== "Brak danych");
  const image = mediaUrl(entry.imagePath);
  const showPortrait = entry.type === "CHARACTER";
  return (
    <Link
      to={entryPath(entry.type, entry.slug)}
      className={`group surface-muted block transition hover:-translate-y-0.5 hover:border-gold/35 hover:bg-gold/[0.045] ${compact ? "p-4" : "p-5"}`}
    >
      <div className="flex items-start justify-between gap-4">
        <span className="eyebrow !text-[11px] !tracking-[0.18em]">{entryTypeLabels[entry.type]}</span>
        <ArrowUpRight className="h-4 w-4 shrink-0 text-white/20 transition group-hover:text-gold" />
      </div>
      <div className={`${compact ? "mt-2" : "mt-3"} flex items-center gap-3`}>
        {showPortrait && (
          <div className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-full border border-gold/20 bg-gradient-to-br from-imperial/20 to-white/[0.03] text-xs font-semibold tracking-wider text-gold/65">
            {image ? <img src={image} alt="" className="h-full w-full object-cover" /> : <><UserRound className="h-4 w-4 opacity-45" /><span className="sr-only">{initials(entry.title)}</span></>}
          </div>
        )}
        <h3 className={`${compact ? "text-base" : "text-lg"} font-serif font-medium text-cream group-hover:text-[#f6e8c9]`}>{entry.title}</h3>
      </div>
      {!compact && <p className="mt-2 line-clamp-3 text-sm leading-6 text-white/48">{entry.summary}</p>}
      {firstInfo && (
        <p className="mt-4 border-t border-white/[0.06] pt-3 text-xs text-white/35">
          <span className="text-white/55">{firstInfo[0].replaceAll("_", " ")}:</span> {String(firstInfo[1])}
        </p>
      )}
    </Link>
  );
}
