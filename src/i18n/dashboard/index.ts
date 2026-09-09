import { DASH_LOCALE_COOKIE, parseDashLocale, type DashLocale } from "./config";
import { dashRu } from "./ru";
import { dashUz } from "./uz";
import type { DashCopy } from "./types";

export type { DashCopy, DashLocale };
export {
  DASH_LOCALE_COOKIE,
  dashLocales,
  defaultDashLocale,
  dashIntlLocale,
  isDashLocale,
  parseDashLocale,
} from "./config";

export function getDashCopy(locale: DashLocale): DashCopy {
  return locale === "ru" ? dashRu : dashUz;
}

/** Replace `{name}` placeholders in a template string. */
export function dashFormat(
  template: string,
  vars: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) =>
    vars[key] != null ? String(vars[key]) : `{${key}}`,
  );
}
