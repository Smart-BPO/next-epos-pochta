"use client";

import {
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { cn } from "@/lib/cn";
import {
  DashEmptyState,
  DashTable,
  DashTableShell,
  DashTd,
  DashTh,
} from "@/components/dashboard/ui";
import { useDashLocale, useDashT } from "@/components/dashboard/DashLocaleProvider";
import { dashFormat, dashIntlLocale } from "@/i18n/dashboard";
import {
  dashBtnGhost,
  dashBtnSecondary,
  dashCard,
  dashInput,
  dashSelect,
} from "@/styles/dashboard";

export type DashListSortDir = "asc" | "desc";

export type DashListColumn<T> = {
  id: string;
  header: string;
  cell: (row: T) => ReactNode;
  /** Value used for sorting; omit to disable sort on this column */
  sortValue?: (row: T) => string | number | boolean | null | undefined | Date;
  /** Contribute to global search (string or extractor) */
  searchText?: boolean | ((row: T) => string);
  className?: string;
  headClassName?: string;
  /** Hide from auto card body (still in table) */
  hideInCard?: boolean;
};

export type DashListFilterDef<T> = {
  id: string;
  label: string;
  allLabel?: string;
  options: Array<{ value: string; label: string }>;
  getValue: (row: T) => string;
};

export type DashListViewMode = "table" | "cards" | "kanban";

const PAGE_SIZES = [10, 25, 50, 100] as const;

function compareValues(
  a: string | number | boolean | null | undefined | Date,
  b: string | number | boolean | null | undefined | Date,
  intlLocale: string,
): number {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  if (a instanceof Date || b instanceof Date) {
    const ta = a instanceof Date ? a.getTime() : new Date(String(a)).getTime();
    const tb = b instanceof Date ? b.getTime() : new Date(String(b)).getTime();
    return ta - tb;
  }
  if (typeof a === "number" && typeof b === "number") return a - b;
  if (typeof a === "boolean" && typeof b === "boolean") {
    return Number(a) - Number(b);
  }
  return String(a).localeCompare(String(b), intlLocale, {
    numeric: true,
    sensitivity: "base",
  });
}

function viewStorageKey(key: string) {
  return `dash-list-view:${key}`;
}

function readStoredView(key?: string): DashListViewMode | null {
  if (!key || typeof window === "undefined") return null;
  try {
    const v = window.localStorage.getItem(viewStorageKey(key));
    return v === "table" || v === "cards" || v === "kanban" ? v : null;
  } catch {
    return null;
  }
}

function subscribeView(key: string | undefined, onStoreChange: () => void) {
  if (!key || typeof window === "undefined") return () => {};
  const eventName = viewStorageKey(key);
  const onStorage = (e: StorageEvent) => {
    if (e.key === eventName) onStoreChange();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(eventName, onStoreChange);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(eventName, onStoreChange);
  };
}

function usePersistedView(
  storageKey: string | undefined,
  defaultView: DashListViewMode,
): [DashListViewMode, (next: DashListViewMode) => void] {
  const [localView, setLocalView] = useState(defaultView);
  const stored = useSyncExternalStore(
    (onChange) => subscribeView(storageKey, onChange),
    () => readStoredView(storageKey) ?? defaultView,
    () => defaultView,
  );
  const view = storageKey ? stored : localView;

  function setViewPersist(next: DashListViewMode) {
    if (!storageKey) {
      setLocalView(next);
      return;
    }
    try {
      window.localStorage.setItem(viewStorageKey(storageKey), next);
      window.dispatchEvent(new Event(viewStorageKey(storageKey)));
    } catch {
      // ignore
    }
  }

  return [view, setViewPersist];
}

export function DashListView<T>({
  rows,
  rowKey,
  columns,
  filters,
  actions,
  renderCard,
  renderKanban,
  title,
  emptyTitle,
  emptyLead,
  defaultView = "table",
  defaultPageSize = 25,
  defaultSortId,
  defaultSortDir = "desc",
  storageKey,
  toolbarExtra,
  className,
}: {
  rows: T[];
  rowKey: (row: T) => string;
  columns: DashListColumn<T>[];
  filters?: DashListFilterDef<T>[];
  actions?: (row: T) => ReactNode;
  /** Custom card; default builds from columns */
  renderCard?: (row: T, actionsNode: ReactNode) => ReactNode;
  /** When set, enables Kanban in the view toggle and renders it for filtered rows */
  renderKanban?: (rows: T[]) => ReactNode;
  title?: string;
  emptyTitle?: string;
  emptyLead?: string;
  defaultView?: DashListViewMode;
  defaultPageSize?: number;
  defaultSortId?: string;
  defaultSortDir?: DashListSortDir;
  storageKey?: string;
  toolbarExtra?: ReactNode;
  className?: string;
}) {
  const t = useDashT();
  const { locale } = useDashLocale();
  const intlLocale = dashIntlLocale(locale);
  const [view, setViewPersist] = usePersistedView(storageKey, defaultView);
  const kanbanEnabled = Boolean(renderKanban);
  const effectiveView: DashListViewMode =
    view === "kanban" && !kanbanEnabled ? "table" : view;
  const [query, setQuery] = useState("");
  const [filterState, setFilterState] = useState<Record<string, string>>({});
  const [sortId, setSortId] = useState<string | null>(
    () =>
      defaultSortId ??
      columns.find((c) => c.sortValue)?.id ??
      null,
  );
  const [sortDir, setSortDir] = useState<DashListSortDir>(defaultSortDir);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  const activeFilters = useMemo(() => {
    if (effectiveView !== "kanban") return filters ?? [];
    // Status is expressed as columns on the board.
    return (filters ?? []).filter((f) => f.id !== "status");
  }, [filters, effectiveView]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((row) => {
      for (const f of activeFilters) {
        const selected = filterState[f.id] ?? "";
        if (selected && f.getValue(row) !== selected) return false;
      }
      if (!q) return true;
      const hay = columns
        .map((col) => {
          if (!col.searchText) return "";
          if (typeof col.searchText === "function") return col.searchText(row);
          const v = col.sortValue?.(row);
          if (v == null) return "";
          return String(v);
        })
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [rows, query, filterState, activeFilters, columns]);

  const sorted = useMemo(() => {
    const col = columns.find((c) => c.id === sortId && c.sortValue);
    if (!col?.sortValue) return filtered;
    const copy = [...filtered];
    copy.sort((a, b) => {
      const cmp = compareValues(
        col.sortValue!(a),
        col.sortValue!(b),
        intlLocale,
      );
      return sortDir === "asc" ? cmp : -cmp;
    });
    return copy;
  }, [filtered, columns, sortId, sortDir, intlLocale]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(page, pageCount - 1);
  const pageRows = sorted.slice(
    safePage * pageSize,
    safePage * pageSize + pageSize,
  );

  function setQueryReset(next: string) {
    setQuery(next);
    setPage(0);
  }

  function setFilterReset(id: string, value: string) {
    setFilterState((prev) => ({ ...prev, [id]: value }));
    setPage(0);
  }

  function setPageSizeReset(next: number) {
    setPageSize(next);
    setPage(0);
  }

  function toggleSort(id: string) {
    const col = columns.find((c) => c.id === id);
    if (!col?.sortValue) return;
    if (sortId === id) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortId(id);
      setSortDir("asc");
    }
  }

  if (rows.length === 0) {
    return (
      <div className={cn(dashCard, "p-6", className)}>
        <DashEmptyState
          title={emptyTitle || t.common.emptyTitle}
          lead={emptyLead}
        />
      </div>
    );
  }

  const fieldLabel =
    "text-[0.65rem] font-semibold uppercase tracking-wide text-black/40 leading-none";
  /** Shared control height so search / select / view toggle share one baseline. */
  const fieldControl = cn(dashInput, "h-10 py-0 leading-10");
  const selectControl = cn(dashSelect, "h-10 py-0 leading-10");

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex flex-wrap items-end gap-2">
          <label className="grid min-w-[12rem] flex-1 gap-1.5">
            <span className={fieldLabel}>{t.common.search}</span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQueryReset(e.target.value)}
              placeholder={t.common.searchPlaceholder}
              className={fieldControl}
            />
          </label>

          {(activeFilters ?? []).map((f) => (
            <label key={f.id} className="grid gap-1.5">
              <span className={fieldLabel}>{f.label}</span>
              <select
                className={cn(selectControl, "min-w-[8rem]")}
                value={filterState[f.id] ?? ""}
                onChange={(e) => setFilterReset(f.id, e.target.value)}
              >
                <option value="">{f.allLabel ?? t.common.all}</option>
                {f.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>
          ))}

          {effectiveView !== "kanban" ? (
            <label className="grid gap-1.5">
              <span className={fieldLabel}>{t.common.perPage}</span>
              <select
                className={cn(selectControl, "min-w-[5rem]")}
                value={pageSize}
                onChange={(e) => setPageSizeReset(Number(e.target.value))}
              >
                {PAGE_SIZES.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          <div className="ml-auto flex flex-wrap items-end gap-2">
            {toolbarExtra}
            <div className="grid gap-1.5">
              <span className={fieldLabel}>{t.common.view}</span>
              <div
                className="inline-flex h-10 items-stretch rounded-xl border border-black/10 bg-white p-0.5"
                role="group"
                aria-label={t.common.view}
              >
                <button
                  type="button"
                  className={cn(
                    "rounded-[0.625rem] px-3 text-xs font-semibold transition",
                    effectiveView === "table"
                      ? "bg-primary text-white"
                      : "text-black/55 hover:bg-black/[0.03]",
                  )}
                  onClick={() => setViewPersist("table")}
                >
                  {t.common.table}
                </button>
                <button
                  type="button"
                  className={cn(
                    "rounded-[0.625rem] px-3 text-xs font-semibold transition",
                    effectiveView === "cards"
                      ? "bg-primary text-white"
                      : "text-black/55 hover:bg-black/[0.03]",
                  )}
                  onClick={() => setViewPersist("cards")}
                >
                  {t.common.cards}
                </button>
                {kanbanEnabled ? (
                  <button
                    type="button"
                    className={cn(
                      "rounded-[0.625rem] px-3 text-xs font-semibold transition",
                      effectiveView === "kanban"
                        ? "bg-primary text-white"
                        : "text-black/55 hover:bg-black/[0.03]",
                    )}
                    onClick={() => setViewPersist("kanban")}
                  >
                    {t.common.kanban}
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </div>

      {effectiveView !== "kanban" ? (
      <p className="m-0 text-xs text-black/45">
        {sorted.length === 0
          ? t.common.nothingFound
          : `${dashFormat(t.common.showing, {
              from: safePage * pageSize + 1,
              to: Math.min((safePage + 1) * pageSize, sorted.length),
              total: sorted.length,
            })}${
              rows.length !== sorted.length
                ? ` ${dashFormat(t.common.totalHint, { n: rows.length })}`
                : ""
            }`}
      </p>
      ) : (
        <p className="m-0 text-xs text-black/45">
          {filtered.length === 0
            ? t.common.nothingFound
            : `${filtered.length}`}
        </p>
      )}

      {effectiveView === "kanban" && renderKanban ? (
        filtered.length === 0 ? (
          <div className={`${dashCard} p-6`}>
            <DashEmptyState
              title={t.common.nothingFound}
              lead={t.common.emptyFilteredLead}
            />
          </div>
        ) : (
          renderKanban(filtered)
        )
      ) : sorted.length === 0 ? (
        <div className={`${dashCard} p-6`}>
          <DashEmptyState
            title={t.common.nothingFound}
            lead={t.common.emptyFilteredLead}
          />
        </div>
      ) : effectiveView === "table" ? (
        <DashTableShell title={title}>
          <DashTable>
            <thead>
              <tr>
                {columns.map((col) => (
                  <DashTh key={col.id} className={col.headClassName}>
                    {col.sortValue ? (
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 font-semibold text-inherit hover:text-ink"
                        onClick={() => toggleSort(col.id)}
                      >
                        {col.header}
                        <span className="text-[0.65rem] text-black/35">
                          {sortId === col.id
                            ? sortDir === "asc"
                              ? "↑"
                              : "↓"
                            : "↕"}
                        </span>
                      </button>
                    ) : (
                      col.header
                    )}
                  </DashTh>
                ))}
                {actions ? (
                  <DashTh className="w-[1%] whitespace-nowrap"> </DashTh>
                ) : null}
              </tr>
            </thead>
            <tbody>
              {pageRows.map((row) => (
                <tr key={rowKey(row)} className="hover:bg-black/[0.015]">
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
      ) : (
        <ul className="m-0 grid list-none gap-3 p-0 sm:grid-cols-2 xl:grid-cols-3">
          {pageRows.map((row) => {
            const actionsNode = actions?.(row) ?? null;
            if (renderCard) {
              return (
                <li key={rowKey(row)} className={dashCard}>
                  {renderCard(row, actionsNode)}
                </li>
              );
            }
            return (
              <li key={rowKey(row)} className={`${dashCard} flex flex-col gap-3 p-4`}>
                <div className="grid gap-2">
                  {columns
                    .filter((c) => !c.hideInCard)
                    .map((col) => (
                      <div key={col.id} className="min-w-0">
                        <div className="text-[0.65rem] font-semibold uppercase tracking-wide text-black/35">
                          {col.header}
                        </div>
                        <div className="mt-0.5 text-sm text-ink">
                          {col.cell(row)}
                        </div>
                      </div>
                    ))}
                </div>
                {actionsNode ? (
                  <div className="mt-auto flex flex-nowrap justify-end gap-1 overflow-x-auto border-t border-black/[0.06] pt-3">
                    {actionsNode}
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}

      {effectiveView !== "kanban" && pageCount > 1 ? (
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className={dashBtnSecondary}
            disabled={safePage <= 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
          >
            {t.common.prev}
          </button>
          <span className="text-xs font-medium text-black/50">
            {dashFormat(t.common.pageOf, {
              page: safePage + 1,
              pages: pageCount,
            })}
          </span>
          <button
            type="button"
            className={dashBtnSecondary}
            disabled={safePage >= pageCount - 1}
            onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
          >
            {t.common.next}
          </button>
          <button
            type="button"
            className={dashBtnGhost}
            onClick={() => {
              setQuery("");
              setFilterState({});
              setPage(0);
            }}
          >
            {t.common.resetFilters}
          </button>
        </div>
      ) : query || Object.values(filterState).some(Boolean) ? (
        <button
          type="button"
          className={dashBtnGhost}
          onClick={() => {
            setQuery("");
            setFilterState({});
            setPage(0);
          }}
        >
          {t.common.resetFilters}
        </button>
      ) : null}
    </div>
  );
}
