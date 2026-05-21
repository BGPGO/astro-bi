/**
 * BiDailyBars — réplica de DailyBars (components.jsx) usando classes do molde.
 * `.daily` + `.daily-bars` + `.daily-x`. Top-3 peaks marcados com `.peak`.
 *
 * Precisa estar dentro de `.bi-dashboard-theme`.
 */
import { cn } from '@/lib/utils';
import { fmtK } from './_chartUtils';

export interface BiDailyBarsProps {
  values: number[];
  color?: 'green' | 'red' | 'cyan';
  showXAxis?: boolean;
  format?: (v: number) => string;
  className?: string;
}

export function BiDailyBars({
  values,
  color = 'green',
  showXAxis = true,
  format = fmtK,
  className,
}: BiDailyBarsProps) {
  if (!values || values.length === 0) return null;

  const max = Math.max(...values) || 1;

  const peakIndexes = new Set(
    [...values.map((v, i) => ({ v, i }))]
      .sort((a, b) => b.v - a.v)
      .slice(0, 3)
      .map((o) => o.i),
  );

  const isRed = color === 'red';
  // .daily-bars .b is green by default, .red gives red. cyan is custom override.
  const cyanOverride = color === 'cyan' ? 'var(--cyan)' : undefined;

  return (
    <div className={cn('daily', className)}>
      <div className="daily-bars">
        {values.map((v, i) => {
          const pct = (v / max) * 100;
          const isPeak = peakIndexes.has(i);
          return (
            <div
              key={i}
              className={cn('b', isRed && 'red', isPeak && 'peak')}
              data-v={format(v)}
              style={{
                height: `${Math.max(pct, 1)}%`,
                ...(cyanOverride ? { background: cyanOverride } : {}),
              }}
              title={`Dia ${i + 1}: ${format(v)}`}
            />
          );
        })}
      </div>

      {showXAxis && (
        <div className="daily-x">
          <span>1</span>
          <span>5</span>
          <span>10</span>
          <span>15</span>
          <span>20</span>
          <span>25</span>
          <span>31</span>
        </div>
      )}
    </div>
  );
}
