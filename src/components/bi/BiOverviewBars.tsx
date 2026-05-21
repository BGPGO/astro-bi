/**
 * BiOverviewBars — réplica de OverviewBars (pages-1.jsx) usando classes do molde.
 * `.ov-bars` (padding-top 26 + padding-left 56 pra eixo Y) com plot relativo:
 * `.ov-bars-plot`, `.ov-bars-axis` + `.ov-bars-tick`, `.ov-bars-cols`,
 * `.ov-bar-col` › `.ov-bar-stack` › `.ov-bar` (.green/.red) com `.ov-bar-chip`.
 * Eixo X em `.ov-bars-x` e separador `.ov-bars-year`.
 *
 * Precisa estar dentro de `.bi-dashboard-theme`.
 */
import { cn } from '@/lib/utils';

export interface BiOverviewBarsItem {
  /** Abreviação do mês: 'jan', 'fev', 'mar', etc. Capitalizado internamente. */
  m: string;
  receita: number;
  despesa: number;
}

export interface BiOverviewBarsProps {
  data: BiOverviewBarsItem[];
  height?: number;
  year?: string;
  className?: string;
}

function capTwo(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1, 3);
}

function chipLabel(v: number) {
  return `R$${Math.round(v / 1000)} K`;
}

export function BiOverviewBars({
  data,
  height = 220,
  year = '2026',
  className,
}: BiOverviewBarsProps) {
  if (!data || data.length === 0) return null;

  const max = Math.max(...data.map((d) => Math.max(d.receita, d.despesa)));
  const niceMax = Math.ceil(max / 200_000) * 200_000 || 200_000;

  const ticks: number[] = [];
  for (let v = 0; v <= niceMax; v += 200_000) ticks.push(v);

  return (
    <div className={cn('ov-bars', className)}>
      {/* Plot area */}
      <div className="ov-bars-plot" style={{ height }}>
        {/* Y-axis: dashed ticks com labels à esquerda */}
        <div className="ov-bars-axis">
          {ticks.map((t, i) => (
            <div
              key={i}
              className="ov-bars-tick"
              style={{ bottom: `${(t / niceMax) * 100}%` }}
            >
              <span>R${(t / 1000).toFixed(0)} K</span>
            </div>
          ))}
        </div>

        {/* Columns */}
        <div className="ov-bars-cols">
          {data.map((d, i) => {
            const rH = (d.receita / niceMax) * 100;
            const dH = (d.despesa / niceMax) * 100;
            return (
              <div key={i} className="ov-bar-col">
                <div className="ov-bar-stack">
                  <div
                    className="ov-bar"
                    style={{ height: `${Math.max(rH, 2)}%` }}
                    title={`Receita: R$${d.receita.toLocaleString('pt-BR')}`}
                  >
                    <span className="ov-bar-chip">{chipLabel(d.receita)}</span>
                  </div>
                  <div
                    className="ov-bar red"
                    style={{ height: `${Math.max(dH, 2)}%` }}
                    title={`Despesa: R$${d.despesa.toLocaleString('pt-BR')}`}
                  >
                    <span className="ov-bar-chip">{chipLabel(d.despesa)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* X labels */}
      <div className="ov-bars-x">
        {data.map((d, i) => (
          <span key={i}>{capTwo(d.m)}</span>
        ))}
      </div>

      {/* Year divider */}
      <div className="ov-bars-year">
        <span>{year}</span>
      </div>
    </div>
  );
}
