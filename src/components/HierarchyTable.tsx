import { useState } from "react";
import { useSQL } from "@/lib/useQuery";
import { useFilters } from "@/state/filters";
import { Card } from "./Card";
import { fmtBRL, fmtNum, fmtPct, cls } from "@/lib/fmt";
import { ChevronRight } from "lucide-react";

interface Row {
  k: string;          // chave do nivel atual (marca / cat_mae / sub / seo)
  venda: number;
  cmv: number;
  resultado: number;
  margem: number;
  vendas_n: number;
  pct_pai?: number;
}

export function HierarchyTable({
  title,
  levels,
  topN = 15,
}: {
  title: string;
  levels: string[]; // ex: ["marca", "categoria_mae", "sub_categoria", "seo_title"]
  topN?: number;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-baseline justify-between mb-3">
        <h4 className="text-sm font-semibold text-white">{title}</h4>
        <span className="text-[10px] text-muted mono">top {topN}</span>
      </div>
      <div className="grid grid-cols-[1fr_110px_90px_110px_70px_70px] gap-x-3 gap-y-0 text-[11px] uppercase text-muted font-medium border-b border-ink-DEFAULT pb-2 mb-1">
        <div>{levels[0].replace(/_/g, " ")}</div>
        <div className="text-right">Bruto</div>
        <div className="text-right">% Total</div>
        <div className="text-right">Result</div>
        <div className="text-right">Margem</div>
        <div className="text-right">Vendas</div>
      </div>
      <Level levels={levels} parentPath={[]} topN={topN} depth={0} />
    </Card>
  );
}

function Level({
  levels,
  parentPath,
  topN,
  depth,
}: {
  levels: string[];
  parentPath: { col: string; val: string }[];
  topN: number;
  depth: number;
}) {
  const { whereSQL } = useFilters();
  const col = levels[depth];

  const extraWhere = parentPath.map((p) => `${p.col} = '${p.val.replace(/'/g, "''")}'`).join(" AND ");
  const fullWhere = extraWhere ? `(${whereSQL}) AND ${extraWhere}` : whereSQL;

  const sql = `
    WITH base AS (
      SELECT ${col} AS k,
             SUM(valor_rateado)::DOUBLE AS venda,
             SUM(preco_custo * quantidade)::DOUBLE AS cmv,
             COUNT(DISTINCT numero)::INT AS vendas_n
      FROM vendas WHERE ${fullWhere} AND ${col} IS NOT NULL
      GROUP BY k
    ),
    total AS (SELECT SUM(venda) AS t FROM base)
    SELECT k, venda, cmv, vendas_n,
           venda - cmv AS resultado,
           CASE WHEN venda > 0 THEN (venda - cmv)/venda ELSE 0 END AS margem,
           CASE WHEN (SELECT t FROM total) > 0 THEN venda/(SELECT t FROM total) ELSE 0 END AS pct_pai
    FROM base ORDER BY venda DESC LIMIT ${topN}
  `;
  const { data, loading } = useSQL<Row>(sql);
  const hasChildren = depth < levels.length - 1;

  if (loading) {
    return <div className="py-3 text-center text-xs text-muted">carregando...</div>;
  }
  if (!data?.length) {
    return <div className="py-3 text-center text-xs text-muted">sem dados</div>;
  }

  return (
    <div>
      {data.map((r) => (
        <RowItem key={r.k} row={r} levels={levels} parentPath={parentPath} depth={depth} hasChildren={hasChildren} topN={topN} />
      ))}
    </div>
  );
}

function RowItem({
  row,
  levels,
  parentPath,
  depth,
  hasChildren,
  topN,
}: {
  row: Row;
  levels: string[];
  parentPath: { col: string; val: string }[];
  depth: number;
  hasChildren: boolean;
  topN: number;
}) {
  const [open, setOpen] = useState(false);
  const pad = 12 * depth;
  return (
    <>
      <button
        onClick={() => hasChildren && setOpen((v) => !v)}
        className={cls(
          "grid grid-cols-[1fr_110px_90px_110px_70px_70px] gap-x-3 items-center w-full text-left text-[13px] py-1.5 px-1 -mx-1 rounded transition-colors num",
          hasChildren ? "hover:bg-bg-elev cursor-pointer" : "cursor-default",
          depth === 0 ? "text-white font-medium" : "text-slate-300",
          open && "bg-bg-elev"
        )}
        style={{ paddingLeft: pad }}
      >
        <span className="flex items-center gap-1.5 truncate">
          {hasChildren ? (
            <ChevronRight className={cls("w-3.5 h-3.5 text-muted flex-none transition-transform", open && "rotate-90")} />
          ) : (
            <span className="w-3.5" />
          )}
          <span className="truncate">{row.k}</span>
        </span>
        <span className="text-right tabular-nums">{fmtBRL(row.venda)}</span>
        <span className="text-right text-muted">{fmtPct(row.pct_pai)}</span>
        <span className="text-right tabular-nums">{fmtBRL(row.resultado)}</span>
        <span className={cls("text-right", row.margem >= 0.3 ? "text-accent-green" : row.margem >= 0 ? "text-slate-400" : "text-accent-rose")}>{fmtPct(row.margem)}</span>
        <span className="text-right text-muted">{fmtNum(row.vendas_n)}</span>
      </button>
      {open && hasChildren && (
        <div className="border-l border-ink-DEFAULT ml-3">
          <Level
            levels={levels}
            parentPath={[...parentPath, { col: levels[depth], val: row.k }]}
            topN={topN}
            depth={depth + 1}
          />
        </div>
      )}
    </>
  );
}
