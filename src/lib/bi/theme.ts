/**
 * BGP GO BI — tokens de tema.
 * Os valores HSL crus vivem em src/index.css (--bi-*).
 * Aqui exportamos helpers e a paleta categórica usada por charts.
 *
 * NÃO criar tokens novos sem atualizar docs/bi/BI_LAYOUT_SPEC.md.
 */

export const biColor = {
  primary: 'hsl(var(--bi-primary))',
  primaryFg: 'hsl(var(--bi-primary-foreground))',
  secondary: 'hsl(var(--bi-secondary))',
  secondaryFg: 'hsl(var(--bi-secondary-foreground))',
  accent: 'hsl(var(--bi-accent))',
  bg: 'hsl(var(--bi-bg))',
  surface: 'hsl(var(--bi-surface))',
  border: 'hsl(var(--bi-border))',
  text: 'hsl(var(--bi-text))',
  muted: 'hsl(var(--bi-muted))',
} as const;

export const biChartPalette = [
  'hsl(var(--bi-chart-1))',
  'hsl(var(--bi-chart-2))',
  'hsl(var(--bi-chart-3))',
  'hsl(var(--bi-chart-4))',
  'hsl(var(--bi-chart-5))',
  'hsl(var(--bi-chart-6))',
] as const;

export const biSignals = {
  positive: 'hsl(var(--bi-chart-3))',
  negative: 'hsl(var(--bi-chart-4))',
  warning: 'hsl(var(--bi-chart-5))',
  neutral: 'hsl(var(--bi-primary))',
} as const;

export const biFonts = {
  display: "'Genius Techno', 'Inter', system-ui, sans-serif",
  serif: "'Almarena', 'Inter', serif",
  sans: "'Inter', system-ui, sans-serif",
} as const;

export type BiScreenId =
  | 'capa'
  | 'visao-geral'
  | 'receita'
  | 'despesa'
  | 'fluxo-caixa'
  | 'tesouraria'
  | 'mes-vs-mes';

export const biScreens: Array<{ id: BiScreenId; label: string }> = [
  { id: 'capa', label: 'Capa' },
  { id: 'visao-geral', label: 'Visão Geral' },
  { id: 'receita', label: 'Análise de Receita' },
  { id: 'despesa', label: 'Análise de Despesa' },
  { id: 'fluxo-caixa', label: 'Fluxo de Caixa' },
  { id: 'tesouraria', label: 'Tesouraria' },
  { id: 'mes-vs-mes', label: 'Mês vs Mês' },
];

/** Formatadores PT-BR. */
export const fmtBRL = (v: number | null | undefined) =>
  v == null ? '—'
  : v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

export const fmtPct = (v: number | null | undefined, digits = 1) =>
  v == null ? '—' : `${(v * 100).toFixed(digits)}%`;

export const fmtNum = (v: number | null | undefined) =>
  v == null ? '—' : v.toLocaleString('pt-BR');
