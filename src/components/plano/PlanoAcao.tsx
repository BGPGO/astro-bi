import { useEffect, useMemo, useState } from "react";
import { fetchPlano, type PlanoAcaoData, type Acao } from "@/state/plano";
import { MatrizImpactoEsforco } from "./MatrizImpactoEsforco";
import { ActionCard } from "./ActionCard";
import { Section } from "../Card";
import { Loader2, AlertCircle, X, Filter } from "lucide-react";
import { cls } from "@/lib/fmt";

export function PlanoAcao() {
  const [data, setData] = useState<PlanoAcaoData | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const [temaSel, setTemaSel] = useState<string | null>(null);
  const [sevSel, setSevSel] = useState<Acao["severidade"] | null>(null);
  const [esfSel, setEsfSel] = useState<Acao["esforco"] | null>(null);
  const [busca, setBusca] = useState("");
  const [focusedAcaoId, setFocusedAcaoId] = useState<string | null>(null);

  useEffect(() => {
    fetchPlano().then(setData).catch((e) => setErr(String(e)));
  }, []);

  // se hash tem #plano/A03 (anchor), foca aquele card
  useEffect(() => {
    if (!data) return;
    const m = window.location.hash.match(/^#plano\/([A-Z0-9]+)/i);
    if (m) {
      setFocusedAcaoId(m[1]);
      const el = document.getElementById(m[1]);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [data]);

  const acoesFiltradas = useMemo(() => {
    if (!data) return [];
    return data.acoes.filter((a) => {
      if (temaSel && a.tema !== temaSel) return false;
      if (sevSel && a.severidade !== sevSel) return false;
      if (esfSel && a.esforco !== esfSel) return false;
      if (busca) {
        const q = busca.toLowerCase();
        const blob = `${a.titulo} ${a.diagnostico.headline} ${a.diagnostico.detalhe} ${a.recomendacao.join(" ")} ${a.evidencia_reuniao.fala}`.toLowerCase();
        if (!blob.includes(q)) return false;
      }
      return true;
    });
  }, [data, temaSel, sevSel, esfSel, busca]);

  if (err) {
    return (
      <div className="min-h-[60vh] grid place-items-center">
        <div className="text-center space-y-2">
          <AlertCircle className="w-8 h-8 text-accent-rose mx-auto" />
          <div className="text-accent-rose">erro carregando plano: {err}</div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-[60vh] grid place-items-center">
        <div className="text-center space-y-2">
          <Loader2 className="w-8 h-8 text-accent animate-spin mx-auto" />
          <div className="text-sm text-muted">Carregando plano de ação...</div>
        </div>
      </div>
    );
  }

  const hasFilter = !!(temaSel || sevSel || esfSel || busca);

  return (
    <main className="max-w-[1600px] mx-auto px-6 py-6 space-y-6">
      {/* Header executivo */}
      <header className="space-y-3">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">📋 Plano de Ação — Astro Distribuidora</h1>
          <p className="text-sm text-muted leading-relaxed mt-1">{data.resumo_executivo.titulo}</p>
        </div>
        <div className="text-[11px] text-muted leading-relaxed bg-bg-card border border-ink-subtle rounded-lg p-3">
          <strong className="text-slate-400">Metodologia:</strong> {data.metodologia}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {data.resumo_executivo.destaques.map((d, i) => (
            <div key={i} className="bg-bg-card border border-ink-DEFAULT rounded-lg p-3">
              <div className="text-[10px] uppercase tracking-wide text-muted font-medium">{d.label}</div>
              <div className="text-[13px] text-white font-semibold mt-1 leading-snug">{d.valor}</div>
              <div className="text-[10px] text-muted mono mt-1 truncate" title={d.fonte}>{d.fonte}</div>
            </div>
          ))}
        </div>
      </header>

      {/* Matriz Impacto × Esforço */}
      <Section title="Matriz Impacto × Esforço" subtitle="clique numa bolha pra abrir a ação">
        <div className="bg-bg-card border border-ink-DEFAULT rounded-xl p-4">
          <MatrizImpactoEsforco
            acoes={data.acoes}
            temas={data.temas}
            onClick={(a) => {
              setFocusedAcaoId(a.id);
              const el = document.getElementById(a.id);
              if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
              window.history.replaceState(null, "", `#plano/${a.id}`);
            }}
          />
        </div>
      </Section>

      {/* Filtros */}
      <div className="sticky top-[57px] z-30 bg-bg/95 backdrop-blur border border-ink-DEFAULT rounded-xl p-3 flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5 text-[11px] text-muted uppercase tracking-wide font-medium mr-2">
          <Filter className="w-3.5 h-3.5" /> filtros
        </div>
        <div className="flex flex-wrap gap-1.5">
          {data.temas.map((t) => (
            <button
              key={t.id}
              onClick={() => setTemaSel(temaSel === t.id ? null : t.id)}
              className={cls(
                "text-xs px-2.5 py-1 rounded-md transition-colors border",
                temaSel === t.id ? "border-current" : "border-transparent hover:border-ink-DEFAULT"
              )}
              style={temaSel === t.id ? { color: t.color, background: `${t.color}1a` } : { color: "#9ca3af" }}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="w-px h-5 bg-ink-DEFAULT mx-1" />
        {(["alta", "media", "baixa"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setSevSel(sevSel === s ? null : s)}
            className={cls(
              "text-[11px] uppercase px-2 py-1 rounded-md transition-colors border",
              sevSel === s ? "border-accent bg-accent/10 text-accent" : "border-ink-DEFAULT text-muted hover:border-muted"
            )}
          >
            sev {s}
          </button>
        ))}
        <div className="w-px h-5 bg-ink-DEFAULT mx-1" />
        {(["baixo", "medio", "alto"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setEsfSel(esfSel === s ? null : s)}
            className={cls(
              "text-[11px] uppercase px-2 py-1 rounded-md transition-colors border",
              esfSel === s ? "border-accent bg-accent/10 text-accent" : "border-ink-DEFAULT text-muted hover:border-muted"
            )}
          >
            esf {s}
          </button>
        ))}
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar texto..."
          className="text-sm bg-bg-elev border border-ink-DEFAULT rounded-md px-3 py-1 ml-auto min-w-[200px] outline-none focus:border-accent"
        />
        {hasFilter && (
          <button
            onClick={() => {
              setTemaSel(null);
              setSevSel(null);
              setEsfSel(null);
              setBusca("");
            }}
            className="text-xs text-muted hover:text-white px-2 py-1 flex items-center gap-1"
          >
            <X className="w-3.5 h-3.5" /> Limpar
          </button>
        )}
      </div>

      {/* Lista de ações */}
      <Section title={`Ações (${acoesFiltradas.length} de ${data.acoes.length})`} subtitle="clique no card pra ver diagnóstico + citação da reunião + recomendação">
        <div className="space-y-3">
          {acoesFiltradas.length === 0 && (
            <div className="text-center py-12 text-muted text-sm">Nenhuma ação com os filtros atuais.</div>
          )}
          {acoesFiltradas.map((a) => (
            <ActionCard key={a.id} acao={a} temas={data.temas} expanded={focusedAcaoId === a.id} />
          ))}
        </div>
      </Section>

      {/* Footer com fontes */}
      <footer className="text-[11px] text-muted border-t border-ink-DEFAULT pt-4 space-y-2">
        <div className="flex flex-wrap items-baseline gap-2">
          <strong className="text-slate-400">Fontes quant:</strong>
          {data.fontes.quant.map((f, i) => (
            <span key={i} className="bg-bg-elev px-2 py-0.5 rounded mono">{f.arquivo}</span>
          ))}
        </div>
        <div className="flex flex-wrap items-baseline gap-2">
          <strong className="text-slate-400">Fontes qual:</strong>
          {data.fontes.qual.map((f, i) => (
            <span key={i} className="bg-bg-elev px-2 py-0.5 rounded mono">{f.data} · {f.arquivo.split(/[\\/]/).pop()}</span>
          ))}
        </div>
        <div>Gerado em {data.gerado_em}. Atualiza junto com o pipeline diário.</div>
      </footer>
    </main>
  );
}
