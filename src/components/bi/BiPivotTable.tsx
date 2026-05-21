import { useMemo } from 'react';
import { fmtBRL } from '@/lib/bi/theme';

interface BiPivotTableProps {
  rows: Array<Record<string, unknown>>;
  /** Coluna que vira label de linha. Ex: "categoria". */
  rowKey: string;
  /** Coluna que vira label de coluna. Ex: "mes". */
  colKey: string;
  /** Coluna agregada como valor. Ex: "valor". */
  valueKey: string;
  /** Função de formatação do valor. Default fmtBRL. */
  format?: (n: number) => string;
  maxHeight?: number;
}

/**
 * Pivot mês × categoria. Usa classes `table.t` + `.t-scroll` do molde.
 * Primeira coluna sticky à esquerda (preserva pivot UX). Total ao final.
 * Precisa estar dentro de `.bi-dashboard-theme`.
 */
export function BiPivotTable({
  rows,
  rowKey,
  colKey,
  valueKey,
  format = fmtBRL,
  maxHeight = 480,
}: BiPivotTableProps) {
  const { rowLabels, colLabels, matrix, rowTotals, colTotals, grandTotal } = useMemo(() => {
    const rowSet = new Set<string>();
    const colSet = new Set<string>();
    for (const r of rows) {
      rowSet.add(String(r[rowKey]));
      colSet.add(String(r[colKey]));
    }
    const rowLabels = [...rowSet];
    const colLabels = [...colSet].sort();

    const matrix: Record<string, Record<string, number>> = {};
    for (const r of rowLabels) {
      matrix[r] = {};
      for (const c of colLabels) matrix[r][c] = 0;
    }
    for (const r of rows) {
      const rk = String(r[rowKey]);
      const ck = String(r[colKey]);
      const v = Number(r[valueKey]) || 0;
      matrix[rk][ck] += v;
    }

    const rowTotals: Record<string, number> = {};
    const colTotals: Record<string, number> = {};
    let grandTotal = 0;
    for (const r of rowLabels) {
      let sum = 0;
      for (const c of colLabels) {
        sum += matrix[r][c];
        colTotals[c] = (colTotals[c] || 0) + matrix[r][c];
      }
      rowTotals[r] = sum;
      grandTotal += sum;
    }

    return { rowLabels, colLabels, matrix, rowTotals, colTotals, grandTotal };
  }, [rows, rowKey, colKey, valueKey]);

  if (rows.length === 0) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '48px 16px',
          color: 'var(--mute)',
          border: '1px solid var(--border)',
          borderRadius: 10,
          fontSize: 13,
        }}
      >
        Sem dados — vá em Conexão de Dados para subir um Excel.
      </div>
    );
  }

  // Sticky first col bg precisa ser opaca (senão headers vazam por baixo).
  const stickyColStyle = {
    position: 'sticky' as const,
    left: 0,
    background: 'var(--surface)',
    zIndex: 2,
  };

  return (
    <div className="t-scroll" style={{ maxHeight, overflow: 'auto' }}>
      <table className="t">
        <thead>
          <tr>
            <th style={{ ...stickyColStyle, zIndex: 3 }}>{rowKey}</th>
            {colLabels.map((c) => (
              <th key={c} className="num">
                {c}
              </th>
            ))}
            <th className="num">Total</th>
          </tr>
        </thead>
        <tbody>
          {rowLabels.map((r) => (
            <tr key={r}>
              <td style={stickyColStyle}>{r}</td>
              {colLabels.map((c) => (
                <td
                  key={c}
                  className="num"
                  style={
                    matrix[r][c] === 0
                      ? { color: 'var(--mute)' }
                      : undefined
                  }
                >
                  {matrix[r][c] === 0 ? '—' : format(matrix[r][c])}
                </td>
              ))}
              <td className="num bold">{format(rowTotals[r])}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="total">
            <td style={{ ...stickyColStyle, zIndex: 3 }}>Total</td>
            {colLabels.map((c) => (
              <td key={c} className="num bold">
                {format(colTotals[c] || 0)}
              </td>
            ))}
            <td className="num bold">{format(grandTotal)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
