/**
 * BiLineChart — réplica de TrendChart (components.jsx).
 * SVG `.trend` com `.grid` (dashed gridlines), `.axis-text` (labels eixo X) e
 * `.point-label` (chips numéricos sobre cada ponto). Área gradient + stroke.
 *
 * Precisa estar dentro de `.bi-dashboard-theme`.
 */
import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { fmtK } from './_chartUtils';

export interface BiLineChartProps {
  values: number[];
  labels?: string[];
  /** Altura em px. Default 160. */
  height?: number;
  /** Cor da linha/área. Default var(--cyan). */
  color?: string;
  showPoints?: boolean;
  showLabels?: boolean;
  format?: (v: number) => string;
  /** ID único do gradient SVG. Gera automaticamente se omitido. */
  gradientId?: string;
  className?: string;
}

let _lineId = 0;

export function BiLineChart({
  values,
  labels,
  height = 160,
  color = 'var(--cyan)',
  showPoints = true,
  showLabels = true,
  format = fmtK,
  gradientId,
  className,
}: BiLineChartProps) {
  const gid = useMemo(() => gradientId ?? `tg-${++_lineId}`, [gradientId]);

  const w = 1000;
  const h = height;
  const padX = 40;
  const padY = 32;

  if (!values || values.length === 0) return null;

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const stepX = values.length > 1 ? (w - padX * 2) / (values.length - 1) : 0;

  const points = values.map((v, i) => ({
    x: padX + i * stepX,
    y: padY + (1 - (v - min) / range) * (h - padY * 2),
  }));

  const pathD = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(' ');

  const areaD =
    pathD +
    ` L ${points[points.length - 1].x} ${h - padY} L ${points[0].x} ${h - padY} Z`;

  const grids = [0, 1, 2, 3];

  return (
    <svg
      className={cn('trend', className)}
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      style={{ height }}
    >
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.30" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Gridlines (estilo via .trend .grid) */}
      {grids.map((i) => {
        const y = padY + (i / 3) * (h - padY * 2);
        return (
          <line
            key={i}
            className="grid"
            x1={padX}
            y1={y}
            x2={w - padX}
            y2={y}
          />
        );
      })}

      {/* Area fill */}
      <path d={areaD} fill={`url(#${gid})`} />

      {/* Line */}
      <path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* Points + labels */}
      {showPoints &&
        points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r={3} fill={color} />
            {showLabels && (
              <text
                className="point-label"
                x={p.x}
                y={p.y - 8}
                textAnchor="middle"
              >
                {format(values[i])}
              </text>
            )}
          </g>
        ))}

      {/* X-axis labels (estilo via .trend .axis-text) */}
      {labels &&
        labels.map((l, i) => (
          <text
            key={`x${i}`}
            className="axis-text"
            x={padX + i * stepX}
            y={h - 6}
            textAnchor="middle"
          >
            {l}
          </text>
        ))}
    </svg>
  );
}
