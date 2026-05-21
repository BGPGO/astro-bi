import { cn } from '@/lib/utils';

type BarListTone = 'cyan' | 'green' | 'red' | 'violet' | 'amber';

export interface BiBarListItem {
  name: string;
  value: number;
  /** Override do dot/fill por linha. Default: cor da `tone`. */
  color?: string;
}

interface BiBarListProps {
  items: BiBarListItem[];
  tone?: BarListTone;
  variant?: 'bars' | 'legend';
  format?: 'currency' | 'number';
  /** Para variant legend: base do cálculo de %. Default = soma dos itens. */
  total?: number;
  className?: string;
}

const TONE_COLOR: Record<BarListTone, string> = {
  cyan: 'var(--cyan)',
  green: 'var(--green)',
  red: 'var(--red)',
  violet: 'var(--violet)',
  amber: 'var(--amber)',
};

function fmtVal(value: number, format?: 'currency' | 'number'): string {
  if (format === 'currency') {
    return `R$ ${value.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }
  return value.toLocaleString('pt-BR');
}

/**
 * Lista de barras horizontais — variante "bars" (track+fill) ou "legend" (dot+pct).
 * Réplica do `.bar-list` e `.bar-list.with-bars` do molde GOBI.
 * Precisa estar dentro de `.bi-dashboard-theme`.
 */
export const BiBarList = ({
  items,
  tone = 'cyan',
  variant = 'bars',
  format,
  total,
  className,
}: BiBarListProps) => {
  const max = Math.max(...items.map((it) => it.value), 1);
  const computedTotal = total ?? items.reduce((s, it) => s + it.value, 0);
  const toneColor = TONE_COLOR[tone];

  if (variant === 'legend') {
    return (
      <div className={cn('bar-list', className)}>
        {items.map((item, i) => {
          const pct = computedTotal > 0 ? (item.value / computedTotal) * 100 : 0;
          const dotColor = item.color ?? toneColor;
          return (
            <div key={i} className="bar-row">
              <div className="top">
                <span className="dot" style={{ background: dotColor }} />
                <span className="label">{item.name}</span>
              </div>
              <div>
                <span className="val">{fmtVal(item.value, format)}</span>
                <span className="pct">
                  {pct.toFixed(2).replace('.', ',')}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // variant === 'bars'  → bar-list.with-bars
  return (
    <div className={cn('bar-list with-bars', className)}>
      {items.map((item, i) => {
        const widthPct = (item.value / max) * 100;
        // If item.color override given, inline; else use tone class.
        const fillStyle = item.color ? { width: `${widthPct}%`, background: item.color } : { width: `${widthPct}%` };
        return (
          <div key={i} className="bar-row">
            <div className="row-meta">
              <span className="label">{item.name}</span>
              <span className="val">{fmtVal(item.value, format)}</span>
            </div>
            <div className="track">
              <div className={cn('fill', tone !== 'cyan' && tone)} style={fillStyle} />
            </div>
          </div>
        );
      })}
    </div>
  );
};
