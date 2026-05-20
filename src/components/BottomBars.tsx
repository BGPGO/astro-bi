import { useSQL } from "@/lib/useQuery";
import { useFilters } from "@/state/filters";
import { Card, Section } from "./Card";
import { Chart } from "./Chart";
import { fmtBRL, fmtBRLk } from "@/lib/fmt";
import type { ECElementEvent } from "echarts";

export function BottomBars() {
  return (
    <Section title="Geografia, Pagamento e Logística">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        <Card className="p-3">
          <div className="text-xs text-muted mb-1">Top UF · clique pra cross-filtrar</div>
          <BarUF />
        </Card>
        <Card className="p-3">
          <div className="text-xs text-muted mb-1">Forma de pagamento · clique pra cross-filtrar</div>
          <BarPgto />
        </Card>
        <Card className="p-3">
          <div className="text-xs text-muted mb-1">Top transportadoras</div>
          <BarTransp />
        </Card>
      </div>
    </Section>
  );
}

function BarUF() {
  const { whereSQL, setF, f } = useFilters();
  const { data, loading } = useSQL<{ uf: string; v: number }>(`
    SELECT cliente_uf AS uf, SUM(valor_rateado)::DOUBLE AS v
    FROM vendas WHERE ${whereSQL} AND cliente_uf IS NOT NULL
    GROUP BY uf ORDER BY v DESC LIMIT 15
  `);
  const sorted = (data ?? []).slice().reverse();
  const xs = sorted.map((r) => r.uf);
  const ys = sorted.map((r) => r.v);
  return (
    <Chart
      loading={loading}
      height={400}
      onClick={(p: ECElementEvent) => {
        const uf = (p.name ?? String(p.value)) as string;
        setF({ xfUf: f.xfUf === uf ? null : uf });
      }}
      option={{
        grid: { left: 6, right: 60, top: 8, bottom: 8, containLabel: true },
        xAxis: { type: "value", axisLabel: { formatter: (v: number) => fmtBRLk(v) } },
        yAxis: { type: "category", data: xs, axisLabel: { color: f.xfUf ? "#7a8597" : "#cbd5e1" } },
        tooltip: { trigger: "axis", valueFormatter: (v) => fmtBRL(Number(v)) },
        series: [
          {
            type: "bar",
            data: ys.map((v, i) => ({
              value: v,
              itemStyle: { color: xs[i] === f.xfUf ? "#5dd99f" : "#4fc3f7", borderRadius: [0, 4, 4, 0] },
            })),
            label: { show: true, position: "right", formatter: (p) => fmtBRLk(Number(p.value)), color: "#cbd5e1", fontSize: 10 },
          },
        ],
      }}
    />
  );
}

function BarPgto() {
  const { whereSQL, setF, f } = useFilters();
  const { data, loading } = useSQL<{ pgto: string; v: number }>(`
    SELECT forma_pagamento AS pgto, SUM(valor_rateado)::DOUBLE AS v
    FROM vendas WHERE ${whereSQL} AND forma_pagamento IS NOT NULL
    GROUP BY pgto ORDER BY v DESC LIMIT 12
  `);
  const sorted = (data ?? []).slice().reverse();
  const xs = sorted.map((r) => r.pgto);
  const ys = sorted.map((r) => r.v);
  return (
    <Chart
      loading={loading}
      height={400}
      onClick={(p: ECElementEvent) => {
        const pgto = (p.name ?? String(p.value)) as string;
        setF({ xfPgto: f.xfPgto === pgto ? null : pgto });
      }}
      option={{
        grid: { left: 6, right: 60, top: 8, bottom: 8, containLabel: true },
        xAxis: { type: "value", axisLabel: { formatter: (v: number) => fmtBRLk(v) } },
        yAxis: { type: "category", data: xs },
        tooltip: { trigger: "axis", valueFormatter: (v) => fmtBRL(Number(v)) },
        series: [
          {
            type: "bar",
            data: ys.map((v, i) => ({
              value: v,
              itemStyle: { color: xs[i] === f.xfPgto ? "#ff7a90" : "#5dd99f", borderRadius: [0, 4, 4, 0] },
            })),
            label: { show: true, position: "right", formatter: (p) => fmtBRLk(Number(p.value)), color: "#cbd5e1", fontSize: 10 },
          },
        ],
      }}
    />
  );
}

function BarTransp() {
  const { whereSQL } = useFilters();
  const { data, loading } = useSQL<{ t: string; v: number }>(`
    SELECT nome_transportador AS t, SUM(valor_rateado)::DOUBLE AS v
    FROM vendas WHERE ${whereSQL} AND nome_transportador IS NOT NULL
    GROUP BY t ORDER BY v DESC LIMIT 12
  `);
  const sorted = (data ?? []).slice().reverse();
  const xs = sorted.map((r) => r.t);
  const ys = sorted.map((r) => r.v);
  return (
    <Chart
      loading={loading}
      height={400}
      option={{
        grid: { left: 6, right: 60, top: 8, bottom: 8, containLabel: true },
        xAxis: { type: "value", axisLabel: { formatter: (v: number) => fmtBRLk(v) } },
        yAxis: { type: "category", data: xs, axisLabel: { width: 180, overflow: "truncate" } },
        tooltip: { trigger: "axis", valueFormatter: (v) => fmtBRL(Number(v)) },
        series: [
          {
            type: "bar",
            data: ys,
            itemStyle: { color: "#a78bfa", borderRadius: [0, 4, 4, 0] },
            label: { show: true, position: "right", formatter: (p) => fmtBRLk(Number(p.value)), color: "#cbd5e1", fontSize: 10 },
          },
        ],
      }}
    />
  );
}
