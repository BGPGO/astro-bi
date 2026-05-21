import { cn } from '@/lib/utils';

export interface BiKpiStackItem {
  label: string;
  value: string | number;
  format?: 'currency' | 'percent';
  tone?: 'receita' | 'despesa' | 'neutral';
}

interface BiKpiStackProps {
  items: BiKpiStackItem[];
  className?: string;
}

function formatStackValue(
  value: string | number,
  format?: 'currency' | 'percent',
): string {
  if (typeof value === 'string') return value;
  if (format === 'currency') {
    return `R$ ${value.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }
  if (format === 'percent') return `${value.toFixed(1).replace('.', ',')}%`;
  return value.toLocaleString('pt-BR');
}

/**
 * Lista vertical de métricas com rail colorido lateral. Réplica do
 * `.kpi-stack` do molde GOBI: `.kpi-stack-item.receita|despesa` controla a
 * cor do rail; `.kpi-stack-value` e `.kpi-stack-label` formatam tipografia.
 */
export const BiKpiStack = ({ items, className }: BiKpiStackProps) => {
  return (
    <div className={cn('kpi-stack', className)}>
      {items.map((item, i) => {
        const tone = item.tone ?? 'neutral';
        return (
          <div
            key={i}
            className={cn(
              'kpi-stack-item',
              tone === 'receita' && 'receita',
              tone === 'despesa' && 'despesa',
            )}
          >
            <div className="kpi-stack-value">
              {formatStackValue(item.value, item.format)}
            </div>
            <div className="kpi-stack-label">{item.label}</div>
          </div>
        );
      })}
    </div>
  );
};
