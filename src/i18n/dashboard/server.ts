import { cookies } from "next/headers";
import {
  DASH_LOCALE_COOKIE,
  getDashCopy,
  parseDashLocale,
  type DashLocale,
} from "@/i18n/dashboard";

export async function getDashLocale(): Promise<DashLocale> {
  const jar = await cookies();
  return parseDashLocale(jar.get(DASH_LOCALE_COOKIE)?.value);
}

export async function getDashT() {
  const locale = await getDashLocale();
  const copy = getDashCopy(locale);
  return { locale, copy, t: copy };
}
