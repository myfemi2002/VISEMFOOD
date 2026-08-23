import type { ReactNode } from "react";

type Column<T> = {
  key: string;
  header: string;
  cell: (row: T) => ReactNode;
};

type DataTableProps<T> = {
  rows: T[];
  columns: Column<T>[];
};

export function DataTable<T>({ rows, columns }: DataTableProps<T>) {
  return (
    <div className="card-surface overflow-hidden">
      <div className="mobile-table-cards md:hidden">
        {rows.length === 0 ? <div className="empty-state">No records match the current filter.</div> : null}
        {rows.map((row, index) => (
          <article key={index} className="mobile-table-card">
            <div className="space-y-4">
              {columns.map((column) => (
                <div key={column.key} className="mobile-table-row">
                  <span className="mobile-table-label">{column.header}</span>
                  <div>{column.cell(row)}</div>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>

      <div className="table-scroll hidden md:block">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.key}>{column.header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="empty-state">
                  No records match the current filter.
                </td>
              </tr>
            ) : null}
            {rows.map((row, index) => (
              <tr key={index}>
                {columns.map((column) => (
                  <td key={column.key}>{column.cell(row)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
