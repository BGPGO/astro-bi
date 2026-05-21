/**
 * BiBarChart — réplica de SingleBars (components.jsx) usando classes do molde.
 * Barras verticais com chips flutuantes, eixo Y dashed e labels mono.
 *
 * Usa as classes `.vbar-chart`, `.vbar-col`, `.vbar-axis`, `.vbar-col .bar`, etc.
 * Precisa estar dentro de `.bi-dashboard-theme`.
 */
import { fmtK } from './_chartUtils';

export type BiBarColor = 'green' | 'red' | 'cyan' | 'amber';

export interface BiBarChartProps {
  values: number[];
  labels: string[];
  color?: BiBarColor;
  height?: number;
  showValueChips?: boolean;
  format?: (v: number) => string;
  className?: string;
}

export function BiBarChart({
  values,
  labels,
  color = 'cyan',
  height = 200,
  showValueChips = true,
  format = fmtK,
  className,
}: BiBarChartProps) {
  if (!values || values.length === 0) return null;

  const max = Math.max(...values.map(Math.abs)) || 1;
  const grids = [0, 0.25, 0.5, 0.75, 1].map((p) => p * max);

  // Map color to inline override only when not green/red (vbar-col .bar default + .red).
  // For cyan/amber we override background via inline style (mantém a classe pra herdar layout).
  const barInlineBg =
    color === 'cyan'
      ? 'var(--cyan)'
      : color === 'amber'
        ? 'var(--amber)'
        : undefined;

  const barClass = color === 'red' ? 'bar red' : 'bar';

  return (
    <div
      className={['vbar-chart', className].filter(Boolean).join(' ')}
      style={{ height, position: 'relative' }}
    >
      {/* Y-axis (gridlines + labels) */}
      <div className="vbar-axis" style={{ height: height - 24 }}>
        {grids.map((g, i) => {
          const pct = (g / max) * 100;
          return (
            <div key={`g${i}`} className="grid" style={{ bottom: `${pct}%` }} />
          );
        })}
        {grids.map((g, i) => {
          const pct = (g / max) * 100;
          return (
            <div key={`l${i}`} className="glabel" style={{ bottom: `${pct}%` }}>
              {format(g)}
            </div>
          );
        })}
      </div>

      {/* Columns */}
      {values.map((v, i) => {
        const h = max > 0 ? (Math.abs(v) / max) * 100 : 0;
        return (
          <div key={i} className="vbar-col">
            <div className="stack">
              <div
                className={barClass}
                style={{
                  height: `${Math.max(h, 1)}%`,
                  width: 22,
                  ...(barInlineBg ? { background: barInlineBg } : {}),
                }}
                title={format(v)}
              >
                {showValueChips && <span className="v">{format(v)}</span>}
              </div>
            </div>
            <span className="x">{labels[i]?.slice(0, 3)}</span>
          </div>
        );
      })}
    </div>
  );
}
