export type DashDateRange = {
  from: string;
  to: string;
};

export function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getDefaultDateRange(reference = new Date()): DashDateRange {
  const from = new Date(reference.getFullYear(), reference.getMonth(), 1);
  const to = new Date(reference.getFullYear(), reference.getMonth() + 1, 0);
  return { from: toIsoDate(from), to: toIsoDate(to) };
}

export function parseIsoDate(value: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return new Date(Number.NaN);

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);

  if (
    !Number.isFinite(year) ||
    !Number.isFinite(month) ||
    !Number.isFinite(day) ||
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return new Date(Number.NaN);
  }

  return date;
}

export function normalizeDateRange(range: DashDateRange): DashDateRange {
  const fromDate = parseIsoDate(range.from);
  const toDate = parseIsoDate(range.to);

  if (Number.isNaN(fromDate.getTime()) || Number.isNaN(toDate.getTime())) {
    return getDefaultDateRange();
  }

  if (fromDate.getTime() <= toDate.getTime()) {
    return range;
  }

  return { from: range.to, to: range.from };
}

/** Long single-day label: «10 сентября 2026 г.» */
export function formatLongDay(iso: string, locale: string): string {
  const date = parseIsoDate(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function formatDateRangeLabel(
  range: DashDateRange,
  locale: string,
): string {
  const normalized = normalizeDateRange(range);
  if (normalized.from === normalized.to) {
    return formatLongDay(normalized.from, locale);
  }

  const formatter = new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const from = parseIsoDate(normalized.from);
  const to = parseIsoDate(normalized.to);

  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
    return "—";
  }

  return `${formatter.format(from)} – ${formatter.format(to)}`;
}

export function getMonthMatrix(
  year: number,
  month: number,
): Array<Array<Date | null>> {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const weeks: Array<Array<Date | null>> = [];
  let currentWeek: Array<Date | null> = Array.from(
    { length: startOffset },
    () => null,
  );

  for (let day = 1; day <= lastDay.getDate(); day += 1) {
    currentWeek.push(new Date(year, month, day));
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }

  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) currentWeek.push(null);
    weeks.push(currentWeek);
  }

  return weeks;
}

export function isDateInRange(day: Date, range: DashDateRange): boolean {
  const normalized = normalizeDateRange(range);
  const iso = toIsoDate(day);
  return iso >= normalized.from && iso <= normalized.to;
}

export function getCalendarMonthFromRange(range: DashDateRange): {
  year: number;
  month: number;
} {
  const normalized = normalizeDateRange(range);
  const date = parseIsoDate(normalized.from);
  if (Number.isNaN(date.getTime())) {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  }
  return { year: date.getFullYear(), month: date.getMonth() };
}

/** Compare created_at ISO timestamps against a YYYY-MM-DD range (local calendar day). */
export function isIsoInDateRange(
  isoTimestamp: string | undefined,
  range: DashDateRange,
): boolean {
  if (!isoTimestamp) return false;
  const day = toIsoDate(new Date(isoTimestamp));
  const normalized = normalizeDateRange(range);
  return day >= normalized.from && day <= normalized.to;
}
