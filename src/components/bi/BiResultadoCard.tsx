import { cn } from '@/lib/utils';

interface BiResultadoCardProps {
  title?: string;
  value: string | number;
  format?: 'currency';
  primaryLabel?: string;
  pct?: number;
  pctLabel?: string;
  className?: string;
}

function fmtCurrency(value: string | number): string {
  if (typeof value === 'string') return value;
  return `R$ ${value.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Card de destaque "Resultado". No molde GOBI vive como combinação
 * `<div className="card resultado-card">` — herda padding/radius do
 * `.card` e ganha gradient verde + glow do `.resultado-card`. O valor
 * principal usa `.kpi-stack-value.resultado-val` para herdar tipografia
 * e a cor verde brilhante. O pct usa `.kpi-stack-pct`.
 */
export const BiResultadoCard = ({
  title = 'RESULTADO GERAL',
  value,
  format,
  primaryLabel,
  pct,
  pctLabel = 'Margem Líquida',
  className,
}: BiResultadoCardProps) => {
  const displayValue = format === 'currency' ? fmtCurrency(value) : String(value);

  return (
    <div className={cn('card', 'resultado-card', className)}>
      {title && <h2 className="card-title">{title}</h2>}

      {primaryLabel && <div className="kpi-stack-label">{primaryLabel}</div>}

      <div className="kpi-stack-value resultado-val">{displayValue}</div>

      {pct != null && (
        <>
          {pctLabel && <div className="kpi-stack-label">{pctLabel}</div>}
          <div className="kpi-stack-pct">
            {pct.toFixed(1).replace('.', ',')}%
          </div>
        </>
      )}
    </div>
  );
};
