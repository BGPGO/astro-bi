import { ReactNode } from 'react';
import { BiSlicer } from './BiSlicer';
import RefreshCw from 'lucide-react/dist/esm/icons/refresh-cw';
import Upload from 'lucide-react/dist/esm/icons/upload';
import ChevronRight from 'lucide-react/dist/esm/icons/chevron-right';

interface BiHeaderProps {
  clientName?: string;
  period: string;
  onPeriodChange: (period: string) => void;
  empresa?: string;
  empresas?: string[];
  onEmpresaChange?: (empresa: string) => void;
  /** Eixo de agregação: 'depara' (default) ou 'centro_custo'. */
  axis?: 'depara' | 'centro_custo';
  onAxisChange?: (axis: 'depara' | 'centro_custo') => void;
  eixoData?: 'pagamento' | 'vencimento' | 'competencia';
  onEixoDataChange?: (e: 'pagamento' | 'vencimento' | 'competencia') => void;
  /** Filtro de status dos títulos. */
  statusFilter?: 'realizado' | 'a_realizar' | 'vencido' | 'todos';
  onStatusFilterChange?: (s: 'realizado' | 'a_realizar' | 'vencido' | 'todos') => void;
  onImport?: () => void;
  onRefresh?: () => void;
  rightSlot?: ReactNode;
}

/**
 * Header global do BI (molde-gobi).
 * Filtros no centro, ações à direita.
 */
export const BiHeader = ({
  clientName,
  period,
  onPeriodChange,
  empresa,
  empresas,
  onEmpresaChange,
  axis,
  onAxisChange,
  eixoData,
  onEixoDataChange,
  statusFilter,
  onStatusFilterChange,
  onImport,
  onRefresh,
  rightSlot,
}: BiHeaderProps) => {
  return (
    <header className="header" style={{ height: 'auto', minHeight: 70, paddingTop: 10, paddingBottom: 10 }}>
      <div className="breadcrumb" style={{ flexShrink: 0 }}>
        <span>BGP GO BI</span>
        <ChevronRight />
        <b>{clientName ?? 'Dashboard'}</b>
      </div>

      {/* Filtros centralizados */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, flexWrap: 'wrap', flex: 1, justifyContent: 'center', padding: '0 16px' }}>
        <BiSlicer
          label="Período"
          value={period}
          onChange={onPeriodChange}
          options={[
            { value: 'last-12m', label: 'Últimos 12m' },
            { value: 'last-6m', label: 'Últimos 6m' },
            { value: 'ytd', label: 'No ano' },
            { value: 'last-month', label: 'Mês anterior' },
            { value: 'all', label: 'Todo período' },
          ]}
        />

        {axis && onAxisChange && (
          <BiSlicer
            label="Classificar"
            value={axis}
            onChange={(v) => onAxisChange(v as 'depara' | 'centro_custo')}
            options={[
              { value: 'depara', label: 'De Para' },
              { value: 'centro_custo', label: 'Centro Custo' },
            ]}
          />
        )}

        {statusFilter && onStatusFilterChange && (
          <BiSlicer
            label="Visualizar"
            value={statusFilter}
            onChange={(v) => onStatusFilterChange(v as 'realizado' | 'a_realizar' | 'vencido' | 'todos')}
            options={[
              { value: 'realizado', label: 'Realizado' },
              { value: 'a_realizar', label: 'A Realizar' },
              { value: 'vencido', label: 'Vencido' },
              { value: 'todos', label: 'Todos' },
            ]}
          />
        )}

        {eixoData && onEixoDataChange && statusFilter === 'todos' && (
          <BiSlicer
            label="Eixo de Data"
            value={eixoData}
            onChange={(v) => onEixoDataChange(v as 'pagamento' | 'vencimento' | 'competencia')}
            options={[
              { value: 'pagamento', label: 'Pagamento' },
              { value: 'vencimento', label: 'Vencimento' },
              { value: 'competencia', label: 'Competência' },
            ]}
          />
        )}

        {empresas && empresas.length > 1 && empresa && onEmpresaChange && (
          <BiSlicer
            label="Empresa"
            value={empresa}
            onChange={onEmpresaChange}
            options={empresas.map((e) => ({ value: e, label: e }))}
          />
        )}
      </div>

      {/* Ações à direita */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
        {onImport && (
          <button
            type="button"
            className="btn-ghost"
            onClick={onImport}
            title="Subir dados"
          >
            <Upload />
            <span>Importar</span>
          </button>
        )}
        {onRefresh && (
          <button
            type="button"
            className="hd-icon-btn"
            onClick={onRefresh}
            title="Atualizar dados"
            aria-label="Atualizar dados"
          >
            <RefreshCw />
          </button>
        )}
        {rightSlot}
      </div>
    </header>
  );
};
