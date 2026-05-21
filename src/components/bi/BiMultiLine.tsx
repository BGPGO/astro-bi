/**
 * BiMultiLine — réplica de MultiLine (components.jsx).
 * Usa `.trend` com `.grid` (gridlines) e `.axis-text` (labels X). Múltiplas séries.
 *
 * Precisa estar dentro de `.bi-dashboard-theme`.
 */
import { cn } from '@/lib/utils';

export interface BiMultiLineSeries {
  name: string;
  values: number[];
  color: string;
}

export interface BiMultiLineProps {
  series: BiMultiLineSeries[];
  labels?: string[];
  height?: number;
  className?: string;
}

export function BiMultiLine({
  series,
  labels,
  height = 180,
  className,
}: BiMultiLineProps) {
  if (!series || series.length === 0) return null;

  const w = 1000;
  const h = height;
  const padX = 30;
  const padY = 24;

  const allVals = series.flatMap((s) => s.values);
  const minV = Math.min(...allVals);
  const maxV = Math.max(...allVals);
  const range = maxV - minV || 1;
  const numPts = series[0].values.length;
  const stepX = numPts > 1 ? (w - padX * 2) / (numPts - 1) : 0;

  const xOf = (i: number) => padX + i * stepX;
  const yOf = (v: number) => padY + (1 - (v - minV) / range) * (h - padY * 2);

  const grids = [0, 1, 2, 3];

  return (
    <svg
      className={cn('trend', className)}
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      style={{ height }}
    >
      {/* Gridlines */}
      {grids.map((i) => {
        const y = padY + (i / 3) * (h - padY * 2);
        return (
          <line key={i} className="grid" x1={padX} y1={y} x2={w - padX} y2={y} />
        );
      })}

      {/* Series */}
      {series.map((s, si) => {
        const pts = s.values.map((v, i) => ({ x: xOf(i), y: yOf(v) }));
        const pathD = pts
          .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
          .join(' ');
        return (
          <g key={si}>
            <path
              d={pathD}
              fill="none"
              stroke={s.color}
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            {pts.map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r={2.5} fill={s.color} />
            ))}
          </g>
        );
      })}

      {/* X-axis labels */}
      {labels &&
        labels.map((l, i) => (
          <text
            key={`x${i}`}
            className="axis-text"
            x={xOf(i)}
            y={h - 6}
            textAnchor="middle"
          >
            {l}
          </text>
        ))}
    </svg>
  );
}
