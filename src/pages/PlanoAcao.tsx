import { useEffect, useMemo, useState } from "react";
import ReactECharts from "echarts-for-react";
import type { ECElementEvent } from "echarts";
import AlertCircle from "lucide-react/dist/esm/icons/circle-alert";
import Calendar from "lucide-react/dist/esm/icons/calendar";
import ChevronDown from "lucide-react/dist/esm/icons/chevron-down";
import Filter from "lucide-react/dist/esm/icons/filter";
import Hash from "lucide-react/dist/esm/icons/hash";
import Loader2 from "lucide-react/dist/esm/icons/loader-2";
import Quote from "lucide-react/dist/esm/icons/quote";
import Target from "lucide-react/dist/esm/icons/target";
import User from "lucide-react/dist/esm/icons/user";
import X from "lucide-react/dist/esm/icons/x";
import {
  BiCard,
  BiChip,
  BiKpiStack,
  BiSectionHeading,
  type BiKpiStackItem,
} from "@/components/bi";
import { fetchPlano, type Acao, type PlanoAcaoData, type Tema } from "@/state/plano";
import { fmtBRLk } from "@/lib/fmt";
import { cn } from "@/lib/utils";

// ───────────────────────────────────────────────────────────────────────────────
// Helpers
// ───────────────────────────────────────────────────────────────────────────────

type SevTone = "red" | "amber" | "default";
type EsfTone = "green" | "amber" | "red";

const SEV_LABEL: Record<Acao["severidade"], string> = {
  alta: "SEV ALTA",
  media: "SEV MEDIA",
  baixa: "SEV BAIXA",
};

const ESF_LABEL: Record<Acao["esforco"], string> = {
  baixo: "ESF BAIXO",
  medio: "ESF MEDIO",
  alto: "ESF ALTO",
};

function sevTone(s: Acao["severidade"]): SevTone {
  if (s === "alta") return "red";
  if (s === "media") return "amber";
  return "default";
}

function esfTone(e: Acao["esforco"]): EsfTone {
  if (e === "baixo") return "green";
  if (e === "medio") return "amber";
  return "red";
}

function impactoLabel(a: Acao): string {
  if (a.impacto_anual_brl <= 0) {
    if (a.tipo_impacto === "desbloqueador") return "desbloqueador";
    if (a.tipo_impacto === "operacional") return "operacional";
    return "—";
  }
  return `${fmtBRLk(a.impacto_anual_brl)}${a.tipo_impacto === "one_shot" ? " (one-shot)" : "/ano"}`;
}

// ───────────────────────────────────────────────────────────────────────────────
// Matriz Impacto × Esforço (ECharts scatter)
// ───────────────────────────────────────────────────────────────────────────────

interface MatrizProps {
  acoes: Acao[];
  temas: Tema[];
  onClick?: (a: Acao) => void;
}

