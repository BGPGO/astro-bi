// Tipos do plano_acao.json
export interface Tema {
  id: string;
  label: string;
  color: string;
  icon?: string;
}

export interface Diagnostico {
  headline: string;
  detalhe: string;
  numero_principal: string;
  fonte_quant: string[];
}

export interface EvidenciaReuniao {
  data: string;
  quem: string;
  fala: string;
  contexto_caso?: string;
}

export interface Acao {
  id: string;
  titulo: string;
  tema: string;
  prioridade: number;
  severidade: "alta" | "media" | "baixa";
  esforco: "baixo" | "medio" | "alto";
  impacto_score: number;
  esforco_score: number;
  impacto_anual_brl: number;
  tipo_impacto: "anual" | "one_shot" | "desbloqueador" | "operacional";
  diagnostico: Diagnostico;
  evidencia_reuniao: EvidenciaReuniao;
  hipotese: string;
  recomendacao: string[];
  responsavel_sugerido: string;
  kpi_alvo: string;
  prazo_dias: number;
}

export interface PlanoAcaoData {
  gerado_em: string;
  metodologia: string;
  fontes: {
    quant: Array<{ arquivo: string; registros?: number | string; janela?: string; snapshot?: string; skus?: number }>;
    qual: Array<{ data: string; arquivo: string; duracao_min?: number; speakers?: string[] }>;
  };
  resumo_executivo: {
    titulo: string;
    destaques: Array<{ label: string; valor: string; fonte: string }>;
  };
  temas: Tema[];
  acoes: Acao[];
}

export async function fetchPlano(): Promise<PlanoAcaoData> {
  const r = await fetch("/data/plano_acao.json");
  if (!r.ok) throw new Error(`fetch plano ${r.status}`);
  return r.json();
}
