import { createContext, useContext, useState, useMemo, ReactNode } from "react";

export interface Filters {
  anoMes: string[];           // ["2026-05", "2026-04", ...]
  diaUtil: "all" | "util" | "fds";
  marca: string[];
  categoria: string[];
  transportadora: string[];
  recomprador: ("Recompra" | "Novo")[];
  // Cross-filter por clique
  xfUf: string | null;
  xfPgto: string | null;
}

const DEFAULT: Filters = {
  anoMes: [],
  diaUtil: "all",
  marca: [],
  categoria: [],
  transportadora: [],
  recomprador: [],
  xfUf: null,
  xfPgto: null,
};

interface Ctx {
  f: Filters;
  setF: (patch: Partial<Filters>) => void;
  reset: () => void;
  whereSQL: string;
  hasActive: boolean;
}

const FiltersCtx = createContext<Ctx | null>(null);

function sqlList(arr: string[]): string {
  return arr.map((s) => `'${s.replace(/'/g, "''")}'`).join(",");
}

export function FiltersProvider({ children, initial }: { children: ReactNode; initial?: Partial<Filters> }) {
  const [f, setFState] = useState<Filters>({ ...DEFAULT, ...initial });

  const setF = (patch: Partial<Filters>) => setFState((prev) => ({ ...prev, ...patch }));
  const reset = () => setFState(DEFAULT);

  const whereSQL = useMemo(() => {
    const parts: string[] = [];
    if (f.anoMes.length) {
      parts.push(`strftime(data_pedido, '%Y-%m') IN (${sqlList(f.anoMes)})`);
    }
    if (f.diaUtil === "util") parts.push(`dayofweek(data_pedido) BETWEEN 1 AND 5`);
    if (f.diaUtil === "fds") parts.push(`dayofweek(data_pedido) IN (0, 6)`);
    if (f.marca.length) parts.push(`marca IN (${sqlList(f.marca)})`);
    if (f.categoria.length) parts.push(`categoria_mae IN (${sqlList(f.categoria)})`);
    if (f.transportadora.length) parts.push(`nome_transportador IN (${sqlList(f.transportadora)})`);
    if (f.recomprador.length) {
      if (f.recomprador.includes("Recompra") && !f.recomprador.includes("Novo")) {
        parts.push(`Recompra = 'Recompra'`);
      } else if (f.recomprador.includes("Novo") && !f.recomprador.includes("Recompra")) {
        parts.push(`(Recompra IS NULL OR Recompra <> 'Recompra')`);
      }
    }
    if (f.xfUf) parts.push(`cliente_uf = '${f.xfUf.replace(/'/g, "''")}'`);
    if (f.xfPgto) parts.push(`forma_pagamento = '${f.xfPgto.replace(/'/g, "''")}'`);
    return parts.length ? parts.join(" AND ") : "1=1";
  }, [f]);

  const hasActive = useMemo(() => {
    return (
      f.anoMes.length > 0 ||
      f.diaUtil !== "all" ||
      f.marca.length > 0 ||
      f.categoria.length > 0 ||
      f.transportadora.length > 0 ||
      f.recomprador.length > 0 ||
      !!f.xfUf ||
      !!f.xfPgto
    );
  }, [f]);

  return (
    <FiltersCtx.Provider value={{ f, setF, reset, whereSQL, hasActive }}>
      {children}
    </FiltersCtx.Provider>
  );
}

export function useFilters(): Ctx {
  const ctx = useContext(FiltersCtx);
  if (!ctx) throw new Error("useFilters must be inside FiltersProvider");
  return ctx;
}
