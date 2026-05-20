import { useDuckDB } from "@/lib/useDuckDB";
import { FiltersProvider } from "@/state/filters";
import { Header } from "./components/Header";
import { FilterBar } from "./components/FilterBar";
import { Kpis } from "./components/Kpis";
import { ChartsTop, ChartsMid } from "./components/Charts";
import { HierarchyTable } from "./components/HierarchyTable";
import { BottomBars } from "./components/BottomBars";
import { Section } from "./components/Card";
import { Loader2 } from "lucide-react";

export function App() {
  const { ready, error, bootMs, rowCount } = useDuckDB();

  if (!ready) {
    return (
      <div className="min-h-screen grid place-items-center">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 text-accent animate-spin mx-auto" />
          <div className="text-sm text-muted">
            {error ? (
              <span className="text-accent-rose">erro: {error}</span>
            ) : (
              <>Inicializando DuckDB-WASM + carregando parquet (3.8MB)...</>
            )}
          </div>
          {bootMs != null && <div className="text-[11px] text-muted mono">{bootMs}ms</div>}
        </div>
      </div>
    );
  }

  return (
    <FiltersProvider>
      <Header bootMs={bootMs} rowCount={rowCount} />
      <FilterBar />
      <main className="max-w-[1600px] mx-auto px-6 py-6 space-y-6">
        <Section>
          <Kpis />
        </Section>
        <ChartsTop />
        <ChartsMid />
        <Section title="Hierarquia de Produtos">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <HierarchyTable title="Por Marca" levels={["marca", "categoria_mae", "sub_categoria", "seo_title"]} topN={12} />
            <HierarchyTable title="Por Categoria" levels={["categoria_mae", "sub_categoria", "seo_title"]} topN={12} />
          </div>
        </Section>
        <BottomBars />
        <footer className="text-[11px] text-muted text-center py-6 border-t border-ink-DEFAULT">
          DuckDB-WASM · parquet {rowCount?.toLocaleString("pt-BR")} linhas · CMV via preco_custo, CFV 6,16% estimado
        </footer>
      </main>
    </FiltersProvider>
  );
}
