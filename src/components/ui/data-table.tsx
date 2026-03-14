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
    <div className={cn("overflow-x-auto rounded-[24px] border border-white/10 bg-white/4", className)}>
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-white/8 bg-[#0c1522] text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          <tr>
            {columns.map((column) => (
              <th key={column.key} className={cn("px-4 py-3 font-medium", column.className)}>
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length ? (
            rows.map((row) => (
              <tr key={getRowKey(row)} className={cn("border-b border-white/6 last:border-b-0", rowClassName)}>
                {columns.map((column) => (
                  <td key={column.key} className={cn("px-4 py-4 align-top", column.cellClassName)}>
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td className="px-4 py-10 text-center text-sm text-muted-foreground" colSpan={columns.length}>
                {emptyState}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
