/**
 * BiDivergingBars — réplica de DivergingBars (components.jsx) usando classes do molde.
 * `.div-row` (label | bar split | val). Cores green/red via tokens.
 *
 * Precisa estar dentro de `.bi-dashboard-theme`.
 */
import { cn } from '@/lib/utils';
import { fmtK } from './_chartUtils';

export interface BiDivergingBarsProps {
  values: number[];
  labels: string[];
  format?: (v: number) => string;
  className?: string;
}

export function BiDivergingBars({
  values,
  labels,
  format = fmtK,
  className,
}: BiDivergingBarsProps) {
  if (!values || values.length === 0) return null;

  const maxAbs = Math.max(...values.map((v) => Math.abs(v))) || 1;

  return (
    <div className={cn('bar-list', className)}>
      {values.map((v, i) => {
        const w = (Math.abs(v) / maxAbs) * 50;
        const positive = v >= 0;

        return (
          <div key={i} className="div-row">
            <div className="label">{labels[i]}</div>

            {/* Track split — left half (negative) | right half (positive) */}
            <div style={{ display: 'flex', height: 12, position: 'relative' }}>
              <div
                style={{
                  flex: 1,
                  position: 'relative',
                  borderRight: '1px solid var(--border-2)',
                }}
              >
                {!positive && (
                  <div
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: 0,
                      height: '100%',
                      width: `${w * 2}%`,
                      background: 'var(--red)',
                      borderRadius: '3px 0 0 3px',
                    }}
                  />
                )}
              </div>
              <div style={{ flex: 1, position: 'relative' }}>
                {positive && (
                  <div
                    style={{
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      height: '100%',
                      width: `${w * 2}%`,
                      background: 'var(--green)',
                      borderRadius: '0 3px 3px 0',
                    }}
                  />
                )}
              </div>
            </div>

            <div
              className="val"
              style={{ color: positive ? 'var(--green)' : 'var(--red)' }}
            >
              {format(v)}
            </div>
          </div>
        );
      })}
    </div>
  );
}
