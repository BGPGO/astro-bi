import { useSQL } from "@/lib/useQuery";
import { useFilters } from "@/state/filters";
import { Card, Section } from "./Card";
import { Chart } from "./Chart";
import { fmtBRLk, fmtNum, fmtBRL } from "@/lib/fmt";

export function ChartsTop() {
  return (
    <Section title="Evolução da Venda Bruta">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        <Card className="p-3">
          <div className="text-xs text-muted mb-1">Anual</div>
          <EvolucaoAnual />
        </Card>
        <Card className="p-3">
          <div className="text-xs text-muted mb-1">Diária · últimos 60 dias</div>
          <EvolucaoDiaria />
        </Card>
        <Card className="p-3">
          <div className="text-xs text-muted mb-1">Nº vendas mensal · últimos 18 meses</div>
          <NumeroVendasMensal />
        </Card>
      </div>
    </Section>
  );
}

export function ChartsMid() {
  return (
    <Section title="Perfil de Vendas">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        <Card className="p-3">
          <div className="text-xs text-muted mb-1">Por tipo de comprador</div>
          <DonutTipo />
        </Card>
        <Card className="p-3">
          <div className="text-xs text-muted mb-1">Mensal · últimos 18 meses</div>
          <EvolucaoMensal />
        </Card>
        <Card className="p-3">
          <div className="text-xs text-muted mb-1">Ticket médio diário · últimos 60d</div>
          <TicketDiario />
        </Card>
      </div>
    </Section>
  );
}

function EvolucaoAnual() {
  const { whereSQL } = useFilters();
  const { data, loading } = useSQL<{ ano: number; v: number }>(`
    SELECT EXTRACT(YEAR FROM data_pedido)::INT AS ano, SUM(valor_rateado)::DOUBLE AS v
    FROM vendas WHERE ${whereSQL}
    GROUP BY ano ORDER BY ano
  `);
  const xs = data?.map((r) => String(r.ano)) ?? [];
  const ys = data?.map((r) => r.v) ?? [];
  return (
    <Chart
      loading={loading}
      height={220}
      option={{
        xAxis: { type: "category", data: xs },
        yAxis: { type: "value", axisLabel: { formatter: (v: number) => fmtBRLk(v) } },
        tooltip: { trigger: "axis", valueFormatter: (v) => fmtBRL(Number(v)) },
        series: [
          {
            type: "bar",
            data: ys,
            itemStyle: { color: "#4fc3f7", borderRadius: [4, 4, 0, 0] },
            label: { show: true, position: "top", formatter: (p) => fmtBRLk(Number(p.value)), color: "#cbd5e1", fontSize: 10 },
          },
        ],
      }}
    />
  );
}

function EvolucaoDiaria() {
  const { whereSQL } = useFilters();
  const { data, loading } = useSQL<{ d: string; v: number }>(`
    WITH base AS (
      SELECT data_pedido::DATE AS d, SUM(valor_rateado)::DOUBLE AS v
      FROM vendas WHERE ${whereSQL}
      GROUP BY d
    )
    SELECT * FROM base ORDER BY d DESC LIMIT 60
  `);
  const sorted = (data ?? []).slice().reverse();
  const xs = sorted.map((r) => r.d);
  const ys = sorted.map((r) => r.v);
  return (
    <Chart
      loading={loading}
      height={220}
      option={{
        xAxis: { type: "category", data: xs, axisLabel: { formatter: (s: string) => s.slice(5) } },
        yAxis: { type: "value", axisLabel: { formatter: (v: number) => fmtBRLk(v) } },
        tooltip: { trigger: "axis", valueFormatter: (v) => fmtBRL(Number(v)) },
        series: [
          {
            type: "line",
            data: ys,
            smooth: true,
            symbol: "none",
            lineStyle: { color: "#4fc3f7", width: 2 },
            areaStyle: { color: { type: "linear", x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: "rgba(79,195,247,0.3)" }, { offset: 1, color: "rgba(79,195,247,0)" }] } },
          },
        ],
      }}
    />
  );
}

