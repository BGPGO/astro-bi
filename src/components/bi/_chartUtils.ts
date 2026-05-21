/** Shared formatting helpers for all BI chart components */

export const fmtBR = (v: number) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 2,
  }).format(v);

export const fmtK = (v: number) => {
  const abs = Math.abs(v);
  if (abs >= 1_000_000) return `R$${(v / 1_000_000).toFixed(2).replace('.', ',')} M`;
  if (abs >= 1_000) return `R$${(v / 1_000).toFixed(0)} K`;
  return `R$${v.toFixed(0)}`;
};

/**
 * Resolve a color token name to a CSS color string.
 *
 * Componentes que rodam dentro de `.bi-dashboard-theme` recebem aliases
 * `--cyan`, `--green`, `--red`, etc. Componentes fora dele (raro) usam
 * `--bi-*` direto via fallback.
 */
export const colorToken = (
  color: 'green' | 'red' | 'cyan' | 'amber' | 'violet',
): string => {
  const map: Record<string, string> = {
    green: 'var(--green, hsl(var(--bi-green)))',
    red: 'var(--red, hsl(var(--bi-red)))',
    cyan: 'var(--cyan, hsl(var(--bi-cyan)))',
    amber: 'var(--amber, hsl(var(--bi-amber)))',
    violet: 'var(--violet, hsl(var(--bi-violet)))',
  };
  return map[color] ?? map.cyan;
};

/**
 * Generate "nice" tick values for an axis given a max value.
 * Used by charts that need rounded gridline labels.
 */
export const niceTicks = (max: number, count = 5): number[] => {
  if (max <= 0) return [0];
  const step = Math.pow(10, Math.floor(Math.log10(max / count)));
  const niceStep = Math.ceil(max / count / step) * step;
  const ticks: number[] = [];
  for (let v = 0; v <= max + niceStep / 2; v += niceStep) ticks.push(v);
  return ticks;
};
