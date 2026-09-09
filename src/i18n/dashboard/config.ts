export const dashLocales = ["uz", "ru"] as const;

export type DashLocale = (typeof dashLocales)[number];

export const defaultDashLocale: DashLocale = "uz";

export const DASH_LOCALE_COOKIE = "epos_dash_locale";

export function isDashLocale(value: unknown): value is DashLocale {
  return value === "uz" || value === "ru";
}

export function parseDashLocale(value: string | undefined | null): DashLocale {
  if (isDashLocale(value)) return value;
  return defaultDashLocale;
}

export function dashIntlLocale(locale: DashLocale): string {
  return locale === "ru" ? "ru-RU" : "uz-UZ";
}