function NumeroVendasMensal() {
  const { whereSQL } = useFilters();
  const { data, loading } = useSQL<{ am: string; n: number }>(`
    WITH base AS (
      SELECT strftime(data_pedido, '%Y-%m') AS am, COUNT(DISTINCT numero)::INT AS n
      FROM vendas WHERE ${whereSQL}
      GROUP BY am
    )
    SELECT * FROM base ORDER BY am DESC LIMIT 18
  `);
  const sorted = (data ?? []).slice().reverse();
  const xs = sorted.map((r) => r.am);
  const ys = sorted.map((r) => r.n);
  return (
    <Chart
      loading={loading}
      height={220}
      option={{
        xAxis: { type: "category", data: xs },
        yAxis: { type: "value", axisLabel: { formatter: (v: number) => fmtNum(v) } },
        tooltip: { trigger: "axis", valueFormatter: (v) => fmtNum(Number(v)) },
        series: [
          {
            type: "line",
            data: ys,
            smooth: true,
            symbol: "circle",
            symbolSize: 6,
            lineStyle: { color: "#5dd99f", width: 2 },
            itemStyle: { color: "#5dd99f" },
          },
        ],
      }}
    />
  );
}

function DonutTipo() {
  const { whereSQL } = useFilters();
  const { data, loading } = useSQL<{ tipo: string; v: number }>(`
    SELECT
      CASE WHEN cliente_tipo_pessoa = 'F' THEN 'Pessoa Física'
           WHEN cliente_tipo_pessoa = 'J' THEN 'Pessoa Jurídica'
           ELSE 'Outros' END AS tipo,
      SUM(valor_rateado)::DOUBLE AS v
    FROM vendas WHERE ${whereSQL}
    GROUP BY tipo
  `);
  return (
    <Chart
      loading={loading}
      height={220}
      option={{
        tooltip: { trigger: "item", valueFormatter: (v) => fmtBRL(Number(v)) },
        legend: { orient: "horizontal", bottom: 0, textStyle: { color: "#cbd5e1", fontSize: 11 } },
        series: [
          {
            type: "pie",
            radius: ["55%", "75%"],
            avoidLabelOverlap: false,
            label: { show: true, formatter: "{b}\n{d}%", color: "#cbd5e1", fontSize: 11 },
            labelLine: { lineStyle: { color: "#2a3140" } },
            data: (data ?? []).map((r, i) => ({
              value: r.v,
              name: r.tipo,
              itemStyle: { color: ["#4fc3f7", "#ff7a90", "#a78bfa"][i % 3] },
            })),
          },
        ],
      }}
    />
  );
}

function EvolucaoMensal() {
  const { whereSQL } = useFilters();
  const { data, loading } = useSQL<{ am: string; v: number }>(`
    WITH base AS (
      SELECT strftime(data_pedido, '%Y-%m') AS am, SUM(valor_rateado)::DOUBLE AS v
      FROM vendas WHERE ${whereSQL}
      GROUP BY am
    )
    SELECT * FROM base ORDER BY am DESC LIMIT 18
  `);
  const sorted = (data ?? []).slice().reverse();
  const xs = sorted.map((r) => r.am);
  const ys = sorted.map((r) => r.v);
  return (
    <Chart
      loading={loading}
      height={220}
      option={{
        xAxis: { type: "category", data: xs },
        yAxis: { type: "value", axisLabel: { formatter: (v: number) => fmtBRLk(v) } },
        tooltip: { trigger: "axis", valueFormatter: (v) => fmtBRL(Number(v)) },
        series: [
          {
            type: "bar",
            data: ys,
            itemStyle: { color: "#a78bfa", borderRadius: [4, 4, 0, 0] },
            label: { show: false },
          },
        ],
      }}
    />
  );
}

function TicketDiario() {
  const { whereSQL } = useFilters();
  const { data, loading } = useSQL<{ d: string; ticket: number }>(`
    WITH base AS (
      SELECT data_pedido::DATE AS d,
             SUM(valor_rateado) / NULLIF(COUNT(DISTINCT numero), 0) AS ticket
      FROM vendas WHERE ${whereSQL}
      GROUP BY d
    )
    SELECT * FROM (SELECT * FROM base ORDER BY d DESC LIMIT 60) ORDER BY d
  `);
  const xs = data?.map((r) => r.d) ?? [];
  const ys = data?.map((r) => r.ticket) ?? [];
  return (
    <Chart
      loading={loading}
      height={220}
      option={{
        xAxis: { type: "category", data: xs, axisLabel: { formatter: (s: string) => s.slice(5) } },
        yAxis: { type: "value", axisLabel: { formatter: (v: number) => fmtBRLk(v) } },
        tooltip: { trigger: "axis", valueFormatter: (v) => fmtBRL(Number(v)) },
        series: [
          {
            type: "line",
            data: ys,
            smooth: true,
            symbol: "none",
            lineStyle: { color: "#ffb86b", width: 2 },
            areaStyle: { color: { type: "linear", x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: "rgba(255,184,107,0.3)" }, { offset: 1, color: "rgba(255,184,107,0)" }] } },
          },
        ],
      }}
    />
  );
}
