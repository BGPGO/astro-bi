/**
 * BiMonthlyBars — réplica de MonthlyBars (components.jsx) usando classes do molde.
 * `.vbar-chart` + `.vbar-col` + `.stack` com receita (verde 14px) e despesa (vermelha 14px).
 * Eixo Y absolute via `.vbar-axis` + `.grid` + `.glabel`.
 *
 * Precisa estar dentro de `.bi-dashboard-theme`.
 */
import { cn } from '@/lib/utils';
import { fmtK } from './_chartUtils';

export interface BiMonthlyBarsItem {
  m: string;
  receita?: number;
  despesa?: number;
}

export interface BiMonthlyBarsProps {
  data: BiMonthlyBarsItem[];
  height?: number;
  type?: 'both' | 'receita' | 'despesa';
  showLabels?: boolean;
  format?: (v: number) => string;
  className?: string;
}

export function BiMonthlyBars({
  data,
  height = 230,
  type = 'both',
  showLabels = true,
  format = fmtK,
  className,
}: BiMonthlyBarsProps) {
  if (!data || data.length === 0) return null;

  const max = Math.max(
    ...data.map((d) => Math.max(d.receita ?? 0, d.despesa ?? 0)),
  ) || 1;

  const grids = [0, 0.25, 0.5, 0.75, 1].map((p) => p * max);

  return (
    <div style={{ position: 'relative' }} className={className}>
      {/* Y axis (gridlines + labels) */}
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

      <div className="vbar-chart" style={{ height }}>
        {data.map((d, i) => {
          const rH = ((d.receita ?? 0) / max) * 100;
          const dH = ((d.despesa ?? 0) / max) * 100;
          return (
            <div key={i} className="vbar-col">
              <div className="stack">
                {(type === 'both' || type === 'receita') && (
                  <div
                    className="bar"
                    style={{ height: `${Math.max(rH, 1)}%` }}
                    title={`Receita: ${format(d.receita ?? 0)}`}
                  >
                    {showLabels && (
                      <span className="v">{format(d.receita ?? 0)}</span>
                    )}
                  </div>
                )}
                {(type === 'both' || type === 'despesa') && (
                  <div
                    className={cn('bar', 'red')}
                    style={{ height: `${Math.max(dH, 1)}%` }}
                    title={`Despesa: ${format(d.despesa ?? 0)}`}
                  >
                    {showLabels && type === 'despesa' && (
                      <span className="v">{format(d.despesa ?? 0)}</span>
                    )}
                  </div>
                )}
              </div>
              <span className="x">{d.m.slice(0, 3)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
