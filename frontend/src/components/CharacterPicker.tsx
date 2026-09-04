import { Search, X } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { api } from "../api/client";

export type CharacterOption = { slug: string; title: string };

type Props = {
  label: string;
  value: CharacterOption[];
  onChange: (value: CharacterOption[]) => void;
  token: string;
  multiple?: boolean;
  excludeSlug?: string;
};

export function CharacterPicker({ label, value, onChange, token, multiple = false, excludeSlug }: Props) {
  const id = useId();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CharacterOption[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (query.trim().length < 2) { setResults([]); return; }
    const timer = window.setTimeout(() => {
      api.findCharacters(query, token).then(({ items }) => {
        setResults(items.filter((item) => item.slug !== excludeSlug && !value.some((selected) => selected.slug === item.slug)).map((item) => ({ slug: item.slug, title: item.displayName })));
        setOpen(true);
      }).catch(() => setResults([]));
    }, 180);
    return () => window.clearTimeout(timer);
  }, [query, token, excludeSlug, value]);

  const select = (option: CharacterOption) => {
    onChange(multiple ? [...value, option] : [option]);
    setQuery("");
    setOpen(false);
  };

  return (
    <div className="block">
      <label htmlFor={id} className="mb-2 block text-sm text-white/60">{label}</label>
      {value.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {value.map((option) => (
            <span key={option.slug} className="inline-flex items-center gap-2 rounded-full border border-gold/20 bg-gold/[0.07] px-3 py-1.5 text-sm text-cream">
              {option.title}
              <button type="button" aria-label={`Usuń ${option.title}`} onClick={() => onChange(value.filter((item) => item.slug !== option.slug))} className="text-white/40 hover:text-white"><X className="h-3.5 w-3.5" /></button>
            </span>
          ))}
        </div>
      )}
      {(!value.length || multiple) && (
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-white/30" />
          <input id={id} className="field !pl-10" value={query} onChange={(event) => setQuery(event.target.value)} onFocus={() => setOpen(true)} autoComplete="off" placeholder="Wpisz co najmniej 2 znaki…" role="combobox" aria-expanded={open && results.length > 0} />
          {open && results.length > 0 && (
            <div className="absolute z-30 mt-1 max-h-56 w-full overflow-auto rounded-lg border border-gold/20 bg-[#171411] p-1 shadow-2xl">
              {results.map((option) => <button key={option.slug} type="button" onClick={() => select(option)} className="block w-full rounded-md px-3 py-2 text-left text-sm text-cream hover:bg-gold/10">{option.title}</button>)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
