"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { DashEmptyState, DashTable, DashTableShell, DashTd, DashTh } from "@/components/dashboard/ui";
import { dashCard } from "@/styles/dashboard";

export type DashColumn<T> = {
  id: string;
  header: ReactNode;
  cell: (row: T) => ReactNode;
  className?: string;
  headClassName?: string;
};

export function DashDataTable<T>({
  columns,
  rows,
  rowKey,
  emptyTitle = "Пусто",
  emptyLead,
  actions,
  className,
}: {
  columns: DashColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  emptyTitle?: string;
  emptyLead?: string;
  actions?: (row: T) => ReactNode;
  className?: string;
}) {
  if (rows.length === 0) {
    return (
      <div className={cn(dashCard, "p-6", className)}>
        <DashEmptyState title={emptyTitle} lead={emptyLead} />
      </div>
    );
  }

  return (
    <DashTableShell className={className}>
      <DashTable>
        <thead>
          <tr>
            {columns.map((col) => (
              <DashTh key={col.id} className={col.headClassName}>
                {col.header}
              </DashTh>
            ))}
            {actions ? <DashTh className="w-[1%] whitespace-nowrap"> </DashTh> : null}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={rowKey(row)} className="border-t border-black/[0.05]">
              {columns.map((col) => (
                <DashTd key={col.id} className={col.className}>
                  {col.cell(row)}
                </DashTd>
              ))}
              {actions ? (
                <DashTd className="whitespace-nowrap text-right">
                  {actions(row)}
                </DashTd>
              ) : null}
            </tr>
          ))}
        </tbody>
      </DashTable>
    </DashTableShell>
  );
}
