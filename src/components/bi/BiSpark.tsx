import { cn } from '@/lib/utils';

interface BiSparkProps {
  values: number[];
  color?: string;
  filled?: boolean;
  height?: number;
  className?: string;
}

/**
 * Sparkline SVG — réplica do `Spark` do molde GOBI (`.spark`).
 * Gradient fill abaixo da linha, stroke suave. Width/height 100% via classe.
 * Precisa estar dentro de `.bi-dashboard-theme`.
 */
export const BiSpark = ({
  values,
  color = 'var(--cyan)',
  filled = true,
  height = 38,
  className,
}: BiSparkProps) => {
  if (!values || values.length < 2) return null;

  const w = 100;
  const h = height;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const step = w / (values.length - 1);
  const pts = values.map((v, i) => [
    i * step,
    (1 - (v - min) / range) * (h - 6) + 3,
  ]);
  const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0]} ${p[1]}`).join(' ');
  const gradId = `bsp-${values.length}-${Math.round(values[0])}-${Math.round(values[values.length - 1])}`;

  return (
    <svg
      className={cn('spark', className)}
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      aria-hidden
    >
      {filled && (
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.4" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
      )}
      {filled && (
        <path d={`${path} L ${w} ${h} L 0 ${h} Z`} fill={`url(#${gradId})`} />
      )}
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