function MatrizImpactoEsforco({ acoes, temas, onClick }: MatrizProps) {
  const series = temas.map((t) => ({
    name: t.label,
    type: "scatter" as const,
    symbolSize: (data: number[]) =>
      Math.max(10, Math.sqrt(Math.max(0, data[2] / 1000)) * 1.2 + 14),
    itemStyle: {
      color: t.color,
      opacity: 0.85,
      borderColor: "rgba(255,255,255,0.12)",
      borderWidth: 1,
    },
    data: acoes
      .filter((a) => a.tema === t.id)
      .map((a) => ({
        value: [a.esforco_score, a.impacto_score, a.impacto_anual_brl, a.id, a.titulo],
      })),
    emphasis: { focus: "series" as const, scale: 1.2 },
  }));

  const option = {
    grid: { left: 50, right: 30, top: 30, bottom: 60 },
    xAxis: {
      type: "value",
      name: "← menos esforço     |     mais esforço →",
      nameLocation: "middle",
      nameGap: 32,
      nameTextStyle: { color: "#7a8597", fontSize: 11 },
      min: 0,
      max: 10,
      axisLabel: { color: "#7a8597" },
      splitLine: { lineStyle: { color: "#1a1f29" } },
    },
    yAxis: {
      type: "value",
      name: "impacto →",
      nameLocation: "end",
      nameTextStyle: { color: "#7a8597", fontSize: 11 },
      min: 0,
      max: 10,
      axisLabel: { color: "#7a8597" },
      splitLine: { lineStyle: { color: "#1a1f29" } },
    },
    tooltip: {
      trigger: "item",
      backgroundColor: "rgba(8,14,18,0.95)",
      borderColor: "rgba(34,211,238,0.25)",
      textStyle: { color: "#e6edf3", fontSize: 12 },
      formatter: (params: unknown) => {
        const p = params as { value: [number, number, number, string, string] };
        const v = p.value;
        const valor = v[2] > 0 ? `R$ ${(v[2] / 1000).toFixed(0)}k/ano` : "desbloq.";
        return `<div style="max-width:280px;line-height:1.4"><b>${v[3]}</b> · ${v[4]}<br/><span style="opacity:0.7">Impacto ${v[1]}/10 · Esforço ${v[0]}/10 · ${valor}</span></div>`;
      },
    },
    legend: {
      bottom: 0,
      textStyle: { color: "#cbd5e1", fontSize: 11 },
      itemWidth: 10,
      itemHeight: 10,
      icon: "circle",
    },
    series,
  };

  return (
    <ReactECharts
      option={option}
      style={{ height: 420, width: "100%" }}
      opts={{ renderer: "canvas" }}
      onEvents={{
        click: (p: ECElementEvent) => {
          const v = p.value as unknown as [number, number, number, string, string];
          const acao = acoes.find((a) => a.id === v[3]);
          if (acao && onClick) onClick(acao);
        },
      }}
    />
  );
}

// ───────────────────────────────────────────────────────────────────────────────
// ActionCard
// ───────────────────────────────────────────────────────────────────────────────

interface ActionCardProps {
  acao: Acao;
  temas: Tema[];
  expanded?: boolean;
}

