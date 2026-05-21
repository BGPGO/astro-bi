/**
 * BiLegend — réplica de `.legend` + `.legend-item` + `.legend-dot` do
 * molde GOBI. As tones `green` (default) / `red` / `cyan` são variantes
 * oficiais do CSS. Para `amber` / `violet` (sem variante no molde) ou
 * cor explícita, usamos `style.background` no dot como override.
 */
import { cn } from '@/lib/utils';

export interface BiLegendItem {
  label: string;
  /** CSS color direta (hex, rgba, hsl...). Tem precedência sobre tone. */
  color?: string;
  tone?: 'green' | 'red' | 'cyan' | 'amber' | 'violet';
}

export interface BiLegendProps {
  items: BiLegendItem[];
  className?: string;
}

const NATIVE_TONES = new Set(['green', 'red', 'cyan']);

export function BiLegend({ items, className }: BiLegendProps) {
  if (!items || items.length === 0) return null;

  return (
    <div className={cn('legend', className)}>
      {items.map((item, i) => {
        const useNativeTone = item.tone && NATIVE_TONES.has(item.tone) && !item.color;
        // Override é só para casos sem variante no molde (amber/violet) ou cor custom.
        const overrideBg =
          item.color ??
          (item.tone === 'amber'
            ? 'var(--amber)'
            : item.tone === 'violet'
            ? 'var(--violet)'
            : undefined);
        return (
          <span key={i} className="legend-item">
            <span
              className={cn(
                'legend-dot',
                useNativeTone && item.tone !== 'green' && item.tone, // .red ou .cyan
              )}
              style={overrideBg ? { background: overrideBg } : undefined}
            />
            {item.label}
          </span>
        );
      })}
    </div>
  );
}
