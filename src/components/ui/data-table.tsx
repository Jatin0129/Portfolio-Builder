import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export interface DataTableColumn<TRow> {
  key: string;
  header: string;
  className?: string;
  cellClassName?: string;
  render: (row: TRow) => ReactNode;
}

export function DataTable<TRow>({
  columns,
  rows,
  getRowKey,
  emptyState = "No rows available.",
  className,
  rowClassName,
}: {
  columns: DataTableColumn<TRow>[];
  rows: TRow[];
  getRowKey: (row: TRow) => string;
  emptyState?: ReactNode;
  className?: string;
  rowClassName?: string;
}) {
  return (
    <div className={cn("panel-border bg-card overflow-x-auto", className)}>
      <table className="min-w-full text-left font-mono-tight text-[11px] tabular-nums">
        <thead className="border-b border-border bg-muted/40 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
          <tr>
            {columns.map((column) => (
              <th key={column.key} className={cn("px-2 py-1.5 font-semibold", column.className)}>
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length ? (
            rows.map((row) => (
              <tr key={getRowKey(row)} className={cn("border-b border-border/40 last:border-b-0 hover:bg-muted/30", rowClassName)}>
                {columns.map((column) => (
                  <td key={column.key} className={cn("px-2 py-1.5 align-middle", column.cellClassName)}>
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td className="px-3 py-6 text-center text-[11px] text-muted-foreground" colSpan={columns.length}>
                {emptyState}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
