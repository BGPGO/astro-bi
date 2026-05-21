import { cn } from '@/lib/utils';

type BarTone = 'green' | 'red' | 'cyan' | 'amber';

export interface BiMetric {
  label: string;
  value: string;
  pct?: number;
  pctText?: string;
  barTone?: BarTone;
  barFillPct?: number;
}

interface BiMetricStripProps {
  items: BiMetric[];
  className?: string;
}

/**
 * Strip horizontal de N métricas separadas por borders. Réplica do
 * `.metric-strip` do molde GOBI: cada item é `.metric` com sub-elements
 * `.m-label`, `.m-value`, `.m-pct`, `.m-bar` (e variantes `.red/.cyan/
 * .amber` no `.m-bar` para a cor do fill). O grid count vem inline pra
 * suportar N items (o molde tem `repeat(4, 1fr)`; aqui generalizamos).
 */
export const BiMetricStrip = ({ items, className }: BiMetricStripProps) => {
  const count = items.length;

  return (
    <div
      className={cn('metric-strip', className)}
      style={
        count !== 4
          ? { gridTemplateColumns: `repeat(${count}, 1fr)` }
          : undefined
      }
    >
      {items.map((item, i) => {
        const fillPct =
          item.barFillPct ??
          (item.pct != null ? Math.min(Math.abs(item.pct), 100) : 0);
        const tone = item.barTone ?? 'green';
        const pctDisplay =
          item.pctText ??
          (item.pct != null
            ? `${item.pct.toFixed(1).replace('.', ',')}%`
            : undefined);

        return (
          <div key={i} className="metric">
            <div className="m-label">{item.label}</div>
            <div className="m-value">{item.value}</div>
            {pctDisplay && <div className="m-pct">{pctDisplay}</div>}
            <div
              className={cn(
                'm-bar',
                tone === 'red' && 'red',
                tone === 'cyan' && 'cyan',
                tone === 'amber' && 'amber',
              )}
            >
              <div style={{ width: `${fillPct}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
};
