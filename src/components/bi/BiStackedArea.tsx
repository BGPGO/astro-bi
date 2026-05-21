/**
 * BiStackedArea — réplica de StackedArea (components.jsx).
 * SVG `.trend` com 2 áreas bezier (receita verde + despesa vermelha) sobrepostas,
 * eixo Y com 5 ticks dashed e labels via `.axis-text`.
 *
 * Precisa estar dentro de `.bi-dashboard-theme`.
 */
import { useMemo } from 'react';
import { cn } from '@/lib/utils';

export interface BiStackedAreaItem {
  m: string;
  receita: number;
  despesa: number;
}

export interface BiStackedAreaProps {
  data: BiStackedAreaItem[];
  height?: number;
  showAxis?: boolean;
  className?: string;
}

let _saId = 0;

export function BiStackedArea({
  data,
  height = 320,
  showAxis = true,
  className,
}: BiStackedAreaProps) {
  const ids = useMemo(() => {
    const n = ++_saId;
    return { green: `sa-green-${n}`, red: `sa-red-${n}` };
  }, []);

  if (!data || data.length === 0) return null;

  const w = 1000;
  const h = height;
  const padX = 50;
  const padTop = 16;
  const padBottom = 30;

  const allVals = data.flatMap((d) => [d.receita, d.despesa]);
  const maxV = Math.max(...allVals) * 1.1 || 1;
  const range = maxV;
  const stepX = data.length > 1 ? (w - padX * 2) / (data.length - 1) : 0;

  const ptsFn = (key: 'receita' | 'despesa') =>
    data.map((d, i) => ({
      x: padX + i * stepX,
      y: padTop + (1 - d[key] / range) * (h - padTop - padBottom),
    }));

  const curve = (pts: { x: number; y: number }[]) => {
    if (pts.length < 2) return `M ${pts[0].x} ${pts[0].y}`;
    let p = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) {
      const { x: x0, y: y0 } = pts[i - 1];
      const { x: x1, y: y1 } = pts[i];
      const cx = (x0 + x1) / 2;
      p += ` C ${cx} ${y0}, ${cx} ${y1}, ${x1} ${y1}`;
    }
    return p;
  };

  const ptsR = ptsFn('receita');
  const ptsD = ptsFn('despesa');
  const baseY = padTop + (h - padTop - padBottom);

  const curvR = curve(ptsR);
  const curvD = curve(ptsD);

  const areaR = `${curvR} L ${ptsR[ptsR.length - 1].x} ${baseY} L ${ptsR[0].x} ${baseY} Z`;
  const areaD = `${curvD} L ${ptsD[ptsD.length - 1].x} ${baseY} L ${ptsD[0].x} ${baseY} Z`;

  const ticks = 5;
  const tickVals = Array.from({ length: ticks }, (_, i) => (maxV / (ticks - 1)) * i);

  return (
    <svg
      className={cn('trend', className)}
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      style={{ height }}
    >
      <defs>
        <linearGradient id={ids.green} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--green)" stopOpacity="0.55" />
          <stop offset="100%" stopColor="var(--green)" stopOpacity="0.03" />
        </linearGradient>
        <linearGradient id={ids.red} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--red)" stopOpacity="0.55" />
          <stop offset="100%" stopColor="var(--red)" stopOpacity="0.03" />
        </linearGradient>
      </defs>

      {/* Y-axis ticks */}
      {showAxis &&
        tickVals.map((tv, i) => {
          const y = padTop + (1 - tv / maxV) * (h - padTop - padBottom);
          return (
            <g key={i}>
              <line className="grid" x1={padX} y1={y} x2={w - 10} y2={y} />
              <text
                className="axis-text"
                x={padX - 8}
                y={y + 3}
                textAnchor="end"
              >
                R$ {(tv / 1e6).toFixed(1).replace('.', ',')}M
              </text>
            </g>
          );
        })}

      {/* Areas */}
      <path d={areaR} fill={`url(#${ids.green})`} />
      <path d={areaD} fill={`url(#${ids.red})`} />

      {/* Lines */}
      <path d={curvR} fill="none" stroke="var(--green)" strokeWidth={2} />
      <path d={curvD} fill="none" stroke="var(--red)" strokeWidth={2} />

      {/* X labels */}
      {showAxis &&
        data.map((d, i) => (
          <text
            key={`x${i}`}
            className="axis-text"
            x={padX + i * stepX}
            y={h - 10}
            textAnchor="middle"
            style={{ textTransform: 'capitalize' }}
          >
            {d.m.slice(0, 3)}
          </text>
        ))}
    </svg>
  );
}
