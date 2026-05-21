/**
 * Dash — tela principal do Astro BI, port do astro-bi-spa.
 *
 * Mesmas queries SQL, mesmo conteúdo (KPIs + 6 gráficos + 2 tabelas
 * hierárquicas + 3 barras horizontais), visual NOVO usando componentes Bi*
 * do molde Fin50 (dentro de `.bi-dashboard-theme`).
 */
import { useMemo, useState } from "react";
import { useDuckDB } from "@/lib/useDuckDB";
import { useSQL } from "@/lib/useQuery";
import { FiltersProvider, useFilters } from "@/state/filters";
import {
  BiCard,
  BiKpiCard,
  BiKpiGroup,
  BiMetricStrip,
  BiBarChart,
  BiLineChart,
  BiPieChart,
  BiBarList,
  BiSectionHeading,
  BiSlicer,
} from "@/components/bi";
import { fmtBRL, fmtBRLk, fmtNum, fmtPct } from "@/lib/fmt";
import ChevronRight from "lucide-react/dist/esm/icons/chevron-right";
import Loader2 from "lucide-react/dist/esm/icons/loader-2";
import X from "lucide-react/dist/esm/icons/x";
import { cn } from "@/lib/utils";

const CFV_PCT_ESTIMADO = 0.0616;

