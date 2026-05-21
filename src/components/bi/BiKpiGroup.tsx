import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface BiKpiGroupProps {
  children: ReactNode;
  /** Quantos cards por linha em desktop. Default 4. */
  cols?: 2 | 3 | 4 | 5 | 6;
  className?: string;
}

/**
 * Wrapper grid para uma linha de KPI tiles. O molde tem `.row-4` (4 cols
 * fixas) mas precisamos de N — então usamos grid Tailwind structural com o
 * gap padrão do `.row` (16px). Sem estilo visual aqui: as KPI tiles trazem
 * o próprio bg/border via `.kpi-tile`.
 *
 * Responsivo: 1 col mobile → 2 tablet → N desktop. Fica consistente com o
 * que o molde faz nos breakpoints (≤600px: 1 col).
 */
export const BiKpiGroup = ({ children, cols = 4, className }: BiKpiGroupProps) => {
  const colsClass: Record<number, string> = {
    2: 'lg:grid-cols-2',
    3: 'lg:grid-cols-3',
    4: 'lg:grid-cols-4',
    5: 'lg:grid-cols-5',
    6: 'lg:grid-cols-6',
  };

  return (
    <div className={cn('grid grid-cols-1 sm:grid-cols-2 gap-4', colsClass[cols], className)}>
      {children}
    </div>
  );
};
