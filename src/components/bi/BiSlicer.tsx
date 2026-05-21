import { cn } from '@/lib/utils';

interface BiSlicerProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: Array<{ value: string; label: string }>;
  className?: string;
}

/**
 * Slicer (filtro dropdown) padrão do BI. Renderiza `<select className=
 * "filter-select">` do molde GOBI, com label uppercase acima usando
 * `.filter-mini-label`. O `<select>` nativo herda a seta SVG, padding,
 * border e hover do CSS.
 */
export const BiSlicer = ({
  label,
  value,
  onChange,
  options,
  className,
}: BiSlicerProps) => {
  return (
    <div className={cn('flex flex-col', className)}>
      <span className="filter-mini-label" style={{ marginBottom: 4 }}>{label}</span>
      <select
        className="filter-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};
