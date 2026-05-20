import { useSQL } from "@/lib/useQuery";
import { useFilters } from "@/state/filters";
import { fmtBRLk, fmtBRL, fmtNum, fmtPct, cls } from "@/lib/fmt";

const CFV_PCT_ESTIMADO = 0.0616;

interface KpiRow {
  valor_bruto: number;
  cmv: number;
  resultado_bruto: number;
  n_vendas: number;
  ticket: number;
  dias_uteis: number;
  valor_bruto_util: number;
}

export function Kpis() {
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
    <div className={cls("space-y-3", loading && "opacity-60 transition-opacity")}>
      {/* Linha 1: 4 KPIs grandes */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiBig label="Valor Bruto" value={fmtBRLk(valor_bruto)} sub="Σ valor_rateado" accent="default" />
        <KpiBig label="Resultado Bruto" value={fmtBRLk(resultado_bruto)} sub="bruto − CMV" accent="green" />
        <KpiBig label="CMV" value={fmtBRLk(cmv)} sub="custo dos produtos" accent="orange" estimado />
        <KpiBig label="Valor Líquido" value={fmtBRLk(valor_liquido)} sub="bruto − CFV − CMV" accent="purple" />
      </div>
      {/* Linha 2: 6 KPIs menores */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <KpiSmall label="Total Vendas" value={fmtNum(n_vendas)} sub={`${dias_uteis} dias úteis`} />
        <KpiSmall label="Venda/dia útil" value={fmtBRLk(venda_dia_util)} sub="bruto útil ÷ dias" />
        <KpiSmall label="Ticket Médio" value={fmtBRL(ticket)} sub="bruto ÷ pedidos" />
        <KpiSmall label="Margem Bruta %" value={fmtPct(margem_bruta_pct)} sub="1 − CMV/Vendas" estimado />
        <KpiSmall label="CFV %" value={fmtPct(CFV_PCT_ESTIMADO)} sub="placeholder" estimado />
        <KpiSmall label="Margem Líquida %" value={fmtPct(margem_liq_pct)} sub="líquido ÷ bruto" />
      </div>
    </div>
  );
}

function KpiBig({
  label,
  value,
  sub,
  accent,
  estimado,
}: {
  label: string;
  value: string;
  sub?: string;
  accent: "default" | "green" | "orange" | "purple" | "rose";
  estimado?: boolean;
}) {
  const accentBorder = {
    default: "border-l-accent",
    green: "border-l-accent-green",
    orange: "border-l-accent-orange",
    purple: "border-l-accent-purple",
    rose: "border-l-accent-rose",
  }[accent];
  return (
    <div className={cls("bg-bg-card border border-ink-DEFAULT border-l-4 rounded-xl p-4 transition-colors hover:border-ink-DEFAULT/50", accentBorder)}>
      <div className="text-[11px] uppercase tracking-wide text-muted font-medium flex items-center gap-2">
        {label}
        {estimado && <span className="text-[9px] px-1.5 py-0.5 rounded bg-accent-orange/15 text-accent-orange">est</span>}
      </div>
      <div className="text-3xl font-bold text-white num mt-2 tracking-tight">{value}</div>
      {sub && <div className="text-[11px] text-muted mt-1 mono">{sub}</div>}
    </div>
  );
}

function KpiSmall({
  label,
  value,
  sub,
  estimado,
}: {
  label: string;
  value: string;
  sub?: string;
  estimado?: boolean;
}) {
  return (
    <div className="bg-bg-card border border-ink-DEFAULT rounded-lg px-3 py-2.5">
      <div className="text-[10px] uppercase tracking-wide text-muted font-medium flex items-center gap-1.5">
        {label}
        {estimado && <span className="text-[8px] px-1 py-0.5 rounded bg-accent-orange/15 text-accent-orange">est</span>}
      </div>
      <div className="text-lg font-semibold text-white num mt-0.5">{value}</div>
      {sub && <div className="text-[10px] text-muted mono mt-0.5">{sub}</div>}
    </div>
  );
}
