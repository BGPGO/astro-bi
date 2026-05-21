import { ReactNode } from 'react';
import Database from 'lucide-react/dist/esm/icons/database';
import Upload from 'lucide-react/dist/esm/icons/upload';
import { cn } from '@/lib/utils';

interface BiEmptyStateProps {
  title?: string;
  description?: string;
  ctaLabel?: string;
  onCta?: () => void;
  icon?: ReactNode;
  className?: string;
}

/**
 * Estado "ainda sem dados" — usado em todas as 7 telas enquanto as tabelas
 * operacionais estão vazias. O molde GOBI não define uma classe `.empty`
 * dedicada, então usamos `.card` (que já traz bg/blur/border do tema) com
 * layout interno via utilities structural (flex column, center). O CTA usa
 * `.btn-primary` do molde.
 */
export const BiEmptyState = ({
  title = 'Esta tela ainda não tem dados',
  description = 'Os dados do BI vêm das suas Contas a Pagar, Contas a Receber e Saldos Bancários. Use a Importação Unificada ou conecte um ERP no menu Dados.',
  ctaLabel,
  onCta,
  icon,
  className,
}: BiEmptyStateProps) => {
  return (
    <div
      className={cn(
        'card flex h-full min-h-[320px] flex-col items-center justify-center text-center',
        className,
      )}
    >
      <div className="empty-icon-wrap">
        {icon ?? <Database size={20} strokeWidth={1.6} />}
      </div>
      <h3 className="empty-title">{title}</h3>
      <p className="empty-description">{description}</p>
      {onCta && ctaLabel && (
        <button type="button" className="btn-primary mt-5" onClick={onCta}>
          <Upload size={14} strokeWidth={1.8} />
          {ctaLabel}
        </button>
      )}
    </div>
  );
};
