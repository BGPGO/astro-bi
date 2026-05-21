import { cn } from '@/lib/utils';

type LegendTone = 'green' | 'red' | 'cyan' | 'neutral';

interface BiLegendPillProps {
  label: string;
  value?: string;
  tone?: LegendTone;
  className?: string;
}

/**
 * Pill com dot colorido + label + valor mono. Réplica do `.legend-pill`
 * do molde GOBI. Variantes `.green | .red | .cyan` aplicam o glow do dot;
 * `neutral` usa o fallback do CSS (cyan).
 */
export const BiLegendPill = ({
  label,
  value,
  tone = 'neutral',
  className,
}: BiLegendPillProps) => {
  return (
    <div
      className={cn(
        'legend-pill',
        tone === 'green' && 'green',
        tone === 'red' && 'red',
        (tone === 'cyan' || tone === 'neutral') && 'cyan',
        className,
      )}
    >
      <span className="dot" />
      <span className="lbl">{label}</span>
      {value != null && <span className="val">{value}</span>}
    </div>
  );
};