function ActionCard({ acao, temas, expanded = false }: ActionCardProps) {
  const [open, setOpen] = useState(expanded);
  const tema = temas.find((t) => t.id === acao.tema);

  useEffect(() => {
    if (expanded) setOpen(true);
  }, [expanded]);

  return (
    <article
      id={acao.id}
      className="card"
      style={{ padding: 0, overflow: "hidden" }}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="action-card-head"
        style={{
          width: "100%",
          textAlign: "left",
          padding: "16px 18px",
          display: "flex",
          alignItems: "flex-start",
          gap: 16,
          background: "transparent",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
            minWidth: 48,
            paddingTop: 2,
          }}
        >
          <span
            style={{
              fontSize: 10,
              textTransform: "uppercase",
              letterSpacing: "0.14em",
              color: "var(--mute)",
              fontFamily: "var(--font-mono)",
            }}
          >
            prio
          </span>
          <span
            style={{
              fontSize: 26,
              fontWeight: 700,
              color: "var(--text)",
              fontFeatureSettings: "'tnum' 1",
              lineHeight: 1,
            }}
          >
            {acao.prioridade}
          </span>
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 6,
              marginBottom: 8,
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10.5,
                color: "var(--mute-2)",
                opacity: 0.7,
              }}
            >
              {acao.id}
            </span>
            <span
              style={{
                fontSize: 10.5,
                padding: "2px 8px",
                borderRadius: 999,
                fontWeight: 600,
                letterSpacing: "0.04em",
                background: `${tema?.color}1f`,
                color: tema?.color,
                border: `1px solid ${tema?.color}44`,
              }}
            >
              {tema?.label}
            </span>
            <BiChip tone={sevTone(acao.severidade)}>{SEV_LABEL[acao.severidade]}</BiChip>
            <BiChip tone={esfTone(acao.esforco)}>{ESF_LABEL[acao.esforco]}</BiChip>
          </div>

          <h3
            style={{
              fontSize: 15.5,
              fontWeight: 600,
              color: "var(--text)",
              lineHeight: 1.35,
              margin: "0 0 10px",
              letterSpacing: "-0.005em",
            }}
          >
            {acao.titulo}
          </h3>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0,1fr))",
              gap: 14,
              fontSize: 12.5,
            }}
          >
            <ActionMetric label="Impacto" value={impactoLabel(acao)} mono />
            <ActionMetric label="KPI alvo" value={acao.kpi_alvo} truncate />
            <ActionMetric label="Prazo" value={`${acao.prazo_dias}d`} mono />
          </div>
        </div>

        <ChevronDown
          size={18}
          style={{
            color: "var(--mute)",
            flex: "none",
            marginTop: 4,
            transition: "transform 180ms",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
          }}
        />
      </button>

      {open && (
        <div
          style={{
            padding: "8px 18px 18px",
            borderTop: "1px solid var(--border)",
            display: "grid",
            gap: 18,
          }}
        >
          {/* Diagnóstico */}
          <ActionSection
            icon={<Hash size={13} style={{ color: "var(--cyan)" }} />}
            label="Diagnóstico"
          >
            <p
              style={{
                fontSize: 13.5,
                color: "var(--text)",
                fontWeight: 500,
                lineHeight: 1.45,
                margin: "0 0 6px",
              }}
            >
              {acao.diagnostico.headline}
            </p>
            <p
              style={{
                fontSize: 12.5,
                color: "var(--text-2)",
                lineHeight: 1.55,
                margin: 0,
              }}
            >
              {acao.diagnostico.detalhe}
            </p>
            <div
              style={{
                marginTop: 10,
                display: "flex",
                flexWrap: "wrap",
                gap: 6,
                alignItems: "center",
                fontSize: 11,
              }}
            >
              <span style={{ color: "var(--mute)" }}>Métrica principal:</span>
              <span
                style={{
                  background: "rgba(34,211,238,0.10)",
                  color: "var(--cyan-2)",
                  border: "1px solid rgba(34,211,238,0.25)",
                  padding: "2px 8px",
                  borderRadius: 6,
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                }}
              >
                {acao.diagnostico.numero_principal}
              </span>
              <span style={{ color: "var(--mute)" }}>fontes:</span>
              {acao.diagnostico.fonte_quant.map((f) => (
                <span
                  key={f}
                  style={{
                    background: "var(--surface)",
                    color: "var(--mute)",
                    border: "1px solid var(--border)",
                    padding: "2px 6px",
                    borderRadius: 5,
                    fontFamily: "var(--font-mono)",
                    fontSize: 10,
                  }}
                >
                  {f}
                </span>
              ))}
            </div>
          </ActionSection>

          {/* Evidência reunião */}
          <ActionSection
            icon={<Quote size={13} style={{ color: "var(--violet)" }} />}
            label="Evidência (reunião)"
            right={
              acao.evidencia_reuniao.data !== "n/a" ? (
                <span
                  style={{
                    fontSize: 10.5,
                    color: "var(--mute)",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <Calendar size={11} />
                  {acao.evidencia_reuniao.data} · {acao.evidencia_reuniao.quem}
                </span>
              ) : null
            }
          >
            <blockquote
              style={{
                borderLeft: "2px solid var(--violet)",
                padding: "4px 0 4px 14px",
                margin: 0,
                fontStyle: "italic",
                fontSize: 13,
                color: "var(--text-2)",
                lineHeight: 1.55,
                background:
                  "linear-gradient(90deg, rgba(167,139,250,0.06), transparent 70%)",
              }}
            >
              "{acao.evidencia_reuniao.fala}"
            </blockquote>
            {acao.evidencia_reuniao.contexto_caso && (
              <p
                style={{
                  fontSize: 11.5,
                  color: "var(--mute)",
                  margin: "8px 0 0",
                }}
              >
                <strong style={{ color: "var(--text-2)" }}>Contexto: </strong>
                {acao.evidencia_reuniao.contexto_caso}
              </p>
            )}
          </ActionSection>

          {/* Hipótese + Recomendação */}
          <ActionSection
            icon={<Target size={13} style={{ color: "var(--green-2)" }} />}
            label="Hipótese & recomendação"
          >
            <p
              style={{
                fontSize: 11.5,
                color: "var(--mute)",
                margin: "0 0 10px",
                lineHeight: 1.5,
              }}
            >
              <strong style={{ color: "var(--text-2)" }}>Hipótese: </strong>
              {acao.hipotese}
            </p>
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                display: "grid",
                gap: 6,
              }}
            >
              {acao.recomendacao.map((r, i) => (
                <li
                  key={i}
                  style={{
                    fontSize: 13,
                    color: "var(--text)",
                    display: "flex",
                    gap: 8,
                    lineHeight: 1.55,
                  }}
                >
                  <span
                    style={{
                      color: "var(--green-2)",
                      fontFamily: "var(--font-mono)",
                      fontSize: 12,
                      marginTop: 2,
                    }}
                  >
                    ▸
                  </span>
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </ActionSection>

          {/* Responsável + KPI */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0,1fr))",
              gap: 14,
              fontSize: 12,
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
              <User size={13} style={{ color: "var(--mute)", marginTop: 3 }} />
              <div>
                <div
                  style={{
                    fontSize: 10,
                    textTransform: "uppercase",
                    letterSpacing: "0.12em",
                    color: "var(--mute)",
                  }}
                >
                  Responsável sugerido
                </div>
                <div style={{ color: "var(--text)" }}>{acao.responsavel_sugerido}</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
              <Target size={13} style={{ color: "var(--mute)", marginTop: 3 }} />
              <div>
                <div
                  style={{
                    fontSize: 10,
                    textTransform: "uppercase",
                    letterSpacing: "0.12em",
                    color: "var(--mute)",
                  }}
                >
                  KPI alvo
                </div>
                <div style={{ color: "var(--text)" }}>{acao.kpi_alvo}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}

function ActionMetric({
  label,
  value,
  mono,
  truncate,
}: {
  label: string;
  value: string;
  mono?: boolean;
  truncate?: boolean;
}) {
  return (
    <div style={{ minWidth: 0 }}>
      <div
        style={{
          fontSize: 10,
          textTransform: "uppercase",
          letterSpacing: "0.12em",
          color: "var(--mute)",
          marginBottom: 3,
        }}
      >
        {label}
      </div>
      <div
        title={truncate ? value : undefined}
        style={{
          color: "var(--text)",
          fontWeight: 500,
          fontFamily: mono ? "var(--font-mono)" : undefined,
          whiteSpace: truncate ? "nowrap" : "normal",
          overflow: truncate ? "hidden" : undefined,
          textOverflow: truncate ? "ellipsis" : undefined,
        }}
      >
        {value}
      </div>
    </div>
  );
}

function ActionSection({
  icon,
  label,
  right,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          marginBottom: 8,
        }}
      >
        {icon}
        <span
          style={{
            fontSize: 10.5,
            textTransform: "uppercase",
            letterSpacing: "0.16em",
            color: "var(--mute)",
            fontWeight: 600,
          }}
        >
          {label}
        </span>
        {right && <span style={{ marginLeft: "auto" }}>{right}</span>}
      </div>
      {children}
    </section>
  );
}

// ───────────────────────────────────────────────────────────────────────────────
// Page
// ───────────────────────────────────────────────────────────────────────────────

export function PlanoAcaoPage() {
  const [data, setData] = useState<PlanoAcaoData | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const [temaSel, setTemaSel] = useState<string | null>(null);
  const [sevSel, setSevSel] = useState<Acao["severidade"] | null>(null);
  const [esfSel, setEsfSel] = useState<Acao["esforco"] | null>(null);
  const [busca, setBusca] = useState("");
  const [focusedAcaoId, setFocusedAcaoId] = useState<string | null>(null);

  useEffect(() => {
    fetchPlano()
      .then(setData)
      .catch((e) => setErr(String(e)));
  }, []);

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
        const blob =
          `${a.titulo} ${a.diagnostico.headline} ${a.diagnostico.detalhe} ${a.recomendacao.join(" ")} ${a.evidencia_reuniao.fala}`.toLowerCase();
        if (!blob.includes(q)) return false;
      }
      return true;
    });
  }, [data, temaSel, sevSel, esfSel, busca]);

  if (err) {
    return (
      <div className="page" style={{ minHeight: "100vh" }}>
        <div
          style={{
            margin: "auto",
            textAlign: "center",
            display: "grid",
            gap: 8,
          }}
        >
          <AlertCircle size={32} style={{ color: "var(--red)", margin: "0 auto" }} />
          <div style={{ color: "var(--red)" }}>erro carregando plano: {err}</div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="page" style={{ minHeight: "100vh" }}>
        <div
          style={{
            margin: "auto",
            textAlign: "center",
            display: "grid",
            gap: 8,
          }}
        >
          <Loader2
            size={32}
            style={{ color: "var(--cyan)", margin: "0 auto" }}
            className="animate-spin"
          />
          <div style={{ fontSize: 13, color: "var(--mute)" }}>
            Carregando plano de ação...
          </div>
        </div>
      </div>
    );
  }

  const hasFilter = !!(temaSel || sevSel || esfSel || busca);

  // Build KPI stack items pra resumo executivo (6 destaques em 2 colunas)
  const destaquesA: BiKpiStackItem[] = data.resumo_executivo.destaques
    .slice(0, 3)
    .map((d) => ({
      label: `${d.label} — ${d.fonte}`,
      value: d.valor,
    }));
  const destaquesB: BiKpiStackItem[] = data.resumo_executivo.destaques
    .slice(3)
    .map((d) => ({
      label: `${d.label} — ${d.fonte}`,
      value: d.valor,
    }));

  return (
    <div className="page">
      {/* Header */}
      <div className="page-title">
        <div>
          <h1>Plano de Ação · Astro Distribuidora</h1>
          <div className="subtitle">{data.resumo_executivo.titulo}</div>
        </div>
        <div className="actions">
          <span
            style={{
              fontSize: 11,
              fontFamily: "var(--font-mono)",
              color: "var(--mute)",
            }}
          >
            gerado em {data.gerado_em}
          </span>
        </div>
      </div>

      {/* Destaques + Metodologia (lado a lado em telas largas) */}
      <div
        className="row"
        style={{
          display: "grid",
          gap: 16,
          gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
        }}
      >
        <BiCard>
          <BiSectionHeading strong="DESTAQUES" soft="EXECUTIVOS" />
          <BiKpiStack items={destaquesA} />
        </BiCard>
        <BiCard>
          <BiSectionHeading strong="DESTAQUES" soft="(CONT.)" />
          <BiKpiStack items={destaquesB} />
        </BiCard>
      </div>

      <BiCard>
        <BiSectionHeading strong="METODOLOGIA" />
        <p
          style={{
            fontSize: 12.5,
            color: "var(--text-2)",
            lineHeight: 1.55,
            margin: 0,
          }}
        >
          {data.metodologia}
        </p>
      </BiCard>

      {/* Matriz */}
      <BiCard
        title="Matriz Impacto × Esforço"
        hint="Clique numa bolha pra abrir a ação correspondente. Tamanho da bolha = impacto financeiro estimado."
      >
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
      </BiCard>

      {/* Filtros sticky */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 20,
          background: "rgba(8,14,18,0.85)",
          backdropFilter: "blur(12px) saturate(140%)",
          WebkitBackdropFilter: "blur(12px) saturate(140%)",
          border: "1px solid var(--border)",
          borderRadius: 14,
          padding: 12,
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
          alignItems: "center",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: 11,
            textTransform: "uppercase",
            letterSpacing: "0.16em",
            color: "var(--mute)",
            fontWeight: 600,
            marginRight: 6,
          }}
        >
          <Filter size={13} /> filtros
        </div>

        {/* Temas */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {data.temas.map((t) => {
            const active = temaSel === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTemaSel(active ? null : t.id)}
                className={cn("ind-pill", active && "active")}
                style={
                  active
                    ? {
                        background: `${t.color}22`,
                        color: t.color,
                        borderColor: `${t.color}55`,
                        boxShadow: `inset 0 0 0 1px ${t.color}33`,
                      }
                    : undefined
                }
              >
                {t.label}
              </button>
            );
          })}
        </div>

        <div
          style={{
            width: 1,
            height: 22,
            background: "var(--border)",
            margin: "0 4px",
          }}
        />

        {/* Severidade */}
        <div style={{ display: "inline-flex", gap: 6 }}>
          {(["alta", "media", "baixa"] as const).map((s) => {
            const active = sevSel === s;
            return (
              <button
                key={s}
                type="button"
                onClick={() => setSevSel(active ? null : s)}
                className={cn("ind-pill", active && "active")}
                style={{ height: 32, padding: "0 12px", fontSize: 11.5 }}
              >
                sev {s}
              </button>
            );
          })}
        </div>

        <div
          style={{
            width: 1,
            height: 22,
            background: "var(--border)",
            margin: "0 4px",
          }}
        />

        {/* Esforço */}
        <div style={{ display: "inline-flex", gap: 6 }}>
          {(["baixo", "medio", "alto"] as const).map((s) => {
            const active = esfSel === s;
            return (
              <button
                key={s}
                type="button"
                onClick={() => setEsfSel(active ? null : s)}
                className={cn("ind-pill", active && "active")}
                style={{ height: 32, padding: "0 12px", fontSize: 11.5 }}
              >
                esf {s}
              </button>
            );
          })}
        </div>

        {/* Busca */}
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar texto..."
          style={{
            marginLeft: "auto",
            minWidth: 220,
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 10,
            padding: "8px 12px",
            fontSize: 12.5,
            color: "var(--text)",
            outline: "none",
          }}
        />

        {hasFilter && (
          <button
            type="button"
            onClick={() => {
              setTemaSel(null);
              setSevSel(null);
              setEsfSel(null);
              setBusca("");
            }}
            className="btn-ghost"
            style={{ height: 32, padding: "0 12px", fontSize: 11.5 }}
          >
            <X size={13} /> Limpar
          </button>
        )}
      </div>

      {/* Lista de ações */}
      <div style={{ display: "grid", gap: 4 }}>
        <BiSectionHeading
          strong={`AÇÕES PRIORIZADAS (${acoesFiltradas.length} de ${data.acoes.length})`}
          soft="clique pra expandir diagnóstico + citação + recomendação"
        />
      </div>

      <div style={{ display: "grid", gap: 12 }}>
        {acoesFiltradas.length === 0 && (
          <BiCard>
            <div
              style={{
                textAlign: "center",
                padding: 32,
                color: "var(--mute)",
                fontSize: 13,
              }}
            >
              Nenhuma ação com os filtros atuais.
            </div>
          </BiCard>
        )}
        {acoesFiltradas.map((a) => (
          <ActionCard
            key={a.id}
            acao={a}
            temas={data.temas}
            expanded={focusedAcaoId === a.id}
          />
        ))}
      </div>

      {/* Footer fontes */}
      <BiCard>
        <BiSectionHeading strong="FONTES" soft="quantitativas + qualitativas" />
        <div style={{ display: "grid", gap: 10, fontSize: 11.5 }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "baseline" }}>
            <strong style={{ color: "var(--text-2)" }}>Quant:</strong>
            {data.fontes.quant.map((f, i) => (
              <span
                key={i}
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  color: "var(--text-2)",
                  padding: "2px 8px",
                  borderRadius: 6,
                  fontFamily: "var(--font-mono)",
                  fontSize: 10.5,
                }}
              >
                {f.arquivo}
              </span>
            ))}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "baseline" }}>
            <strong style={{ color: "var(--text-2)" }}>Qual:</strong>
            {data.fontes.qual.map((f, i) => (
              <span
                key={i}
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  color: "var(--text-2)",
                  padding: "2px 8px",
                  borderRadius: 6,
                  fontFamily: "var(--font-mono)",
                  fontSize: 10.5,
                }}
              >
                {f.data} · {f.arquivo.split(/[\\/]/).pop()}
              </span>
            ))}
          </div>
          <div style={{ color: "var(--mute)" }}>
            Gerado em {data.gerado_em}. Atualiza junto com o pipeline diário.
          </div>
        </div>
      </BiCard>
    </div>
  );
}
