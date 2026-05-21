import { cn } from '@/lib/utils';
import bgpLogoWhite from '@/assets/bi/bgp-logo-white.png';

interface BiBrandProps {
  /** Tamanho do wordmark. md = padrão (sidebar/header), lg/xl = telas grandes (capa). */
  size?: 'md' | 'lg' | 'xl';
  className?: string;
}

/**
 * Logo BGP (branca) — molde-gobi.
 * Usada no `.sb-brand` da sidebar e em qualquer outro lugar que precise do wordmark.
 * O glow cyan vem do CSS (`.sb-logo-img`); mantemos só o sizing aqui.
 */
export const BiBrand = ({ size = 'md', className }: BiBrandProps) => {
  const maxWidth = size === 'xl' ? 240 : size === 'lg' ? 200 : 170;

  return (
    <img
      src={bgpLogoWhite}
      alt="BGP"
      className={cn('sb-logo-img', className)}
      style={{ maxWidth }}
    />
  );
};
