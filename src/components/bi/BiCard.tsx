import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface BiCardProps {
  title?: string;
  hint?: string;
  rightSlot?: ReactNode;
  children: ReactNode;
  className?: string;
  /** Sem padding interno no card. Use quando o conteúdo já controla o seu padding. */
  flush?: boolean;
  /**
   * Tom sutil. O molde só define variantes de tom em `.kpi-tile` /
   * `.indicator-card` / `.resultado-card` — para `.card` plain o tone
   * vira no-op (mantido só por compatibilidade de API com as Screens).
   */
  tone?: 'default' | 'cyan' | 'green' | 'red';
}

/**
 * Container base do BI. Renderiza `<div className="card">` (regra do molde
 * GOBI). Title vira `<h2 className="card-title">` e, quando há `rightSlot`,
 * o par é envolvido em `.card-title-row`.
 *
 * Sem glassmorphism inline: o estilo (background, blur, border, padding 20,
 * radius 18) vem 100% de `.card` em `bi-molde.css`.
 */
export const BiCard = ({
  title,
  hint,
  rightSlot,
  children,
  className,
  flush,
  tone,
}: BiCardProps) => {
  return (
    <div
      className={cn(
        'card',
        // tone* é no-op no molde para `.card` plain — mantido só pra futura extensão.
        tone && tone !== 'default' && `tone-${tone}`,
        flush && 'card-flush',
        className,
      )}
      style={flush ? { padding: 0 } : undefined}
    >
      {(title || rightSlot) &&
        (rightSlot ? (
          <div className="card-title-row">
            {title && <h2 className="card-title">{title}</h2>}
            {rightSlot}
          </div>
        ) : (
          title && <h2 className="card-title">{title}</h2>
        ))}
      {hint && <p className="card-hint">{hint}</p>}
      {children}
    </div>
  );
};
