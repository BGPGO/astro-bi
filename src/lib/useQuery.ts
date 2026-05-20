import { useEffect, useState } from "react";
import { query } from "./duckdb";

interface QueryState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

/**
 * Hook: roda SQL e retorna array de linhas. Re-executa quando `sql` ou `enabled` muda.
 */
export function useSQL<T = Record<string, unknown>>(sql: string, enabled = true): QueryState<T[]> {
  const [state, setState] = useState<QueryState<T[]>>({
    data: null,
    loading: enabled,
    error: null,
  });

  useEffect(() => {
    if (!enabled) {
      setState({ data: null, loading: false, error: null });
      return;
    }
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: null }));
    query<T>(sql)
      .then((rows) => {
        if (cancelled) return;
        setState({ data: rows, loading: false, error: null });
      })
      .catch((err) => {
        if (cancelled) return;
        setState({ data: null, loading: false, error: String(err) });
      });
    return () => {
      cancelled = true;
    };
  }, [sql, enabled]);

  return state;
}
