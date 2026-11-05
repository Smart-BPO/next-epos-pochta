import { type Locale, isLocale } from "@/i18n/config";

export const APP_TZ = "Asia/Tashkent";

const UZ_MONTHS = [
  "yanvar",
  "fevral",
  "mart",
  "aprel",
  "may",
  "iyun",
  "iyul",
  "avgust",
  "sentabr",
  "oktabr",
  "noyabr",
  "dekabr",
] as const;

type AppLocale = Locale | "uz" | "ru" | "zh";

/** Normalize site / dashboard / BCP47 tags to uz|ru|zh. */
export function resolveAppLocale(locale: string | Locale | null | undefined): AppLocale {
  if (!locale) return "uz";
  if (isLocale(locale)) return locale;
  const lower = locale.toLowerCase();
  if (lower.startsWith("ru")) return "ru";
  if (lower.startsWith("zh")) return "zh";
  if (lower.startsWith("uz")) return "uz";
  return "uz";
}

function parseDate(value: string | number | Date | null | undefined): Date | null {
  if (value == null || value === "") return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function partsOf(
  date: Date,
  options: Intl.DateTimeFormatOptions,
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const part of new Intl.DateTimeFormat("en-GB", {
    timeZone: APP_TZ,
    hour12: false,
    ...options,
  }).formatToParts(date)) {
    if (part.type !== "literal") out[part.type] = part.value;
  }
  return out;
}

/** `05.11.2026` (uz/ru) or `2026/11/05` (zh). */
export function formatAppDate(
  value: string | number | Date | null | undefined,
  locale: string | Locale = "uz",
): string {
  const date = parseDate(value);
  if (!date) return "—";
  const p = partsOf(date, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const lang = resolveAppLocale(locale);
  if (lang === "zh") return `${p.year}/${p.month}/${p.day}`;
  return `${p.day}.${p.month}.${p.year}`;
}

/** `05.11.2026, 14:46` (uz/ru) or `2026/11/05 14:46` (zh). */
export function formatAppDateTime(
  value: string | number | Date | null | undefined,
  locale: string | Locale = "uz",
): string {
  const date = parseDate(value);
  if (!date) return "—";
  const p = partsOf(date, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
  const lang = resolveAppLocale(locale);
  if (lang === "zh") return `${p.year}/${p.month}/${p.day} ${p.hour}:${p.minute}`;
  return `${p.day}.${p.month}.${p.year}, ${p.hour}:${p.minute}`;
}

/** Long prose date: `5 noyabr 2026` / `5 ноября 2026` / `2026年11月5日`. */
export function formatAppDateLong(
  value: string | number | Date | null | undefined,
  locale: string | Locale = "uz",
): string {
  const date = parseDate(value);
  if (!date) return "—";
  const lang = resolveAppLocale(locale);
  if (lang === "uz") {
    const p = partsOf(date, {
      year: "numeric",
      month: "numeric",
      day: "numeric",
    });
    const monthIdx = Number(p.month) - 1;
    const month = UZ_MONTHS[monthIdx] ?? p.month;
    return `${Number(p.day)} ${month} ${p.year}`;
  }
  const tag = lang === "ru" ? "ru-RU" : "zh-CN";
  return new Intl.DateTimeFormat(tag, {
    timeZone: APP_TZ,
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

/** Compact list/chart label without year: `05.11`. */
export function formatAppDayMonth(
  value: string | number | Date | null | undefined,
  locale: string | Locale = "uz",
): string {
  const date = parseDate(value);
  if (!date) return "—";
  const p = partsOf(date, { month: "2-digit", day: "2-digit" });
  const lang = resolveAppLocale(locale);
  if (lang === "zh") return `${p.month}/${p.day}`;
  return `${p.day}.${p.month}`;
}
