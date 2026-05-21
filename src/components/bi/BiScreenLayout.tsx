import { ReactNode, useState } from 'react';
import ArrowRight from 'lucide-react/dist/esm/icons/arrow-right';
import ArrowLeft from 'lucide-react/dist/esm/icons/arrow-left';

interface BiScreenLayoutProps {
  title: string;
  subtitle?: string;
  /** Conteúdo da versão "principal" (KPIs + gráfico + detalhe leve). */
  children: ReactNode;
  /** Conteúdo da versão drill (.C). Se omitido, o botão de drill não aparece. */
  drill?: ReactNode;
  rightSlot?: ReactNode;
  className?: string;
}

/**
 * Wrapper padrão de toda tela do BI.
 *
 * Usa o markup do molde-gobi:
 *  - `.page` — área scrollável com background gradient + dot grid + grid de cards.
 *  - `.page-title` — título + subtitle (à esquerda) + actions/right slot.
 *  - Os filhos viram cards (`.card`) ou rows (`.row .row-1-1`, etc.).
 *
 * O `.page` provê `display: grid; grid-auto-rows: max-content; gap: 16px`,
 * então cada filho vira uma linha do grid.
 */
export const BiScreenLayout = ({
  title,
  subtitle,
  children,
  drill,
  rightSlot,
  className,
}: BiScreenLayoutProps) => {
  const [showDrill, setShowDrill] = useState(false);

  return (
    <div className={`page${className ? ' ' + className : ''}`}>
      <div className="page-title">
        <div>
          <h1>{title}</h1>
          {subtitle && <div className="subtitle">{subtitle}</div>}
        </div>
        <div className="actions">
          {rightSlot}
          {drill && (
            <button
              type="button"
              className="btn-ghost"
              onClick={() => setShowDrill((v) => !v)}
            >
              {showDrill ? (
                <>
                  <ArrowLeft />
                  <span>Voltar</span>
                </>
              ) : (
                <>
                  <span>Drill</span>
                  <ArrowRight />
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {showDrill && drill ? drill : children}
    </div>
  );
};
