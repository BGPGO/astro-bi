import { cn } from '@/lib/utils';
import ArrowUp from 'lucide-react/dist/esm/icons/arrow-up';
import ArrowDown from 'lucide-react/dist/esm/icons/arrow-down';
import { BiSpark } from './BiSpark';

type KpiTone = 'green' | 'red' | 'cyan' | 'amber' | 'default';
// Compat com a API antiga (tone positive/negative/neutral)
type KpiToneLegacy = 'positive' | 'negative' | 'neutral';

interface BiKpiCardProps {
  label: string;
  value: string | number | null;
  unit?: string;
  tone?: KpiTone | KpiToneLegacy;
  nonMonetary?: boolean;
  sparkValues?: number[];
  sparkColor?: string;
  deltaPct?: number;
  deltaDir?: 'up' | 'down';
  /** Compat: nomes antigos de format. */
  format?: 'currency' | 'number' | 'percent' | 'pct' | 'brl';
  /** Compat: delta como fração (0.05 = 5%). */
  delta?: number | null;
  hint?: string;
  className?: string;
}

function resolveTone(tone?: KpiTone | KpiToneLegacy): KpiTone {
  if (!tone) return 'default';
  if (tone === 'positive') return 'green';
  if (tone === 'negative') return 'red';
  if (tone === 'neutral') return 'default';
  return tone as KpiTone;
}

function formatValue(
  value: string | number | null,
  format?: BiKpiCardProps['format'],
): string {
  if (value == null) return '—';
  if (typeof value === 'string') return value;
  if (format === 'currency' || format === 'brl') {
    return value.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
  if (format === 'percent' || format === 'pct') {
    // Suporta tanto frações (0.05 → 5%) quanto direto (50 → 50%).
    const display = Math.abs(value) <= 1 ? value * 100 : value;
    return `${display.toFixed(1).replace('.', ',')}%`;
  }
  return value.toLocaleString('pt-BR');
}

/**
 * KPI Tile do molde GOBI. Renderiza `<div className="kpi-tile {tone}">` com
 * `.kpi-label`, `.kpi-value` (com `.currency` "R$" + `.unit` "M"/"k"/"%"),
 * `.kpi-delta` (`.up`/`.down`) e `.spark-wrap`.
 *
 * Compatível com a API antiga (tone positive/negative/neutral, format
 * pct/brl, delta como fração). Sem inline styles para visual.
 */
export const BiKpiCard = ({
  label,
  value,
  unit,
  tone,
  nonMonetary,
  sparkValues,
  sparkColor,
  deltaPct,
  deltaDir,
  format,
  delta,
  hint,
  className,
}: BiKpiCardProps) => {
  const resolvedTone = resolveTone(tone);

  // Compat: se veio delta (fração), converte para deltaPct + deltaDir.
  const resolvedDeltaPct =
    deltaPct != null
      ? deltaPct
      : delta != null
      ? Math.abs(delta) * 100
      : undefined;
  const resolvedDeltaDir: 'up' | 'down' | undefined =
    deltaDir != null
      ? deltaDir
      : delta != null
      ? delta >= 0
        ? 'up'
        : 'down'
      : undefined;

  // Esconde "R$" se nonMonetary, percent ou number.
  const showCurrency =
    !nonMonetary &&
    format !== 'number' &&
    format !== 'percent' &&
    format !== 'pct';

  const displayValue = formatValue(value, format);

  // Cor do sparkline default por tone (var --bi-* segue scoped no theme).
  const sparkFallbackColor =
    resolvedTone === 'green'
      ? 'var(--green)'
      : resolvedTone === 'red'
      ? 'var(--red)'
      : resolvedTone === 'amber'
      ? 'var(--amber)'
      : 'var(--cyan)';

  return (
    <div
      className={cn(
        'kpi-tile',
        resolvedTone !== 'default' && resolvedTone,
        className,
      )}
    >
      <div>
        <div className="kpi-label">{label}</div>
        <div className="kpi-value">
          {showCurrency && <span className="currency">R$</span>}
          <span>{displayValue}</span>
          {unit && <span className="unit">{unit}</span>}
        </div>
        {resolvedDeltaPct != null && (
          <div className={cn('kpi-delta', resolvedDeltaDir)}>
            {resolvedDeltaDir === 'up' ? (
              <ArrowUp size={12} strokeWidth={2} />
            ) : (
              <ArrowDown size={12} strokeWidth={2} />
            )}
            {resolvedDeltaPct.toFixed(1).replace('.', ',')}%
          </div>
        )}
        {hint && <div className="kpi-hint">{hint}</div>}
      </div>

      {sparkValues && sparkValues.length > 1 && (
        <div className="spark-wrap">
          <BiSpark
            values={sparkValues}
            color={sparkColor ?? sparkFallbackColor}
            height={38}
          />
        </div>
      )}
    </div>
  );
};
