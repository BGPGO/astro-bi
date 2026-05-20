import { ExternalLink, ListChecks, BarChart3 } from "lucide-react";
import { cls } from "@/lib/fmt";

const LEGACY_BASE = (import.meta.env.VITE_LEGACY_BASE as string) || "https://astro-bi-legacy.187.77.238.125.sslip.io";

const LEGACY_PAGES = [
  { label: "Giro Estoque", path: "/Giro_Estoque" },
  { label: "Frete RJ", path: "/Frete_RJ" },
  { label: "Pedido Mínimo", path: "/Pedido_Minimo" },
  { label: "Recompra", path: "/Recompra" },
  { label: "Campanhas", path: "/Campanhas" },
  { label: "Agressividade", path: "/Agressividade" },
  { label: "Curva ABC", path: "/Curva_ABC" },
];

interface Props {
  bootMs: number | null;
  rowCount: number | null;
  activeRoute: "dash" | "plano";
}

export function Header({ bootMs, rowCount, activeRoute }: Props) {
  return (
    <header className="sticky top-0 z-50 bg-bg/90 backdrop-blur border-b border-ink-DEFAULT">
      <div className="max-w-[1600px] mx-auto px-6 py-3 flex items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-accent-purple grid place-items-center text-bg font-extrabold">A</div>
          <div className="flex flex-col leading-tight">
            <span className="font-semibold text-white">Astro BI</span>
            <span className="text-[11px] text-muted">{activeRoute === "plano" ? "Plano de Ação" : "Dash"}</span>
          </div>
        </div>
        <nav className="hidden lg:flex items-center gap-1 text-sm">
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); window.location.hash = ""; }}
            className={cls(
              "px-3 py-1.5 rounded-md font-medium flex items-center gap-1.5 transition-colors",
              activeRoute === "dash" ? "bg-accent/10 text-accent" : "text-muted hover:bg-bg-elev hover:text-white"
            )}
          >
            <BarChart3 className="w-3.5 h-3.5" /> Dash
          </a>
          <a
            href="#plano"
            className={cls(
              "px-3 py-1.5 rounded-md font-medium flex items-center gap-1.5 transition-colors",
              activeRoute === "plano" ? "bg-accent-green/10 text-accent-green" : "text-muted hover:bg-bg-elev hover:text-white"
            )}
          >
            <ListChecks className="w-3.5 h-3.5" /> Plano de Ação
          </a>
          <div className="w-px h-5 bg-ink-DEFAULT mx-1" />
          {LEGACY_PAGES.map((p) => (
            <a
              key={p.path}
              href={`${LEGACY_BASE}${p.path}`}
              target="_blank"
              rel="noreferrer"
              className="px-2.5 py-1.5 rounded-md text-muted hover:bg-bg-elev hover:text-white transition-colors flex items-center gap-1 text-[13px]"
            >
              {p.label}
              <ExternalLink className="w-3 h-3 opacity-60" />
            </a>
          ))}
        </nav>
        <div className="text-[11px] text-muted num">
          {rowCount != null && <span>{rowCount.toLocaleString("pt-BR")} linhas</span>}
          {bootMs != null && <span className="ml-3">boot {bootMs}ms</span>}
        </div>
      </div>
    </header>
  );
}