// ─────────────────────────────────────────────────────────────────────────────
// Root
// ─────────────────────────────────────────────────────────────────────────────
export function Dash() {
  const { ready, error, bootMs, rowCount } = useDuckDB();

  if (!ready) {
    return (
      <div className="min-h-screen grid place-items-center">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin mx-auto" style={{ color: "var(--cyan)" }} />
          <div className="text-sm" style={{ color: "var(--mute)" }}>
            {error ? (
              <span style={{ color: "var(--red)" }}>erro: {error}</span>
            ) : (
              <>Inicializando DuckDB-WASM + carregando parquet (3.8MB)...</>
            )}
          </div>
          {bootMs != null && (
            <div className="text-[11px]" style={{ color: "var(--mute)", fontFamily: "var(--font-mono)" }}>
              {bootMs}ms
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <FiltersProvider>
      <DashInner bootMs={bootMs} rowCount={rowCount} />
    </FiltersProvider>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Dash inner (precisa de FiltersProvider)
// ─────────────────────────────────────────────────────────────────────────────
function DashInner({ bootMs, rowCount }: { bootMs: number | null; rowCount: number | null }) {
  return (
    <div className="page" style={{ padding: "20px 28px 40px", minHeight: "100vh" }}>
      <DashHeader rowCount={rowCount} bootMs={bootMs} />
      <DashFilters />
      <KpisBlock />
      <ChartsTop />
      <ChartsMid />
      <HierarchyBlock />
      <BottomBarsBlock />
      <DashFooter rowCount={rowCount} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Header
// ─────────────────────────────────────────────────────────────────────────────
function DashHeader({ rowCount, bootMs }: { rowCount: number | null; bootMs: number | null }) {
  return (
    <header
      className="header"
      style={{
        height: "auto",
        minHeight: 70,
        paddingTop: 10,
        paddingBottom: 10,
        marginBottom: 16,
      }}
    >
      <div className="breadcrumb">
        <span>Astro BI</span>
        <ChevronRight />
        <b>Dashboard</b>
      </div>
      <div style={{ flex: 1 }} />
      <div
        style={{
          fontSize: 11,
          color: "var(--mute)",
          fontFamily: "var(--font-mono)",
          display: "flex",
          gap: 12,
        }}
      >
        {rowCount != null && <span>{rowCount.toLocaleString("pt-BR")} linhas</span>}
        {bootMs != null && <span>boot {bootMs}ms</span>}
      </div>
    </header>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Filtros (single-select por slicer, mapeado pra arrays do contexto)
// ─────────────────────────────────────────────────────────────────────────────
function DashFilters() {
  const { f, setF, reset, hasActive } = useFilters();

  const anoMes = useSQL<{ am: string }>(
    `SELECT DISTINCT strftime(data_pedido, '%Y-%m') AS am FROM vendas ORDER BY am DESC`,
  );
  const marcas = useSQL<{ v: string }>(
    `SELECT DISTINCT marca AS v FROM vendas WHERE marca IS NOT NULL ORDER BY v`,
  );
  const cats = useSQL<{ v: string }>(
    `SELECT DISTINCT categoria_mae AS v FROM vendas WHERE categoria_mae IS NOT NULL ORDER BY v`,
  );
  const transps = useSQL<{ v: string }>(
    `SELECT DISTINCT nome_transportador AS v FROM vendas WHERE nome_transportador IS NOT NULL ORDER BY v`,
  );

  const setSingle = (key: "anoMes" | "marca" | "categoria" | "transportadora", v: string) => {
    setF({ [key]: v === "__all__" ? [] : [v] } as any);
  };
  const setRecomprador = (v: string) => {
    if (v === "__all__") setF({ recomprador: [] });
    else if (v === "Recompra") setF({ recomprador: ["Recompra"] });
    else if (v === "Novo") setF({ recomprador: ["Novo"] });
  };

  const opt = (rows: { v?: string; am?: string }[] | null, key: "v" | "am") => {
    const arr = (rows ?? []).map((r) => r[key]).filter((x): x is string => !!x);
    return [{ value: "__all__", label: "Todos" }, ...arr.map((v) => ({ value: v, label: v }))];
  };

  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: 40,
        background: "color-mix(in oklab, var(--bg) 92%, transparent)",
        backdropFilter: "blur(10px)",
        borderBottom: "1px solid var(--border)",
        marginBottom: 16,
        padding: "12px 0",
        display: "flex",
        flexWrap: "wrap",
        gap: 12,
        alignItems: "flex-end",
      }}
    >
      <BiSlicer
        label="Ano-Mês"
        value={f.anoMes[0] ?? "__all__"}
        onChange={(v) => setSingle("anoMes", v)}
        options={opt(anoMes.data, "am")}
      />
      <BiSlicer
        label="Dia"
        value={f.diaUtil}
        onChange={(v) => setF({ diaUtil: v as "all" | "util" | "fds" })}
        options={[
          { value: "all", label: "Todos" },
          { value: "util", label: "Útil" },
          { value: "fds", label: "FDS" },
        ]}
      />
      <BiSlicer
        label="Marca"
        value={f.marca[0] ?? "__all__"}
        onChange={(v) => setSingle("marca", v)}
        options={opt(marcas.data, "v")}
      />
      <BiSlicer
        label="Categoria"
        value={f.categoria[0] ?? "__all__"}
        onChange={(v) => setSingle("categoria", v)}
        options={opt(cats.data, "v")}
      />
      <BiSlicer
        label="Transportadora"
        value={f.transportadora[0] ?? "__all__"}
        onChange={(v) => setSingle("transportadora", v)}
        options={opt(transps.data, "v")}
      />
      <BiSlicer
        label="Recomprador"
        value={f.recomprador[0] ?? "__all__"}
        onChange={setRecomprador}
        options={[
          { value: "__all__", label: "Todos" },
          { value: "Recompra", label: "Recompra" },
          { value: "Novo", label: "Novo" },
        ]}
      />

      <div style={{ flex: 1 }} />

      {(f.xfUf || f.xfPgto) && (
        <div
          style={{
            display: "flex",
            gap: 8,
            alignItems: "center",
            padding: "4px 10px",
            background: "rgba(34,211,238,0.08)",
            border: "1px solid rgba(34,211,238,0.25)",
            borderRadius: 8,
            fontSize: 12,
          }}
        >
          <span style={{ color: "var(--mute)" }}>cross:</span>
          {f.xfUf && <span style={{ color: "var(--cyan)", fontWeight: 600 }}>{f.xfUf}</span>}
          {f.xfPgto && <span style={{ color: "var(--cyan)", fontWeight: 600 }}>{f.xfPgto}</span>}
          <button
            type="button"
            onClick={() => setF({ xfUf: null, xfPgto: null })}
            style={{ color: "var(--mute)", display: "inline-flex" }}
            aria-label="Limpar cross"
          >
            <X size={12} />
          </button>
        </div>
      )}

      {hasActive && (
        <button
          type="button"
          onClick={reset}
          className="btn-ghost"
          style={{ fontSize: 12 }}
        >
          <X size={14} />
          <span>Limpar filtros</span>
        </button>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// KPIs (4 grandes + 6 menores)
// ─────────────────────────────────────────────────────────────────────────────
interface KpiRow {
  valor_bruto: number;
  cmv: number;
  n_vendas: number;
  valor_bruto_util: number;
  dias_uteis: number;
}

function KpisBlock() {
  const { whereSQL } = useFilters();
  const sql = `
    WITH base AS (
      SELECT
        valor_rateado,
        preco_custo * quantidade AS cmv_linha,
        numero,
        dayofweek(data_pedido) AS dow,
        data_pedido,
        CASE WHEN dayofweek(data_pedido) BETWEEN 1 AND 5 THEN 1 ELSE 0 END AS e_util
      FROM vendas WHERE ${whereSQL}
    )
    SELECT
      COALESCE(SUM(valor_rateado), 0)::DOUBLE AS valor_bruto,
      COALESCE(SUM(cmv_linha), 0)::DOUBLE AS cmv,
      COUNT(DISTINCT numero)::INT AS n_vendas,
      COALESCE(SUM(CASE WHEN e_util = 1 THEN valor_rateado ELSE 0 END), 0)::DOUBLE AS valor_bruto_util,
      COUNT(DISTINCT CASE WHEN e_util = 1 THEN data_pedido END)::INT AS dias_uteis
    FROM base
  `;
  const { data, loading } = useSQL<KpiRow>(sql);
  const r = data?.[0];

  const valor_bruto = r?.valor_bruto ?? 0;
  const cmv = r?.cmv ?? 0;
  const cfv = valor_bruto * CFV_PCT_ESTIMADO;
  const resultado_bruto = valor_bruto - cmv;
  const valor_liquido = valor_bruto - cfv - cmv;
  const n_vendas = r?.n_vendas ?? 0;
  const ticket = n_vendas ? valor_bruto / n_vendas : 0;
  const dias_uteis = r?.dias_uteis ?? 0;
  const venda_dia_util = dias_uteis ? (r?.valor_bruto_util ?? 0) / dias_uteis : 0;
  const margem_bruta_pct = valor_bruto ? resultado_bruto / valor_bruto : 0;
  const margem_liq_pct = valor_bruto ? valor_liquido / valor_bruto : 0;

  return (
    <div className={cn(loading && "opacity-60 transition-opacity")} style={{ display: "grid", gap: 16, marginBottom: 16 }}>
      <BiKpiGroup cols={4}>
        <BiKpiCard
          label="Valor Bruto"
          value={fmtBRLk(valor_bruto).replace("R$ ", "")}
          tone="cyan"
          hint="Σ valor_rateado"
        />
        <BiKpiCard
          label="Resultado Bruto"
          value={fmtBRLk(resultado_bruto).replace("R$ ", "")}
          tone="green"
          hint="bruto − CMV"
        />
        <BiKpiCard
          label="CMV"
          value={fmtBRLk(cmv).replace("R$ ", "")}
          tone="amber"
          hint="custo dos produtos · est"
        />
        <BiKpiCard
          label="Valor Líquido"
          value={fmtBRLk(valor_liquido).replace("R$ ", "")}
          tone="cyan"
          hint="bruto − CFV − CMV"
        />
      </BiKpiGroup>

      <BiMetricStrip
        items={[
          {
            label: "Total Vendas",
            value: fmtNum(n_vendas),
            pctText: `${dias_uteis} dias úteis`,
            barTone: "cyan",
            barFillPct: 100,
          },
          {
            label: "Venda/dia útil",
            value: fmtBRLk(venda_dia_util),
            pctText: "bruto útil ÷ dias",
            barTone: "green",
            barFillPct: 100,
          },
          {
            label: "Ticket Médio",
            value: fmtBRL(ticket),
            pctText: "bruto ÷ pedidos",
            barTone: "cyan",
            barFillPct: 100,
          },
          {
            label: "Margem Bruta %",
            value: fmtPct(margem_bruta_pct),
            pctText: "1 − CMV/Vendas",
            barTone: margem_bruta_pct >= 0.3 ? "green" : margem_bruta_pct >= 0 ? "amber" : "red",
            barFillPct: Math.min(Math.max(margem_bruta_pct * 100, 0), 100),
          },
          {
            label: "CFV %",
            value: fmtPct(CFV_PCT_ESTIMADO),
            pctText: "placeholder · est",
            barTone: "amber",
            barFillPct: CFV_PCT_ESTIMADO * 100,
          },
          {
            label: "Margem Líquida %",
            value: fmtPct(margem_liq_pct),
            pctText: "líquido ÷ bruto",
            barTone: margem_liq_pct >= 0.2 ? "green" : margem_liq_pct >= 0 ? "amber" : "red",
            barFillPct: Math.min(Math.max(margem_liq_pct * 100, 0), 100),
          },
        ]}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Charts top (Anual / Diária / N° vendas mensal)
// ─────────────────────────────────────────────────────────────────────────────
function ChartsTop() {
  return (
    <>
      <BiSectionHeading strong="Evolução da Venda Bruta" />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
          gap: 16,
          marginBottom: 16,
        }}
      >
        <BiCard title="Anual" hint="Vendas brutas por ano">
          <EvolucaoAnual />
        </BiCard>
        <BiCard title="Diária" hint="Últimos 60 dias">
          <EvolucaoDiaria />
        </BiCard>
        <BiCard title="N° Vendas mensal" hint="Últimos 18 meses">
          <NumeroVendasMensal />
        </BiCard>
      </div>
    </>
  );
}

function EvolucaoAnual() {
  const { whereSQL } = useFilters();
  const { data } = useSQL<{ ano: number; v: number }>(
    `SELECT EXTRACT(YEAR FROM data_pedido)::INT AS ano, SUM(valor_rateado)::DOUBLE AS v
     FROM vendas WHERE ${whereSQL}
     GROUP BY ano ORDER BY ano`,
  );
  const labels = (data ?? []).map((r) => String(r.ano));
  const values = (data ?? []).map((r) => r.v);
  if (!values.length) return <EmptyChart />;
  return <BiBarChart labels={labels} values={values} color="cyan" height={220} format={fmtBRLk} />;
}

function EvolucaoDiaria() {
  const { whereSQL } = useFilters();
  const { data } = useSQL<{ d: string; v: number }>(`
    WITH base AS (
      SELECT data_pedido::DATE AS d, SUM(valor_rateado)::DOUBLE AS v
      FROM vendas WHERE ${whereSQL}
      GROUP BY d
    )
    SELECT * FROM base ORDER BY d DESC LIMIT 60
  `);
  const sorted = useMemo(() => (data ?? []).slice().reverse(), [data]);
  const values = sorted.map((r) => r.v);
  const labels = sorted.map((r) => String(r.d).slice(5));
  if (!values.length) return <EmptyChart />;
  return (
    <BiLineChart
      values={values}
      labels={labels.filter((_, i) => i % 10 === 0 || i === labels.length - 1)}
      color="var(--cyan)"
      height={220}
      showPoints={false}
      showLabels={false}
      format={fmtBRLk}
    />
  );
}

function NumeroVendasMensal() {
  const { whereSQL } = useFilters();
  const { data } = useSQL<{ am: string; n: number }>(`
    WITH base AS (
      SELECT strftime(data_pedido, '%Y-%m') AS am, COUNT(DISTINCT numero)::INT AS n
      FROM vendas WHERE ${whereSQL}
      GROUP BY am
    )
    SELECT * FROM base ORDER BY am DESC LIMIT 18
  `);
  const sorted = useMemo(() => (data ?? []).slice().reverse(), [data]);
  const values = sorted.map((r) => r.n);
  const labels = sorted.map((r) => r.am.slice(2));
  if (!values.length) return <EmptyChart />;
  return (
    <BiLineChart
      values={values}
      labels={labels}
      color="var(--green)"
      height={220}
      showPoints
      showLabels={false}
      format={(v) => fmtNum(v)}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Charts mid (Donut PF/PJ / Mensal / Ticket diário)
// ─────────────────────────────────────────────────────────────────────────────
function ChartsMid() {
  return (
    <>
      <BiSectionHeading strong="Perfil de Vendas" />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
          gap: 16,
          marginBottom: 16,
        }}
      >
        <BiCard title="Tipo de comprador" hint="PF vs PJ">
          <DonutTipo />
        </BiCard>
        <BiCard title="Evolução Mensal" hint="Últimos 18 meses">
          <EvolucaoMensal />
        </BiCard>
        <BiCard title="Ticket Médio Diário" hint="Últimos 60 dias">
          <TicketDiario />
        </BiCard>
      </div>
    </>
  );
}

function DonutTipo() {
  const { whereSQL } = useFilters();
  const { data } = useSQL<{ tipo: string; v: number }>(`
    SELECT
      CASE WHEN cliente_tipo_pessoa = 'F' THEN 'Pessoa Física'
           WHEN cliente_tipo_pessoa = 'J' THEN 'Pessoa Jurídica'
           ELSE 'Outros' END AS tipo,
      SUM(valor_rateado)::DOUBLE AS v
    FROM vendas WHERE ${whereSQL}
    GROUP BY tipo
  `);
  const segments = (data ?? []).map((r, i) => ({
    name: r.tipo,
    value: r.v,
    color: ["var(--cyan)", "var(--violet)", "var(--amber)"][i % 3],
  }));
  const total = segments.reduce((s, x) => s + x.value, 0);
  const topName = segments.length
    ? segments.slice().sort((a, b) => b.value - a.value)[0].name
    : "—";
  if (!segments.length) return <EmptyChart />;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, padding: "8px 0" }}>
      <BiPieChart
        segments={segments}
        size={180}
        thickness={26}
        centerLabel="TOTAL"
        centerValue={fmtBRLk(total)}
      />
      <BiBarList
        variant="legend"
        items={segments.map((s) => ({ name: s.name, value: s.value, color: s.color }))}
        total={total}
        format="currency"
      />
      <div style={{ fontSize: 11, color: "var(--mute)", fontFamily: "var(--font-mono)" }}>
        Maior: <span style={{ color: "var(--text)" }}>{topName}</span>
      </div>
    </div>
  );
}

function EvolucaoMensal() {
  const { whereSQL } = useFilters();
  const { data } = useSQL<{ am: string; v: number }>(`
    WITH base AS (
      SELECT strftime(data_pedido, '%Y-%m') AS am, SUM(valor_rateado)::DOUBLE AS v
      FROM vendas WHERE ${whereSQL}
      GROUP BY am
    )
    SELECT * FROM base ORDER BY am DESC LIMIT 18
  `);
  const sorted = useMemo(() => (data ?? []).slice().reverse(), [data]);
  const values = sorted.map((r) => r.v);
  const labels = sorted.map((r) => r.am.slice(2));
  if (!values.length) return <EmptyChart />;
  return (
    <BiBarChart
      values={values}
      labels={labels}
      color="cyan"
      height={220}
      showValueChips={false}
      format={fmtBRLk}
    />
  );
}

function TicketDiario() {
  const { whereSQL } = useFilters();
  const { data } = useSQL<{ d: string; ticket: number }>(`
    WITH base AS (
      SELECT data_pedido::DATE AS d,
             SUM(valor_rateado) / NULLIF(COUNT(DISTINCT numero), 0) AS ticket
      FROM vendas WHERE ${whereSQL}
      GROUP BY d
    )
    SELECT * FROM (SELECT * FROM base ORDER BY d DESC LIMIT 60) ORDER BY d
  `);
  const values = (data ?? []).map((r) => r.ticket);
  const labels = (data ?? []).map((r) => String(r.d).slice(5));
  if (!values.length) return <EmptyChart />;
  return (
    <BiLineChart
      values={values}
      labels={labels.filter((_, i) => i % 10 === 0 || i === labels.length - 1)}
      color="var(--amber)"
      height={220}
      showPoints={false}
      showLabels={false}
      format={fmtBRLk}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Hierarchy tables (Marca > Cat > Sub > SEO | Cat > Sub > SEO)
// ─────────────────────────────────────────────────────────────────────────────
function HierarchyBlock() {
  return (
    <>
      <BiSectionHeading strong="Hierarquia de Produtos" />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(440px, 1fr))",
          gap: 16,
          marginBottom: 16,
        }}
      >
        <BiCard title="Por Marca" hint="top 12 · clique para expandir">
          <HierarchyTable levels={["marca", "categoria_mae", "sub_categoria", "seo_title"]} topN={12} />
        </BiCard>
        <BiCard title="Por Categoria" hint="top 12 · clique para expandir">
          <HierarchyTable levels={["categoria_mae", "sub_categoria", "seo_title"]} topN={12} />
        </BiCard>
      </div>
    </>
  );
}

interface HRow {
  k: string;
  venda: number;
  cmv: number;
  resultado: number;
  margem: number;
  vendas_n: number;
  pct_pai: number;
}

function HierarchyTable({ levels, topN }: { levels: string[]; topN: number }) {
  return (
    <div className="t-scroll" style={{ maxHeight: 560 }}>
      <table className="t">
        <thead>
          <tr>
            <th style={{ textAlign: "left" }}>{levels[0].replace(/_/g, " ")}</th>
            <th className="num">Bruto</th>
            <th className="num">% Total</th>
            <th className="num">Result</th>
            <th className="num">Margem</th>
            <th className="num">Vendas</th>
          </tr>
        </thead>
        <tbody>
          <HierarchyLevel levels={levels} parentPath={[]} topN={topN} depth={0} />
        </tbody>
      </table>
    </div>
  );
}

function HierarchyLevel({
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
  const extraWhere = parentPath
    .map((p) => `${p.col} = '${p.val.replace(/'/g, "''")}'`)
    .join(" AND ");
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
  const { data, loading } = useSQL<HRow>(sql);
  const hasChildren = depth < levels.length - 1;

  if (loading) {
    return (
      <tr>
        <td colSpan={6} style={{ textAlign: "center", color: "var(--mute)", padding: "12px" }}>
          carregando...
        </td>
      </tr>
    );
  }
  if (!data?.length) {
    return (
      <tr>
        <td colSpan={6} style={{ textAlign: "center", color: "var(--mute)", padding: "12px" }}>
          sem dados
        </td>
      </tr>
    );
  }

  return (
    <>
      {data.map((r) => (
        <HierarchyRow
          key={r.k}
          row={r}
          levels={levels}
          parentPath={parentPath}
          depth={depth}
          hasChildren={hasChildren}
          topN={topN}
        />
      ))}
    </>
  );
}

function HierarchyRow({
  row,
  levels,
  parentPath,
  depth,
  hasChildren,
  topN,
}: {
  row: HRow;
  levels: string[];
  parentPath: { col: string; val: string }[];
  depth: number;
  hasChildren: boolean;
  topN: number;
}) {
  const [open, setOpen] = useState(false);
  const pad = 14 * depth + 6;
  const marginColor =
    row.margem >= 0.3 ? "var(--green)" : row.margem >= 0 ? "var(--mute)" : "var(--red)";
  return (
    <>
      <tr
        onClick={() => hasChildren && setOpen((v) => !v)}
        style={{
          cursor: hasChildren ? "pointer" : "default",
          background: open ? "var(--surface-2)" : undefined,
        }}
      >
        <td style={{ paddingLeft: pad, textAlign: "left" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            {hasChildren ? (
              <ChevronRight
                size={14}
                style={{
                  color: "var(--mute)",
                  transition: "transform 120ms",
                  transform: open ? "rotate(90deg)" : "rotate(0deg)",
                  flex: "none",
                }}
              />
            ) : (
              <span style={{ width: 14, display: "inline-block" }} />
            )}
            <span
              style={{
                color: depth === 0 ? "var(--text)" : "var(--text-2)",
                fontWeight: depth === 0 ? 600 : 400,
              }}
            >
              {row.k}
            </span>
          </span>
        </td>
        <td className="num">{fmtBRL(row.venda)}</td>
        <td className="num" style={{ color: "var(--mute)" }}>
          {fmtPct(row.pct_pai)}
        </td>
        <td className="num">{fmtBRL(row.resultado)}</td>
        <td className="num" style={{ color: marginColor }}>
          {fmtPct(row.margem)}
        </td>
        <td className="num" style={{ color: "var(--mute)" }}>
          {fmtNum(row.vendas_n)}
        </td>
      </tr>
      {open && hasChildren && (
        <HierarchyLevel
          levels={levels}
          parentPath={[...parentPath, { col: levels[depth], val: row.k }]}
          topN={topN}
          depth={depth + 1}
        />
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Bottom bars (UF / Pagamento / Transportadora)
// ─────────────────────────────────────────────────────────────────────────────
function BottomBarsBlock() {
  return (
    <>
      <BiSectionHeading strong="Geografia, Pagamento e Logística" />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
          gap: 16,
          marginBottom: 16,
        }}
      >
        <BiCard title="Top UF" hint="clique para cross-filtrar">
          <BarUF />
        </BiCard>
        <BiCard title="Forma de Pagamento" hint="clique para cross-filtrar">
          <BarPgto />
        </BiCard>
        <BiCard title="Top Transportadoras" hint="top 12 por valor">
          <BarTransp />
        </BiCard>
      </div>
    </>
  );
}

function BarUF() {
  const { whereSQL, setF, f } = useFilters();
  const { data } = useSQL<{ uf: string; v: number }>(`
    SELECT cliente_uf AS uf, SUM(valor_rateado)::DOUBLE AS v
    FROM vendas WHERE ${whereSQL} AND cliente_uf IS NOT NULL
    GROUP BY uf ORDER BY v DESC LIMIT 15
  `);
  const items = (data ?? []).map((r) => ({
    name: r.uf,
    value: r.v,
    color: r.uf === f.xfUf ? "var(--green)" : undefined,
  }));
  if (!items.length) return <EmptyChart />;
  return (
    <div
      onClick={(e) => {
        const target = e.target as HTMLElement;
        const label = target.closest(".bar-row")?.querySelector(".label")?.textContent;
        if (label) setF({ xfUf: f.xfUf === label ? null : label });
      }}
      style={{ cursor: "pointer" }}
    >
      <BiBarList items={items} tone="cyan" format="currency" />
    </div>
  );
}

function BarPgto() {
  const { whereSQL, setF, f } = useFilters();
  const { data } = useSQL<{ pgto: string; v: number }>(`
    SELECT forma_pagamento AS pgto, SUM(valor_rateado)::DOUBLE AS v
    FROM vendas WHERE ${whereSQL} AND forma_pagamento IS NOT NULL
    GROUP BY pgto ORDER BY v DESC LIMIT 12
  `);
  const items = (data ?? []).map((r) => ({
    name: r.pgto,
    value: r.v,
    color: r.pgto === f.xfPgto ? "var(--red)" : undefined,
  }));
  if (!items.length) return <EmptyChart />;
  return (
    <div
      onClick={(e) => {
        const target = e.target as HTMLElement;
        const label = target.closest(".bar-row")?.querySelector(".label")?.textContent;
        if (label) setF({ xfPgto: f.xfPgto === label ? null : label });
      }}
      style={{ cursor: "pointer" }}
    >
      <BiBarList items={items} tone="green" format="currency" />
    </div>
  );
}

function BarTransp() {
  const { whereSQL } = useFilters();
  const { data } = useSQL<{ t: string; v: number }>(`
    SELECT nome_transportador AS t, SUM(valor_rateado)::DOUBLE AS v
    FROM vendas WHERE ${whereSQL} AND nome_transportador IS NOT NULL
    GROUP BY t ORDER BY v DESC LIMIT 12
  `);
  const items = (data ?? []).map((r) => ({ name: r.t, value: r.v }));
  if (!items.length) return <EmptyChart />;
  return <BiBarList items={items} tone="violet" format="currency" />;
}

// ─────────────────────────────────────────────────────────────────────────────
// Footer
// ─────────────────────────────────────────────────────────────────────────────
function DashFooter({ rowCount }: { rowCount: number | null }) {
  return (
    <footer
      style={{
        textAlign: "center",
        padding: "24px 0 8px",
        borderTop: "1px solid var(--border)",
        marginTop: 24,
        color: "var(--mute)",
        fontSize: 11,
        fontFamily: "var(--font-mono)",
      }}
    >
      DuckDB-WASM · parquet {rowCount?.toLocaleString("pt-BR") ?? "?"} linhas · CMV via preco_custo, CFV 6,16% estimado
    </footer>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
function EmptyChart() {
  return (
    <div
      style={{
        height: 220,
        display: "grid",
        placeItems: "center",
        color: "var(--mute)",
        fontSize: 12,
        fontFamily: "var(--font-mono)",
      }}
    >
      sem dados
    </div>
  );
}
