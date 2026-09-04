import { Search } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { api } from "../api/client";
import { EntryCard } from "../components/EntryCard";
import { PageHeader } from "../components/PageHeader";
import { EmptyBlock, ErrorBlock, LoadingBlock } from "../components/StateBlock";
import { useAsync } from "../hooks/useAsync";

export function SearchPage() {
  const [params] = useSearchParams();
  const query = params.get("q")?.trim() || "";
  const { data, loading, error, reload } = useAsync(() => query.length >= 2 ? api.search(query) : Promise.resolve({ query, results: [] }), [query]);
  return (
    <>
      <PageHeader eyebrow="Wyszukiwarka globalna" title={query ? `Wyniki dla: „${query}”` : "Przeszukaj archiwum"} description="Wyniki obejmują tytuły, pseudonimy, aliasy, treść, języki, prowincje i rody." />
      {loading && <LoadingBlock label="Przeszukiwanie indeksu…" />}
      {error && <ErrorBlock message={error} onRetry={reload} />}
      {data && !data.results.length && <EmptyBlock label={query ? "Nie znaleziono pasujących wpisów." : "Wpisz co najmniej dwa znaki w wyszukiwarce u góry."} />}
      {data && data.results.length > 0 && <><p className="mb-4 flex items-center gap-2 text-sm text-white/40"><Search className="h-4 w-4 text-gold" /> Znaleziono: {data.results.length}</p><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{data.results.map((entry) => <EntryCard key={entry.id} entry={entry} />)}</div></>}
    </>
  );
}

