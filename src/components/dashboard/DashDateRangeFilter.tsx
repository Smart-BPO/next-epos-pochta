"use client";

import { useMemo, useState, type ReactNode } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { DashPopover } from "@/components/dashboard/ds/DashPopover";
import { useDashLocale, useDashT } from "@/components/dashboard/DashLocaleProvider";
import { dashIntlLocale } from "@/i18n/dashboard";
import { cn } from "@/lib/cn";
import {
  formatDateRangeLabel,
  formatLongDay,
  getCalendarMonthFromRange,
  getDefaultDateRange,
  getMonthMatrix,
  isDateInRange,
  normalizeDateRange,
  toIsoDate,
  type DashDateRange,
} from "@/lib/dashboard/date-range";
import { dashCard, dashInput } from "@/styles/dashboard";

export type DashDateRangeFilterProps = {
  value: DashDateRange;
  active: boolean;
  onChange: (next: DashDateRange) => void;
  onReset: () => void;
  onApplyPreset: (preset: "month" | "30d" | "90d") => void;
  className?: string;
};

function PanelHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="border-b border-black/[0.06] px-4 py-3">
      <p className="m-0 text-sm font-semibold text-ink">{title}</p>
      {subtitle ? (
        <p className="m-0 mt-0.5 text-xs text-black/45">{subtitle}</p>
      ) : null}
    </div>
  );
}

