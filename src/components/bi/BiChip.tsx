import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type ChipTone = 'default' | 'green' | 'red' | 'cyan' | 'amber';

interface BiChipProps {
  children: ReactNode;
  tone?: ChipTone;
  className?: string;
}

/**
 * Chip arredondado. Réplica do `.chip` do molde GOBI. Variantes oficiais:
 * `green | red | cyan`. Para `amber` o molde não define variante — caímos
 * no estilo default. (Se a paleta for estendida no port, basta acrescentar
 * `.chip.amber` em `bi-molde.css`.)
 */
export const BiChip = ({ children, tone = 'default', className }: BiChipProps) => {
  return (
    <span
      className={cn(
        'chip',
        tone === 'green' && 'green',
        tone === 'red' && 'red',
        tone === 'cyan' && 'cyan',
        tone === 'amber' && 'amber',
        className,
      )}
    >
      {children}
    </span>
  );
};
