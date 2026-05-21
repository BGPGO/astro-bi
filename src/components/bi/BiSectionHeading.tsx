import { cn } from '@/lib/utils';

interface BiSectionHeadingProps {
  strong: string;
  soft?: string;
  className?: string;
}

/**
 * Heading uppercase de seção (ex.: "INDICADORES PRINCIPAIS"). Renderiza
 * `<h3 className="section-heading">` do molde GOBI — a parte `soft` vai em
 * `<span className="muted">` para herdar a cor mais discreta.
 */
export const BiSectionHeading = ({
  strong,
  soft,
  className,
}: BiSectionHeadingProps) => {
  return (
    <h3 className={cn('section-heading', className)}>
      {strong}
      {soft && (
        <>
          {' '}
          <span className="muted">{soft}</span>
        </>
      )}
    </h3>
  );
};
