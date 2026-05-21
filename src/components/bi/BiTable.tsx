import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface BiTableColumn<T> {
  key: keyof T & string;
  header: string;
  align?: 'left' | 'right' | 'center';
  /** Renderizador customizado da célula. */
  render?: (row: T) => ReactNode;
  /** Largura fixa em px (opcional). */
  width?: number;
  /** Marcar célula como numérica (mono + right align via `.num`). */
  numeric?: boolean;
}

interface BiTableProps<T> {
  columns: BiTableColumn<T>[];
  rows: T[];
  /** Mensagem quando rows.length === 0. */
  emptyMessage?: string;
  /** Linha de totais (opcional). Renderizada como `tr.total`. */
  totalsRow?: T;
  className?: string;
  /** Altura máxima com scroll — usa `.t-scroll` do molde. */
  maxHeight?: number;
}

/**
 * Tabela detalhada do BI usando classes do molde.
 * `table.t` (header uppercase + sticky) + `.t-scroll` (max-height + custom scrollbar).
 * Precisa estar dentro de `.bi-dashboard-theme`.
 */
export function BiTable<T extends Record<string, unknown>>({
  columns,
  rows,
  emptyMessage = 'Sem dados ainda — vá em Conexão de Dados para subir um Excel.',
  totalsRow,
  className,
  maxHeight,
}: BiTableProps<T>) {
  const tableEl = (
    <table className="t">
      <thead>
        <tr>
          {columns.map((col) => (
            <th
              key={col.key}
              className={cn(col.numeric && 'num')}
              style={{
                textAlign: col.align ?? (col.numeric ? 'right' : 'left'),
                width: col.width,
              }}
            >
              {col.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 ? (
          <tr>
            <td
              colSpan={columns.length}
              style={{
                textAlign: 'center',
                padding: '32px 14px',
                color: 'var(--mute)',
              }}
            >
              {emptyMessage}
            </td>
          </tr>
        ) : (
          rows.map((row, idx) => (
            <tr key={idx}>
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={cn(col.numeric && 'num')}
                  style={{
                    textAlign: col.align ?? (col.numeric ? 'right' : 'left'),
                  }}
                >
                  {col.render ? col.render(row) : (row[col.key] as ReactNode)}
                </td>
              ))}
            </tr>
          ))
        )}
      </tbody>
      {totalsRow && rows.length > 0 && (
        <tfoot>
          <tr className="total">
            {columns.map((col) => (
              <td
                key={col.key}
                className={cn(col.numeric && 'num', 'bold')}
                style={{
                  textAlign: col.align ?? (col.numeric ? 'right' : 'left'),
                }}
              >
                {col.render ? col.render(totalsRow) : (totalsRow[col.key] as ReactNode)}
              </td>
            ))}
          </tr>
        </tfoot>
      )}
    </table>
  );

  if (maxHeight) {
    return (
      <div className={cn('t-scroll', className)} style={{ maxHeight }}>
        {tableEl}
      </div>
    );
  }

  return <div className={className}>{tableEl}</div>;
}
