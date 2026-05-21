/**
 * BiIndicatorLine — réplica de IndicatorLine (pages-1.jsx).
 * SVG `.ind-line` com baseline zero dashed, bezier suavizada, gradient acima/abaixo,
 * labels +/- coloridos verde/vermelho.
 *
 * Precisa estar dentro de `.bi-dashboard-theme`.
 */
import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { fmtBR } from './_chartUtils';

export interface BiIndicatorLineProps {
  values: number[];
  labels: string[];
  height?: number;
  color?: string;
  format?: (v: number) => string;
  className?: string;
}

let _indId = 0;

export function BiIndicatorLine({
  values,
  labels,
  height = 240,
  color = 'var(--cyan)',
  format = fmtBR,
  className,
}: BiIndicatorLineProps) {
  const gid = useMemo(() => `ind-grad-${++_indId}`, []);

  const w = 1100;
  const h = height;
  const padX = 50;
  const padTop = 36;
  const padBottom = 36;

  if (!values || values.length === 0) return null;

  const minV = Math.min(0, ...values);
  const maxV = Math.max(0, ...values);
  const range = maxV - minV || 1;

  const stepX = values.length > 1 ? (w - padX * 2) / (values.length - 1) : 0;
  const xOf = (i: number) => padX + i * stepX;
  const yOf = (v: number) => padTop + (1 - (v - minV) / range) * (h - padTop - padBottom);

  const pts = values.map((v, i) => [xOf(i), yOf(v)] as [number, number]);

  const curve = (p: [number, number][]) => {
    if (p.length < 2) return `M ${p[0][0]} ${p[0][1]}`;
    let d = `M ${p[0][0]} ${p[0][1]}`;
    for (let i = 1; i < p.length; i++) {
      const [x0, y0] = p[i - 1];
      const [x1, y1] = p[i];
      const cx = (x0 + x1) / 2;
      d += ` C ${cx} ${y0}, ${cx} ${y1}, ${x1} ${y1}`;
    }
    return d;
  };

  const path = curve(pts);
  const zeroY = yOf(0);

  const areaD = `${path} L ${pts[pts.length - 1][0]} ${zeroY} L ${pts[0][0]} ${zeroY} Z`;

  return (
    <svg
      className={cn('ind-line', className)}
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      style={{ width: '100%', height }}
    >
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.30" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Zero baseline */}
      <line
        x1={padX}
        y1={zeroY}
        x2={w - padX}
        y2={zeroY}
        stroke="rgba(255,255,255,0.18)"
        strokeDasharray="6 5"
        strokeWidth={1}
      />

      {/* Area */}
      <path d={areaD} fill={`url(#${gid})`} />

      {/* Line */}
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={2.5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* Points + labels (acima/abaixo conforme sinal) */}
      {pts.map((p, i) => {
        const v = values[i];
        const above = v >= 0;
        return (
          <g key={i}>
            <circle
              cx={p[0]}
              cy={p[1]}
              r={4.5}
              fill={color}
              stroke="var(--bg)"
              strokeWidth={2.5}
            />
            <text
              x={p[0]}
              y={above ? p[1] - 12 : p[1] + 22}
              textAnchor="middle"
              fill={above ? 'var(--text)' : 'var(--red-3)'}
              fontFamily="var(--font-mono)"
              fontSize={11.5}
              fontWeight={600}
            >
              {format(v)}
            </text>
          </g>
        );
      })}

      {/* X labels — every other */}
      {labels.map((l, i) =>
        i % 2 === 0 ? (
          <text
            key={`xl${i}`}
            x={xOf(i)}
            y={h - 10}
            textAnchor="middle"
            fill="var(--mute)"
            fontSize={11}
            fontFamily="var(--font-ui)"
          >
            {l}
          </text>
        ) : null,
      )}
    </svg>
  );
}
