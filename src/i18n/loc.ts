import type { Locale } from "./config";

/** Pick a string (or value) for the active public locale. */
export function loc<T>(locale: Locale, uz: T, ru: T, zh: T): T {
  if (locale === "zh") return zh;
  if (locale === "ru") return ru;
  return uz;
}
