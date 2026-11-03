"use client";

import {
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Columns3,
  Rows3,
  X,
} from "lucide-react";
import { cn } from "@/lib/cn";
import {
  DashEmptyState,
  DashTable,
  DashTableShell,
  DashTd,
  DashTh,
} from "@/components/dashboard/ui";
import { DashIconButton } from "@/components/dashboard/ds/DashIconButton";
import { DashPopover } from "@/components/dashboard/ds/DashPopover";
import { useDashLocale, useDashT } from "@/components/dashboard/DashLocaleProvider";
import { dashFormat, dashIntlLocale } from "@/i18n/dashboard";
import {
  dashBtnGhost,
  dashBtnSecondary,
  dashCard,
  dashInputSm,
  dashSelectSm,
} from "@/styles/dashboard";

export type DashListSortDir = "asc" | "desc";
export type DashListDensity = "comfortable" | "compact";

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
  /** Sticky first data column when scrolling horizontally */
  sticky?: boolean;
  /** Default visible in column picker (default true) */
  defaultVisible?: boolean;
  /** CSV export value */
  exportValue?: (row: T) => string;
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

function colsStorageKey(key: string) {
  return `dash-list-cols:${key}`;
}

function densityStorageKey(key: string) {
  return `dash-list-density:${key}`;
}

/** Stable empty snapshot — fresh `[]` from getSnapshot causes React #185. */
const EMPTY_HIDDEN_COLS: string[] = [];

const hiddenColsCache = new Map<string, { raw: string; value: string[] }>();

function readStoredView(key?: string): DashListViewMode | null {
  if (!key || typeof window === "undefined") return null;
  try {
    const v = window.localStorage.getItem(viewStorageKey(key));
    return v === "table" || v === "cards" || v === "kanban" ? v : null;
  } catch {
    return null;
  }
}

function readStoredHiddenCols(storageKey: string | undefined): string[] {
  if (!storageKey || typeof window === "undefined") return EMPTY_HIDDEN_COLS;
  const key = colsStorageKey(storageKey);
  let raw = "";
  try {
    raw = window.localStorage.getItem(key) ?? "";
  } catch {
    return EMPTY_HIDDEN_COLS;
  }
  const cached = hiddenColsCache.get(key);
  if (cached && cached.raw === raw) return cached.value;
  if (!raw) {
    hiddenColsCache.set(key, { raw, value: EMPTY_HIDDEN_COLS });
    return EMPTY_HIDDEN_COLS;
  }
  try {
    const parsed = JSON.parse(raw);
    const value = Array.isArray(parsed)
      ? parsed.map(String)
      : EMPTY_HIDDEN_COLS;
    hiddenColsCache.set(key, { raw, value });
    return value;
  } catch {
    hiddenColsCache.set(key, { raw, value: EMPTY_HIDDEN_COLS });
    return EMPTY_HIDDEN_COLS;
  }
}

function readStoredDensity(storageKey: string | undefined): DashListDensity {
  if (!storageKey || typeof window === "undefined") return "comfortable";
  try {
    const dens = window.localStorage.getItem(densityStorageKey(storageKey));
    return dens === "compact" || dens === "comfortable" ? dens : "comfortable";
  } catch {
    return "comfortable";
  }
}