function PanelField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[0.65rem] font-semibold uppercase tracking-wide text-black/40">
        {label}
      </span>
      {children}
    </label>
  );
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn("size-4", className)}
      fill="none"
      aria-hidden
    >
      <rect
        x="4"
        y="5"
        width="16"
        height="15"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M8 3.5v3M16 3.5v3M4 9.5h16"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function DashDateRangeFilter({
  value,
  active,
  onChange,
  onReset,
  onApplyPreset,
  className,
}: DashDateRangeFilterProps) {
  const t = useDashT();
  const { locale } = useDashLocale();
  const intl = dashIntlLocale(locale);
  const [open, setOpen] = useState(false);
  const [rangeAnchor, setRangeAnchor] = useState<string | null>(null);
  const [calendarMonth, setCalendarMonth] = useState(() =>
    getCalendarMonthFromRange(value),
  );

  const todayIso = toIsoDate(new Date());
  const buttonLabel = active
    ? formatDateRangeLabel(value, intl)
    : formatLongDay(todayIso, intl);

  const monthLabel = useMemo(
    () =>
      new Intl.DateTimeFormat(intl, {
        month: "long",
        year: "numeric",
      }).format(new Date(calendarMonth.year, calendarMonth.month, 1)),
    [calendarMonth.month, calendarMonth.year, intl],
  );

  const weeks = useMemo(
    () => getMonthMatrix(calendarMonth.year, calendarMonth.month),
    [calendarMonth.month, calendarMonth.year],
  );

  const weekdayLabels = useMemo(() => {
    const formatter = new Intl.DateTimeFormat(intl, { weekday: "short" });
    return Array.from({ length: 7 }, (_, index) =>
      formatter.format(new Date(2024, 0, 1 + index)),
    );
  }, [intl]);

  const selectDay = (day: Date) => {
    const iso = toIsoDate(day);

    if (!rangeAnchor) {
      setRangeAnchor(iso);
      onChange({ from: iso, to: iso });
      return;
    }

    if (iso === rangeAnchor) {
      onChange({ from: iso, to: iso });
      setRangeAnchor(null);
      return;
    }

    const [from, to] =
      iso < rangeAnchor ? [iso, rangeAnchor] : [rangeAnchor, iso];
    onChange({ from, to });
    setRangeAnchor(null);
  };

  const shiftMonth = (delta: number) => {
    setCalendarMonth((current) => {
      const next = new Date(current.year, current.month + delta, 1);
      return { year: next.getFullYear(), month: next.getMonth() };
    });
  };

  return (
    <DashPopover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) {
          setCalendarMonth(getCalendarMonthFromRange(value));
          setRangeAnchor(null);
        }
      }}
      align="end"
      panelWidth="20rem"
      className={className}
      trigger={({ ref, onClick, ...aria }) => (
        <button
          ref={ref as React.RefCallback<HTMLButtonElement>}
          type="button"
          onClick={onClick}
          {...aria}
          title={buttonLabel}
          className={cn(
            dashCard,
            "inline-flex h-10 max-w-[16rem] items-center gap-2 px-3.5 text-sm font-medium text-black/65 transition hover:bg-black/[0.02]",
            open || active
              ? "border-primary/30 bg-primary-soft text-primary"
              : null,
          )}
        >
          {open || active ? (
            <CalendarDays className="size-4 shrink-0" aria-hidden />
          ) : (
            <CalendarIcon className="shrink-0 text-black/35" />
          )}
          <span className="min-w-0 truncate">{buttonLabel}</span>
        </button>
      )}
    >
      <PanelHeader
        title={t.overview.dateRange}
        subtitle={t.overview.dateRangeHelp}
      />
      <div className="space-y-4 p-4">
        <div className="grid grid-cols-3 gap-2">
          {(
            [
              ["month", t.overview.presetMonth],
              ["30d", t.overview.preset30d],
              ["90d", t.overview.preset90d],
            ] as const
          ).map(([preset, label]) => (
            <button
              key={preset}
              type="button"
              onClick={() => onApplyPreset(preset)}
              className="rounded-xl border border-black/[0.08] px-2 py-2 text-xs font-semibold text-ink transition hover:bg-black/[0.03]"
            >
              {label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <PanelField label={t.overview.from}>
            <input
              type="date"
              value={value.from}
              onChange={(event) =>
                onChange(
                  normalizeDateRange({
                    from: event.target.value,
                    to:
                      event.target.value > value.to
                        ? event.target.value
                        : value.to,
                  }),
                )
              }
              className={cn(dashInput, "h-10 py-0")}
            />
          </PanelField>
          <PanelField label={t.overview.to}>
            <input
              type="date"
              value={value.to}
              min={value.from}
              onChange={(event) => {
                const nextTo = event.target.value;
                onChange(
                  nextTo < value.from
                    ? { from: nextTo, to: nextTo }
                    : { ...value, to: nextTo },
                );
              }}
              className={cn(dashInput, "h-10 py-0")}
            />
          </PanelField>
        </div>

        <div className="rounded-xl border border-black/[0.06] p-3">
          <div className="mb-3 flex items-center justify-between">
            <button
              type="button"
              onClick={() => shiftMonth(-1)}
              className="inline-flex size-8 items-center justify-center rounded-lg text-black/45 hover:bg-black/[0.04]"
              aria-label={t.overview.prevMonth}
            >
              <ChevronLeft className="size-4" />
            </button>
            <p className="m-0 text-sm font-semibold capitalize text-ink">
              {monthLabel}
            </p>
            <button
              type="button"
              onClick={() => shiftMonth(1)}
              className="inline-flex size-8 items-center justify-center rounded-lg text-black/45 hover:bg-black/[0.04]"
              aria-label={t.overview.nextMonth}
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1">
            {weekdayLabels.map((label) => (
              <span
                key={label}
                className="py-1 text-center text-[10px] font-semibold uppercase text-black/35"
              >
                {label}
              </span>
            ))}
            {weeks.flat().map((day, index) => {
              if (!day) {
                return <span key={`empty-${index}`} aria-hidden />;
              }

              const iso = toIsoDate(day);
              const isSelected = iso === value.from || iso === value.to;
              const inRange = isDateInRange(day, value);

              return (
                <button
                  key={iso}
                  type="button"
                  onClick={() => selectDay(day)}
                  className={cn(
                    "h-8 rounded-lg text-xs font-medium transition-colors",
                    isSelected
                      ? "bg-primary text-white"
                      : inRange
                        ? "bg-primary-soft text-primary"
                        : "text-ink hover:bg-black/[0.04]",
                  )}
                >
                  {day.getDate()}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex gap-2">
          {active ? (
            <button
              type="button"
              onClick={() => {
                onReset();
                setRangeAnchor(null);
              }}
              className="h-10 flex-1 rounded-xl border border-black/10 bg-white text-sm font-semibold text-ink transition hover:bg-black/[0.03]"
            >
              {t.overview.allDates}
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="h-10 flex-1 rounded-xl bg-primary text-sm font-semibold text-white transition hover:bg-primary-hover"
          >
            {t.overview.applyDates}
          </button>
        </div>
      </div>
    </DashPopover>
  );
}

export function useDashDateRangeFilter() {
  const [dateRange, setDateRangeState] = useState<DashDateRange>(() =>
    getDefaultDateRange(),
  );
  const [active, setActive] = useState(false);

  const setDateRange = (
    next: DashDateRange | ((current: DashDateRange) => DashDateRange),
  ) => {
    setDateRangeState((current) => {
      const resolved = typeof next === "function" ? next(current) : next;
      return normalizeDateRange(resolved);
    });
    setActive(true);
  };

  const resetDateRange = () => {
    setDateRangeState(getDefaultDateRange());
    setActive(false);
  };

  const applyPreset = (preset: "month" | "30d" | "90d") => {
    const today = new Date();
    const to = toIsoDate(today);

    if (preset === "month") {
      setDateRange(getDefaultDateRange(today));
      return;
    }

    const fromDate = new Date(today);
    fromDate.setDate(today.getDate() - (preset === "30d" ? 29 : 89));
    setDateRange({ from: toIsoDate(fromDate), to });
  };

  return {
    dateRange,
    active,
    setDateRange,
    resetDateRange,
    applyPreset,
  };
}
