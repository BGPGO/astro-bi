import { useEffect, useRef } from "react";
import * as echarts from "echarts";
import type { EChartsOption, ECharts } from "echarts";

export interface ChartProps {
  option: EChartsOption;
  height?: number;
  className?: string;
  onClick?: (params: echarts.ECElementEvent) => void;
  loading?: boolean;
}

const DARK_DEFAULTS: EChartsOption = {
  textStyle: { fontFamily: "Inter, system-ui", color: "#cbd5e1" },
  backgroundColor: "transparent",
  grid: { left: 6, right: 12, top: 24, bottom: 22, containLabel: true },
  xAxis: {
    axisLine: { lineStyle: { color: "#2a3140" } },
    axisLabel: { color: "#7a8597", fontSize: 11 },
    splitLine: { lineStyle: { color: "#1a1f29" } },
  },
  yAxis: {
    axisLine: { show: false },
    axisLabel: { color: "#7a8597", fontSize: 11 },
    splitLine: { lineStyle: { color: "#1a1f29" } },
  },
  tooltip: {
    backgroundColor: "#161a22",
    borderColor: "#222732",
    textStyle: { color: "#e5e7eb", fontSize: 12 },
    extraCssText: "box-shadow: 0 8px 24px rgba(0,0,0,0.5); border-radius: 8px;",
  },
};

function mergeDeep<T>(target: T, source: T): T {
  const out: Record<string, unknown> = { ...(target as Record<string, unknown>) };
  for (const k of Object.keys(source as object)) {
    const sv = (source as Record<string, unknown>)[k];
    const tv = out[k];
    if (sv && typeof sv === "object" && !Array.isArray(sv) && tv && typeof tv === "object" && !Array.isArray(tv)) {
      out[k] = mergeDeep(tv, sv);
    } else {
      out[k] = sv;
    }
  }
  return out as T;
}

export function Chart({ option, height = 240, className, onClick, loading }: ChartProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inst = useRef<ECharts | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    inst.current = echarts.init(ref.current, undefined, { renderer: "canvas" });
    const ro = new ResizeObserver(() => inst.current?.resize());
    ro.observe(ref.current);
    if (onClick) inst.current.on("click", onClick);
    return () => {
      ro.disconnect();
      inst.current?.dispose();
      inst.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!inst.current) return;
    const merged = mergeDeep(DARK_DEFAULTS, option) as EChartsOption;
    inst.current.setOption(merged, true);
  }, [option]);

  useEffect(() => {
    if (!inst.current) return;
    if (loading) inst.current.showLoading("default", { text: "", color: "#4fc3f7", textColor: "#7a8597", maskColor: "rgba(10,12,16,0.4)" });
    else inst.current.hideLoading();
  }, [loading]);

  return <div ref={ref} className={className} style={{ height }} />;
}
