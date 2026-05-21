import { biScreens, type BiScreenId } from '@/lib/bi/theme';
import { BiBrand } from './BiBrand';
import Home from 'lucide-react/dist/esm/icons/home';
import Activity from 'lucide-react/dist/esm/icons/activity';
import TrendingUp from 'lucide-react/dist/esm/icons/trending-up';
import TrendingDown from 'lucide-react/dist/esm/icons/trending-down';
import Waves from 'lucide-react/dist/esm/icons/waves';
import Landmark from 'lucide-react/dist/esm/icons/landmark';
import GitCompare from 'lucide-react/dist/esm/icons/git-compare';
import type { ForwardRefExoticComponent, RefAttributes, SVGProps } from 'react';
type LucideIcon = ForwardRefExoticComponent<
  Omit<SVGProps<SVGSVGElement>, 'ref'> & {
    size?: string | number;
    color?: string;
    strokeWidth?: string | number;
    absoluteStrokeWidth?: boolean;
  } & RefAttributes<SVGSVGElement>
>;

const iconByScreen: Record<BiScreenId, LucideIcon> = {
  'capa': Home,
  'visao-geral': Activity,
  'receita': TrendingUp,
  'despesa': TrendingDown,
  'fluxo-caixa': Waves,
  'tesouraria': Landmark,
  'mes-vs-mes': GitCompare,
};

interface BiSidebarProps {
  active: BiScreenId;
  onSelect: (id: BiScreenId) => void;
  /** Telas extras específicas do cliente (CMV, NPS, etc.). */
  extras?: Array<{ id: string; label: string; Icon: LucideIcon }>;
  /** Id da extra ativa (quando uma das extras está sendo exibida). */
  activeExtra?: string | null;
  onSelectExtra?: (id: string) => void;
}

/**
 * Sidebar do BI — segue o molde-gobi: brand no topo, secção "Geral" com as
 * 7 telas fixas, secção "Extras" com telas client-specific (quando existem).
 *
 * Markup canônico do molde: `.sidebar` › `.sb-brand`/`.sb-section`/`.sb-item`.
 */
export const BiSidebar = ({
  active,
  onSelect,
  extras = [],
  activeExtra,
  onSelectExtra,
}: BiSidebarProps) => {
  // Quando uma extra está ativa, nenhuma das padrão deve aparecer "selecionada".
  const standardActive = activeExtra ? null : active;

  return (
    <aside className="sidebar">
      <div className="sb-brand">
        <BiBrand />
      </div>

      <div className="sb-section">Geral</div>
      {biScreens.map(({ id, label }) => {
        const Icon = iconByScreen[id];
        const isActive = standardActive === id;
        return (
          <button
            key={id}
            type="button"
            className={`sb-item${isActive ? ' active' : ''}`}
            onClick={() => onSelect(id)}
          >
            <Icon size={18} strokeWidth={1.7} />
            <span className="label">{label}</span>
          </button>
        );
      })}

      {extras.length > 0 && (
        <>
          <div className="sb-section">Extras</div>
          {extras.map(({ id, label, Icon }) => {
            const isActive = activeExtra === id;
            return (
              <button
                key={id}
                type="button"
                className={`sb-item${isActive ? ' active' : ''}`}
                onClick={() => onSelectExtra?.(id)}
              >
                <Icon size={18} strokeWidth={1.7} />
                <span className="label">{label}</span>
              </button>
            );
          })}
        </>
      )}

      <div className="sb-spacer" />
    </aside>
  );
};
