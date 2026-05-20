import { useState } from "react";
import type { Acao, Tema } from "@/state/plano";
import { fmtBRLk, cls } from "@/lib/fmt";
import { ChevronDown, Quote, Target, Hash, User, Calendar } from "lucide-react";

interface Props {
  acao: Acao;
  temas: Tema[];
  expanded?: boolean;
}

function SevBadge({ sev }: { sev: Acao["severidade"] }) {
  const map = {
    alta: "bg-accent-rose/15 text-accent-rose border-accent-rose/30",
    media: "bg-accent-orange/15 text-accent-orange border-accent-orange/30",
    baixa: "bg-muted/15 text-muted border-muted/30",
  } as const;
  return <span className={cls("text-[10px] px-2 py-0.5 rounded border uppercase tracking-wide font-medium", map[sev])}>{sev}</span>;
}

function EsfBadge({ esf }: { esf: Acao["esforco"] }) {
  const map = {
    baixo: "bg-accent-green/15 text-accent-green border-accent-green/30",
    medio: "bg-accent-orange/15 text-accent-orange border-accent-orange/30",
    alto: "bg-accent-rose/15 text-accent-rose border-accent-rose/30",
  } as const;
  return <span className={cls("text-[10px] px-2 py-0.5 rounded border uppercase tracking-wide font-medium", map[esf])}>{esf}</span>;
}

export function ActionCard({ acao, temas, expanded = false }: Props) {
  const [open, setOpen] = useState(expanded);
  const tema = temas.find((t) => t.id === acao.tema);

  const impactoLabel = (() => {
    if (acao.impacto_anual_brl <= 0) {
      const t = acao.tipo_impacto;
      if (t === "desbloqueador") return "desbloqueador";
      if (t === "operacional") return "operacional";
      return "—";
    }
    return `${fmtBRLk(acao.impacto_anual_brl)}${acao.tipo_impacto === "one_shot" ? " (one-shot)" : "/ano"}`;
  })();

  return (
    <article id={acao.id} className="bg-bg-card border border-ink-DEFAULT rounded-xl overflow-hidden transition-colors hover:border-ink-DEFAULT/70">
      <button onClick={() => setOpen((v) => !v)} className="w-full text-left p-4 flex items-start gap-4">
        <div className="flex flex-col items-center gap-1 pt-0.5 min-w-[44px]">
          <span className="text-[10px] uppercase tracking-wide text-muted mono">prio</span>
          <span className="text-2xl font-bold num text-white">{acao.prioridade}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center flex-wrap gap-2 mb-1.5">
            <span className="text-[10px] mono opacity-60">{acao.id}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded font-medium" style={{ background: `${tema?.color}1a`, color: tema?.color, border: `1px solid ${tema?.color}33` }}>
              {tema?.label}
            </span>
            <SevBadge sev={acao.severidade} />
            <EsfBadge esf={acao.esforco} />
          </div>
          <h3 className="text-base font-semibold text-white leading-snug mb-2">{acao.titulo}</h3>
          <div className="grid grid-cols-3 gap-3 text-[12px]">
            <div>
              <div className="text-muted text-[10px] uppercase tracking-wide">Impacto</div>
              <div className="text-white num font-medium">{impactoLabel}</div>
            </div>
            <div>
              <div className="text-muted text-[10px] uppercase tracking-wide">KPI alvo</div>
              <div className="text-white truncate" title={acao.kpi_alvo}>{acao.kpi_alvo}</div>
            </div>
            <div>
              <div className="text-muted text-[10px] uppercase tracking-wide">Prazo</div>
              <div className="text-white">{acao.prazo_dias}d</div>
            </div>
          </div>
        </div>
        <ChevronDown className={cls("w-5 h-5 text-muted flex-none transition-transform mt-1", open && "rotate-180")} />
      </button>

      {open && (
        <div className="px-4 pb-4 pt-1 border-t border-ink-subtle space-y-4">
          {/* Diagnóstico */}
          <section>
            <div className="flex items-center gap-2 mb-2">
              <Hash className="w-3.5 h-3.5 text-accent" />
              <span className="text-[11px] uppercase tracking-wide text-muted font-medium">Diagnóstico</span>
            </div>
            <p className="text-[14px] text-white font-medium leading-snug mb-1.5">{acao.diagnostico.headline}</p>
            <p className="text-[13px] text-slate-300 leading-relaxed">{acao.diagnostico.detalhe}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px]">
              <span className="text-muted">Métrica principal:</span>
              <span className="bg-accent/10 text-accent px-2 py-0.5 rounded mono">{acao.diagnostico.numero_principal}</span>
              <span className="text-muted">fontes:</span>
              {acao.diagnostico.fonte_quant.map((f) => (
                <span key={f} className="bg-bg-elev text-muted px-1.5 py-0.5 rounded mono text-[10px]">{f}</span>
              ))}
            </div>
          </section>

          {/* Evidência da reunião */}
          <section>
            <div className="flex items-center gap-2 mb-2">
              <Quote className="w-3.5 h-3.5 text-accent-purple" />
              <span className="text-[11px] uppercase tracking-wide text-muted font-medium">Evidência (reunião)</span>
              {acao.evidencia_reuniao.data !== "n/a" && (
                <span className="text-[10px] text-muted ml-auto flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> {acao.evidencia_reuniao.data} · {acao.evidencia_reuniao.quem}
                </span>
              )}
            </div>
            <blockquote className="border-l-2 border-accent-purple/50 pl-3 italic text-[13px] text-slate-300 leading-relaxed">
              "{acao.evidencia_reuniao.fala}"
            </blockquote>
            {acao.evidencia_reuniao.contexto_caso && (
              <p className="text-[12px] text-muted mt-2"><strong className="text-slate-400">Contexto:</strong> {acao.evidencia_reuniao.contexto_caso}</p>
            )}
          </section>

          {/* Hipótese + Recomendação */}
          <section>
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-3.5 h-3.5 text-accent-green" />
              <span className="text-[11px] uppercase tracking-wide text-muted font-medium">Hipótese & recomendação</span>
            </div>
            <p className="text-[12px] text-muted mb-2"><strong className="text-slate-400">Hipótese:</strong> {acao.hipotese}</p>
            <ul className="space-y-1.5">
              {acao.recomendacao.map((r, i) => (
                <li key={i} className="text-[13px] text-slate-200 flex gap-2 leading-relaxed">
                  <span className="text-accent-green font-mono text-xs mt-0.5">▸</span>
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Responsável + KPI */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[12px]">
            <div className="flex items-start gap-2">
              <User className="w-3.5 h-3.5 text-muted mt-0.5" />
              <div>
                <div className="text-[10px] uppercase tracking-wide text-muted">Responsável sugerido</div>
                <div className="text-slate-200">{acao.responsavel_sugerido}</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Target className="w-3.5 h-3.5 text-muted mt-0.5" />
              <div>
                <div className="text-[10px] uppercase tracking-wide text-muted">KPI alvo</div>
                <div className="text-slate-200">{acao.kpi_alvo}</div>
              </div>
            </div>
          </section>
        </div>
      )}
    </article>
  );
}
