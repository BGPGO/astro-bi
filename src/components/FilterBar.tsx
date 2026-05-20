import { useSQL } from "@/lib/useQuery";
import { useFilters } from "@/state/filters";
import { MultiSelect, SegmentedControl } from "./MultiSelect";
import { X } from "lucide-react";

export function FilterBar() {
  const { f, setF, reset, hasActive } = useFilters();

  const anoMes = useSQL<{ am: string }>(
    `SELECT DISTINCT strftime(data_pedido, '%Y-%m') AS am FROM vendas ORDER BY am DESC`
  );
  const marcas = useSQL<{ v: string }>(
    `SELECT DISTINCT marca AS v FROM vendas WHERE marca IS NOT NULL ORDER BY v`
  );
  const cats = useSQL<{ v: string }>(
    `SELECT DISTINCT categoria_mae AS v FROM vendas WHERE categoria_mae IS NOT NULL ORDER BY v`
  );
  const transps = useSQL<{ v: string }>(
    `SELECT DISTINCT nome_transportador AS v FROM vendas WHERE nome_transportador IS NOT NULL ORDER BY v`
  );

  return (
    <div className="sticky top-[57px] z-40 bg-bg/90 backdrop-blur border-b border-ink-DEFAULT">
      <div className="max-w-[1600px] mx-auto px-6 py-3 flex flex-wrap items-end gap-3">
        <MultiSelect
          label="Ano-Mês"
          options={anoMes.data?.map((r) => r.am) ?? []}
          value={f.anoMes}
          onChange={(v) => setF({ anoMes: v })}
          placeholder="Todos"
        />
        <SegmentedControl<"all" | "util" | "fds">
          label="Dia"
          value={f.diaUtil}
          options={[
            { value: "all", label: "Todos" },
            { value: "util", label: "Útil" },
            { value: "fds", label: "FDS" },
          ]}
          onChange={(v) => setF({ diaUtil: v })}
        />
        <MultiSelect
          label="Marca"
          options={marcas.data?.map((r) => r.v) ?? []}
          value={f.marca}
          onChange={(v) => setF({ marca: v })}
          width="min-w-[180px]"
        />
        <MultiSelect
          label="Categoria"
          options={cats.data?.map((r) => r.v) ?? []}
          value={f.categoria}
          onChange={(v) => setF({ categoria: v })}
          width="min-w-[180px]"
        />
        <MultiSelect
          label="Transportadora"
          options={transps.data?.map((r) => r.v) ?? []}
          value={f.transportadora}
          onChange={(v) => setF({ transportadora: v })}
          width="min-w-[200px]"
        />
        <MultiSelect
          label="Recomprador"
          options={["Recompra", "Novo"]}
          value={f.recomprador}
          onChange={(v) => setF({ recomprador: v as ("Recompra" | "Novo")[] })}
          width="min-w-[150px]"
        />
        <div className="flex-1" />
        {hasActive && (
          <button
            onClick={reset}
            className="text-xs text-muted hover:text-white px-3 py-1.5 rounded-md border border-ink-DEFAULT hover:border-rose flex items-center gap-1 transition-colors"
          >
            <X className="w-3.5 h-3.5" /> Limpar filtros
          </button>
        )}
        {(f.xfUf || f.xfPgto) && (
          <div className="text-xs flex items-center gap-2 px-2 py-1 bg-accent/10 border border-accent/30 rounded-md">
            <span className="text-muted">cross:</span>
            {f.xfUf && <span className="text-accent font-medium">{f.xfUf}</span>}
            {f.xfPgto && <span className="text-accent font-medium">{f.xfPgto}</span>}
            <button
              onClick={() => setF({ xfUf: null, xfPgto: null })}
              className="text-muted hover:text-white"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