function subscribeStorageKey(
  eventName: string | undefined,
  onStoreChange: () => void,
) {
  if (!eventName || typeof window === "undefined") return () => {};
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
    (onChange) =>
      subscribeStorageKey(
        storageKey ? viewStorageKey(storageKey) : undefined,
        onChange,
      ),
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

function escapeCsv(value: string) {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
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
  selectable = false,
  bulkActions,
  syncUrl = false,
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
  selectable?: boolean;
  bulkActions?: (selected: T[], clear: () => void) => ReactNode;
  /** Sync search + filters to URL ?q=&filterId= */
  syncUrl?: boolean;
}) {
  const t = useDashT();
  const { locale } = useDashLocale();
  const intlLocale = dashIntlLocale(locale);
  const [view, setViewPersist] = usePersistedView(storageKey, defaultView);
  const kanbanEnabled = Boolean(renderKanban);

  const [query, setQuery] = useState(() => {
    if (!syncUrl || typeof window === "undefined") return "";
    return new URLSearchParams(window.location.search).get("q") ?? "";
  });
  const [filterState, setFilterState] = useState<Record<string, string>>(() => {
    if (!syncUrl || typeof window === "undefined") return {};
    const params = new URLSearchParams(window.location.search);
    const init: Record<string, string> = {};
    for (const f of filters ?? []) {
      const v = params.get(f.id);
      if (v) init[f.id] = v;
    }
    return init;
  });
  const [sortId, setSortId] = useState<string | null>(
    () =>
      defaultSortId ??
      columns.find((c) => c.sortValue)?.id ??
      null,
  );
  const [sortDir, setSortDir] = useState<DashListSortDir>(defaultSortDir);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [colsOpen, setColsOpen] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const [hiddenColsLocal, setHiddenColsLocal] = useState<Set<string> | null>(
    null,
  );
  const [densityLocal, setDensityLocal] = useState<DashListDensity | null>(null);

  const isMobile = useSyncExternalStore(
    (onChange) => {
      if (typeof window === "undefined") return () => {};
      const mq = window.matchMedia("(max-width: 767px)");
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () =>
      typeof window !== "undefined"
        ? window.matchMedia("(max-width: 767px)").matches
        : false,
    () => false,
  );

  const storedHidden = useSyncExternalStore(
    (onChange) =>
      subscribeStorageKey(
        storageKey ? colsStorageKey(storageKey) : undefined,
        onChange,
      ),
    () => readStoredHiddenCols(storageKey),
    () => EMPTY_HIDDEN_COLS,
  );

  const storedDensity = useSyncExternalStore(
    (onChange) =>
      subscribeStorageKey(
        storageKey ? densityStorageKey(storageKey) : undefined,
        onChange,
      ),
    () => readStoredDensity(storageKey),
    () => "comfortable" as DashListDensity,
  );

  const hiddenCols = useMemo(
    () => hiddenColsLocal ?? new Set(storedHidden),
    [hiddenColsLocal, storedHidden],
  );
  const density = densityLocal ?? storedDensity;
  const baseView: DashListViewMode =
    view === "kanban" && !kanbanEnabled ? "table" : view;
  const effectiveView: DashListViewMode =
    isMobile && baseView === "table" ? "cards" : baseView;

  useEffect(() => {
    if (!syncUrl || typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (query.trim()) params.set("q", query.trim());
    else params.delete("q");
    for (const f of filters ?? []) {
      const v = filterState[f.id];
      if (v) params.set(f.id, v);
      else params.delete(f.id);
    }
    const next = params.toString();
    const cur = window.location.search.replace(/^\?/, "");
    if (next === cur) return;
    const url = next
      ? `${window.location.pathname}?${next}`
      : window.location.pathname;
    window.history.replaceState(null, "", url);
  }, [query, filterState, syncUrl, filters]);

  const visibleColumns = useMemo(
    () => columns.filter((c) => !hiddenCols.has(c.id)),
    [columns, hiddenCols],
  );

  const activeFilters = useMemo(() => {
    if (effectiveView !== "kanban") return filters ?? [];
    return (filters ?? []).filter((f) => f.id !== "status");
  }, [filters, effectiveView]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((row) => {
      for (const f of activeFilters) {
        const selectedFilter = filterState[f.id] ?? "";
        if (selectedFilter && f.getValue(row) !== selectedFilter) return false;
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

  const selectedRows = useMemo(
    () => sorted.filter((r) => selected.has(rowKey(r))),
    [sorted, selected, rowKey],
  );

  function setQueryReset(next: string) {
    setQuery(next);
    setPage(0);
  }

  function setFilterReset(id: string, value: string) {
    setFilterState((prev) => ({ ...prev, [id]: value }));
    setPage(0);
  }

  function clearFilters() {
    setQuery("");
    setFilterState({});
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

  function persistHidden(next: Set<string>) {
    setHiddenColsLocal(next);
    if (!storageKey) return;
    try {
      const key = colsStorageKey(storageKey);
      const value = [...next];
      const raw = JSON.stringify(value);
      window.localStorage.setItem(key, raw);
      hiddenColsCache.set(key, { raw, value });
      window.dispatchEvent(new Event(key));
    } catch {
      // ignore
    }
  }

  function setDensityPersist(next: DashListDensity) {
    setDensityLocal(next);
    if (!storageKey) return;
    try {
      const key = densityStorageKey(storageKey);
      window.localStorage.setItem(key, next);
      window.dispatchEvent(new Event(key));
    } catch {
      // ignore
    }
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAllPage() {
    const ids = pageRows.map(rowKey);
    const allOn = ids.every((id) => selected.has(id));
    setSelected((prev) => {
      const next = new Set(prev);
      if (allOn) ids.forEach((id) => next.delete(id));
      else ids.forEach((id) => next.add(id));
      return next;
    });
  }

  function exportSelectedCsv() {
    const exportCols = visibleColumns.filter(
      (c) => c.exportValue || c.sortValue || c.searchText,
    );
    const header = exportCols.map((c) => escapeCsv(c.header)).join(",");
    const body = (selectedRows.length ? selectedRows : sorted)
      .map((row) =>
        exportCols
          .map((c) => {
            const raw =
              c.exportValue?.(row) ??
              (typeof c.searchText === "function"
                ? c.searchText(row)
                : c.sortValue
                  ? String(c.sortValue(row) ?? "")
                  : "");
            return escapeCsv(raw);
          })
          .join(","),
      )
      .join("\n");
    const blob = new Blob([`${header}\n${body}`], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${storageKey ?? "export"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const activeFilterChips = activeFilters
    .map((f) => {
      const value = filterState[f.id];
      if (!value) return null;
      const opt = f.options.find((o) => o.value === value);
      return { id: f.id, label: f.label, valueLabel: opt?.label ?? value };
    })
    .filter(Boolean) as Array<{ id: string; label: string; valueLabel: string }>;

  const rowPad =
    density === "compact"
      ? "py-[var(--dash-row-py-compact)]"
      : "py-[var(--dash-row-py)]";

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
    "text-[0.65rem] font-semibold uppercase tracking-wide text-[var(--dash-faint)] leading-none";
  const fieldControl = dashInputSm;
  const selectControl = dashSelectSm;
  const hasActiveQuery =
    Boolean(query.trim()) || Object.values(filterState).some(Boolean);

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
            <span className={fieldLabel}>{t.common.density}</span>
            <div className="inline-flex h-10 items-stretch rounded-xl border border-[var(--dash-border-strong)] bg-[var(--dash-surface)] p-0.5">
              <button
                type="button"
                className={cn(
                  "rounded-[0.625rem] px-2.5 text-xs font-semibold transition",
                  density === "comfortable"
                    ? "bg-primary text-white"
                    : "text-[var(--dash-muted-strong)] hover:bg-black/[0.03]",
                )}
                onClick={() => setDensityPersist("comfortable")}
              >
                {t.common.densityComfortable}
              </button>
              <button
                type="button"
                className={cn(
                  "inline-flex items-center gap-1 rounded-[0.625rem] px-2.5 text-xs font-semibold transition",
                  density === "compact"
                    ? "bg-primary text-white"
                    : "text-[var(--dash-muted-strong)] hover:bg-black/[0.03]",
                )}
                onClick={() => setDensityPersist("compact")}
              >
                <Rows3 className="size-3.5" strokeWidth={1.75} aria-hidden />
                {t.common.densityCompact}
              </button>
            </div>
          </div>

          <div className="grid gap-1.5">
            <span className={fieldLabel}>{t.common.columns}</span>
            <DashPopover
              open={colsOpen}
              onOpenChange={setColsOpen}
              trigger={(props) => (
                <button
                  type="button"
                  className={cn(dashBtnSecondary, "h-10 gap-1.5 px-3")}
                  ref={props.ref as React.RefCallback<HTMLButtonElement>}
                  aria-expanded={props["aria-expanded"]}
                  aria-controls={props["aria-controls"]}
                  onClick={props.onClick}
                >
                  <Columns3 className="size-3.5" strokeWidth={1.75} aria-hidden />
                  {t.common.columns}
                </button>
              )}
            >
              <div className="grid gap-1 p-2">
                {columns.map((col) => {
                  const checked = !hiddenCols.has(col.id);
                  return (
                    <label
                      key={col.id}
                      className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-black/[0.03]"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => {
                          const next = new Set(hiddenCols);
                          if (checked) {
                            if (visibleColumns.length <= 1) return;
                            next.add(col.id);
                          } else next.delete(col.id);
                          persistHidden(next);
                        }}
                      />
                      {col.header}
                    </label>
                  );
                })}
              </div>
            </DashPopover>
          </div>

          <div className="grid gap-1.5">
            <span className={fieldLabel}>{t.common.view}</span>
            <div
              className="inline-flex h-10 items-stretch rounded-xl border border-[var(--dash-border-strong)] bg-[var(--dash-surface)] p-0.5"
              role="group"
              aria-label={t.common.view}
            >
              <button
                type="button"
                className={cn(
                  "rounded-[0.625rem] px-3 text-xs font-semibold transition",
                  effectiveView === "table"
                    ? "bg-primary text-white"
                    : "text-[var(--dash-muted-strong)] hover:bg-black/[0.03]",
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
                    : "text-[var(--dash-muted-strong)] hover:bg-black/[0.03]",
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
                      : "text-[var(--dash-muted-strong)] hover:bg-black/[0.03]",
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

      {(activeFilterChips.length > 0 || query.trim()) && (
        <div className="flex flex-wrap items-center gap-2">
          {query.trim() ? (
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-full border border-[var(--dash-border-strong)] bg-[var(--dash-surface)] px-2.5 py-1 text-xs font-semibold text-[var(--dash-ink)]"
              onClick={() => setQueryReset("")}
            >
              q: {query.trim()}
              <X className="size-3" strokeWidth={1.75} aria-hidden />
            </button>
          ) : null}
          {activeFilterChips.map((chip) => (
            <button
              key={chip.id}
              type="button"
              className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary-soft px-2.5 py-1 text-xs font-semibold text-primary"
              onClick={() => setFilterReset(chip.id, "")}
            >
              {chip.label}: {chip.valueLabel}
              <X className="size-3" strokeWidth={1.75} aria-hidden />
            </button>
          ))}
          <button type="button" className={dashBtnGhost} onClick={clearFilters}>
            {t.common.resetFilters}
          </button>
        </div>
      )}

      {selectable && selected.size > 0 ? (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] px-3 py-2">
          <span className="text-xs font-semibold text-[var(--dash-ink)]">
            {dashFormat(t.common.selectedCount, { n: selected.size })}
          </span>
          <button
            type="button"
            className={dashBtnSecondary}
            onClick={exportSelectedCsv}
          >
            {t.common.exportCsv}
          </button>
          {bulkActions?.(selectedRows, () => setSelected(new Set()))}
          <button
            type="button"
            className={dashBtnGhost}
            onClick={() => setSelected(new Set())}
          >
            {t.common.cancel}
          </button>
        </div>
      ) : null}

      {effectiveView !== "kanban" ? (
        <p className="m-0 text-xs text-[var(--dash-muted)]">
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
        <p className="m-0 text-xs text-[var(--dash-muted)]">
          {filtered.length === 0 ? t.common.nothingFound : `${filtered.length}`}
        </p>
      )}

      {effectiveView === "kanban" && renderKanban ? (
        filtered.length === 0 ? (
          <div className={`${dashCard} p-6`}>
            <DashEmptyState
              title={t.common.nothingFound}
              lead={t.common.emptyFilteredLead}
              action={
                hasActiveQuery ? (
                  <button type="button" className={dashBtnSecondary} onClick={clearFilters}>
                    {t.common.resetFilters}
                  </button>
                ) : null
              }
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
            action={
              hasActiveQuery ? (
                <button type="button" className={dashBtnSecondary} onClick={clearFilters}>
                  {t.common.resetFilters}
                </button>
              ) : null
            }
          />
        </div>
      ) : effectiveView === "table" ? (
        <DashTableShell title={title} className="overflow-hidden">
          <div className="max-h-[min(70dvh,48rem)] overflow-auto">
            <DashTable>
              <thead className="sticky top-0 z-10 bg-[var(--dash-surface)] shadow-[0_1px_0_var(--dash-border)]">
                <tr>
                  {selectable ? (
                    <DashTh className="w-10">
                      <input
                        type="checkbox"
                        aria-label={t.common.selectAll}
                        checked={
                          pageRows.length > 0 &&
                          pageRows.every((r) => selected.has(rowKey(r)))
                        }
                        onChange={toggleSelectAllPage}
                      />
                    </DashTh>
                  ) : null}
                  {visibleColumns.map((col, idx) => (
                    <DashTh
                      key={col.id}
                      className={cn(
                        col.headClassName,
                        (col.sticky || idx === 0) &&
                          "sticky left-0 z-[11] bg-[var(--dash-surface)]",
                      )}
                    >
                      {col.sortValue ? (
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 font-semibold text-inherit hover:text-[var(--dash-ink)]"
                          onClick={() => toggleSort(col.id)}
                        >
                          {col.header}
                          {sortId === col.id ? (
                            sortDir === "asc" ? (
                              <ArrowUp className="size-3.5 text-primary" strokeWidth={1.75} />
                            ) : (
                              <ArrowDown className="size-3.5 text-primary" strokeWidth={1.75} />
                            )
                          ) : (
                            <ArrowUpDown
                              className="size-3.5 text-[var(--dash-faint)]"
                              strokeWidth={1.75}
                            />
                          )}
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
                {pageRows.map((row) => {
                  const id = rowKey(row);
                  return (
                    <tr
                      key={id}
                      className="group hover:bg-[var(--dash-surface-muted)]"
                    >
                      {selectable ? (
                        <DashTd className={rowPad}>
                          <input
                            type="checkbox"
                            checked={selected.has(id)}
                            onChange={() => toggleSelect(id)}
                            aria-label={id}
                          />
                        </DashTd>
                      ) : null}
                      {visibleColumns.map((col, idx) => (
                        <DashTd
                          key={col.id}
                          className={cn(
                            rowPad,
                            col.className,
                            (col.sticky || idx === 0) &&
                              "sticky left-0 z-[1] bg-[var(--dash-surface)] group-hover:bg-[var(--dash-surface-muted)]",
                          )}
                        >
                          {col.cell(row)}
                        </DashTd>
                      ))}
                      {actions ? (
                        <DashTd className={cn(rowPad, "whitespace-nowrap text-right")}>
                          {actions(row)}
                        </DashTd>
                      ) : null}
                    </tr>
                  );
                })}
              </tbody>
            </DashTable>
          </div>
        </DashTableShell>
      ) : (
        <ul className="m-0 grid list-none gap-3 p-0 sm:grid-cols-2 xl:grid-cols-3 max-md:grid-cols-1">
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
                  {visibleColumns
                    .filter((c) => !c.hideInCard)
                    .map((col) => (
                      <div key={col.id} className="min-w-0">
                        <div className="text-[0.65rem] font-semibold uppercase tracking-wide text-[var(--dash-faint)]">
                          {col.header}
                        </div>
                        <div className="mt-0.5 text-sm text-[var(--dash-ink)]">
                          {col.cell(row)}
                        </div>
                      </div>
                    ))}
                </div>
                {actionsNode ? (
                  <div className="mt-auto flex flex-nowrap justify-end gap-1 overflow-x-auto border-t border-[var(--dash-border)] pt-3">
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
          <span className="text-xs font-medium text-[var(--dash-muted)]">
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
          {hasActiveQuery ? (
            <button type="button" className={dashBtnGhost} onClick={clearFilters}>
              {t.common.resetFilters}
            </button>
          ) : null}
          {!selectable ? (
            <DashIconButton
              label={t.common.exportCsv}
              className="ml-auto"
              onClick={exportSelectedCsv}
            >
              <span className="text-[0.65rem] font-semibold">CSV</span>
            </DashIconButton>
          ) : null}
        </div>
      ) : hasActiveQuery ? (
        <button type="button" className={dashBtnGhost} onClick={clearFilters}>
          {t.common.resetFilters}
        </button>
      ) : null}
    </div>
  );
}
