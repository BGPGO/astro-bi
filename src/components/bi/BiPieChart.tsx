/**
 * BiPieChart — réplica de Donut (components.jsx) usando classes do molde.
 * SVG nativo com stroke-dasharray + overlay `.donut-center` › `.center` › `.center-inner`
 * com `.lbl` (uppercase 10) + `.v` (20 bold).
 *
 * Precisa estar dentro de `.bi-dashboard-theme`.
 */
import { cn } from '@/lib/utils';

export interface BiPieSegment {
  name?: string;
  value: number;
  color: string;
}

export interface BiPieChartProps {
  segments: BiPieSegment[];
  /** Diâmetro do SVG em px. Default 180. */
  size?: number;
  /** Espessura do anel. Default 22. */
  thickness?: number;
  centerLabel?: string;
  centerValue?: string;
  className?: string;
}

export function BiPieChart({
  segments,
  size = 180,
  thickness = 22,
  centerLabel,
  centerValue,
  className,
}: BiPieChartProps) {
  if (!segments || segments.length === 0) return null;

  const total = segments.reduce((s, x) => s + x.value, 0);
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;

  let acc = 0;

  const hasCenterText = !!(centerLabel || centerValue);

  return (
    <div className={cn('donut-center', className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Base track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--surface-3)"
          strokeWidth={thickness}
        />
        {/* Segments */}
        {segments.map((seg, i) => {
          const len = total > 0 ? (seg.value / total) * c : 0;
          const off = c - acc;
          acc += len;
          return (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={seg.color}
              strokeWidth={thickness}
              strokeDasharray={`${len} ${c - len}`}
              strokeDashoffset={off}
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
              strokeLinecap="butt"
            >
              {seg.name && <title>{seg.name}</title>}
            </circle>
          );
        })}
      </svg>

      {hasCenterText && (
        <div className="center">
          <div className="center-inner">
            {centerLabel && <div className="lbl">{centerLabel}</div>}
            {centerValue && <div className="v">{centerValue}</div>}
          </div>
        </div>
      )}
    </div>
  );
}
