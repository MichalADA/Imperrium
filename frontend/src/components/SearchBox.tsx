import { Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { entryPath, entryTypeLabels } from "../lib/entry";
import type { EntryCard } from "../types";

export function SearchBox() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<EntryCard[]>([]);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (!box.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    const timer = window.setTimeout(() => {
      api.search(query).then((data) => {
        setResults(data.results.slice(0, 7));
        setOpen(true);
      }).catch(() => setResults([]));
    }, 220);
    return () => window.clearTimeout(timer);
  }, [query]);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (query.trim().length >= 2) {
      navigate(`/szukaj?q=${encodeURIComponent(query.trim())}`);
      setOpen(false);
    }
  };

  return (
    <div ref={box} className="relative w-full max-w-2xl">
      <form onSubmit={submit} role="search">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gold/70" />
        <input
          className="h-11 w-full rounded-xl border border-white/10 bg-black/30 pl-10 pr-10 text-sm text-cream outline-none transition placeholder:text-white/30 focus:border-gold/40 focus:bg-black/45 focus:ring-2 focus:ring-gold/10"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => query.length >= 2 && setOpen(true)}
          placeholder="Szukaj postaci, prowincji, rodów, aliasów…"
          aria-label="Globalna wyszukiwarka"
        />
        {query && (
          <button type="button" onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-white/30 hover:text-cream" aria-label="Wyczyść wyszukiwanie">
            <X className="h-4 w-4" />
          </button>
        )}
      </form>
      {open && query.length >= 2 && (
        <div className="surface absolute inset-x-0 top-[calc(100%+8px)] z-50 overflow-hidden p-2">
          {results.length ? results.map((entry) => (
            <Link key={entry.id} to={entryPath(entry.type, entry.slug)} onClick={() => setOpen(false)} className="flex items-center justify-between gap-3 rounded-lg px-3 py-3 hover:bg-gold/[0.08]">
              <span className="min-w-0">
                <span className="block truncate text-sm text-cream">{entry.title}</span>
                <span className="block text-xs text-white/35">{entryTypeLabels[entry.type]}</span>
              </span>
              <span className="shrink-0 text-xs text-gold/70">Otwórz</span>
            </Link>
          )) : <p className="px-3 py-5 text-center text-sm text-white/40">Brak wyników</p>}
          <button onClick={() => { navigate(`/szukaj?q=${encodeURIComponent(query.trim())}`); setOpen(false); }} className="mt-1 w-full border-t border-white/[0.06] px-3 pt-3 text-left text-xs font-semibold uppercase tracking-wider text-gold/80">
            Pokaż wszystkie wyniki
          </button>
        </div>
      )}
    </div>
  );
}

