import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import { EntryCard } from "../components/EntryCard";
import { PageHeader } from "../components/PageHeader";
import { EmptyBlock, ErrorBlock, LoadingBlock } from "../components/StateBlock";
import { useAsync } from "../hooks/useAsync";
import type { EntryType } from "../types";

export function CatalogPage({ type, title, eyebrow, description }: { type: EntryType; title: string; eyebrow: string; description: string }) {
  const { data, loading, error, reload } = useAsync(() => api.list(type), [type]);
  return (
    <>
      <PageHeader eyebrow={eyebrow} title={title} description={description} action={<Link to={`/admin/nowy?type=${type}`} className="button-secondary"><Plus className="h-4 w-4" /> Dodaj wpis</Link>} />
      {loading && <LoadingBlock />}
      {error && <ErrorBlock message={error} onRetry={reload} />}
      {data && !data.items.length && <EmptyBlock />}
      {data && data.items.length > 0 && (
        <>
          <div className="mb-4 flex items-center justify-between text-xs uppercase tracking-wider text-white/30"><span>{data.total} wpisów</span><span>Porządek alfabetyczny</span></div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{data.items.map((entry) => <EntryCard key={entry.id} entry={entry} />)}</div>
        </>
      )}
    </>
  );
}

