import { useEffect, useState } from "react";
import { ensureVendasLoaded, query } from "./duckdb";

interface DBState {
  ready: boolean;
  error: string | null;
  bootMs: number | null;
  rowCount: number | null;
}

export function useDuckDB(): DBState {
  const [state, setState] = useState<DBState>({
    ready: false,
    error: null,
    bootMs: null,
    rowCount: null,
  });

  useEffect(() => {
    let cancelled = false;
    const t0 = performance.now();
    (async () => {
      try {
        await ensureVendasLoaded();
        const rows = await query<{ c: number }>("SELECT COUNT(*)::INT AS c FROM vendas");
        const n = rows[0]?.c ?? 0;
        if (cancelled) return;
        setState({
          ready: true,
          error: null,
          bootMs: Math.round(performance.now() - t0),
          rowCount: n,
        });
      } catch (e) {
        if (cancelled) return;
        setState({
          ready: false,
          error: String(e),
          bootMs: Math.round(performance.now() - t0),
          rowCount: null,
        });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
