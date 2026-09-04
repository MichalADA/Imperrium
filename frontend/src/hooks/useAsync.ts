import { useCallback, useEffect, useState } from "react";

export function useAsync<T>(loader: () => Promise<T>, dependencies: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(() => {
    setLoading(true);
    setError(null);
    loader()
      .then(setData)
      .catch((caught: unknown) => setError(caught instanceof Error ? caught.message : "Nieznany błąd."))
      .finally(() => setLoading(false));
  }, dependencies);

  useEffect(reload, [reload]);
  return { data, loading, error, reload };
}
