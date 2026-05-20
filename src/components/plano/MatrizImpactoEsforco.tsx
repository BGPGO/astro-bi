import { Chart } from "../Chart";
import type { Acao, Tema } from "@/state/plano";
import type { ECElementEvent } from "echarts";

interface Props {
  acoes: Acao[];
  temas: Tema[];
  onClick?: (acao: Acao) => void;
}

export function MatrizImpactoEsforco({ acoes, temas, onClick }: Props) {
  const series = temas.map((t) => ({
    name: t.label,
    type: "scatter" as const,
    symbolSize: (data: number[]) => Math.max(10, Math.sqrt(Math.max(0, data[2] / 1000)) * 1.2 + 14),
    itemStyle: { color: t.color, opacity: 0.85, borderColor: "rgba(255,255,255,0.12)", borderWidth: 1 },
    data: acoes
      .filter((a) => a.tema === t.id)
      .map((a) => ({
        value: [a.esforco_score, a.impacto_score, a.impacto_anual_brl, a.id, a.titulo],
      })),
    emphasis: { focus: "series" as const, scale: 1.2 },
  }));

  return (
    <Chart
      height={420}
      onClick={(p: ECElementEvent) => {
        const v = p.value as unknown as [number, number, number, string, string];
        const acao = acoes.find((a) => a.id === v[3]);
        if (acao && onClick) onClick(acao);
      }}
      option={{
        grid: { left: 50, right: 30, top: 30, bottom: 50 },
        xAxis: {
          type: "value",
          name: "← menos esforço     |     mais esforço →",
          nameLocation: "middle",
          nameGap: 28,
          nameTextStyle: { color: "#7a8597", fontSize: 11 },
          min: 0,
          max: 10,
          axisLabel: { color: "#7a8597" },
          splitLine: { lineStyle: { color: "#1a1f29" } },
        },
        yAxis: {
          type: "value",
          name: "impacto →",
          nameLocation: "end",
          nameTextStyle: { color: "#7a8597", fontSize: 11 },
          min: 0,
          max: 10,
          axisLabel: { color: "#7a8597" },
          splitLine: { lineStyle: { color: "#1a1f29" } },
        },
        tooltip: {
          trigger: "item",
          formatter: (params: unknown) => {
            const p = params as { value: [number, number, number, string, string] };
            const v = p.value;
            const valor = v[2] > 0 ? `R$ ${(v[2] / 1000).toFixed(0)}k/ano` : "desbloq.";
            return `<div style="max-width:280px;line-height:1.4"><b>${v[3]}</b> · ${v[4]}<br/><span style="opacity:0.7">Impacto ${v[1]}/10 · Esforço ${v[0]}/10 · ${valor}</span></div>`;
          },
        },
        legend: {
          bottom: 0,
          textStyle: { color: "#cbd5e1", fontSize: 11 },
          itemWidth: 10,
          itemHeight: 10,
          icon: "circle",
        },
        series,
      }}
    />
  );
}
