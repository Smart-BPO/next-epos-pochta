"use server";

import { cookies } from "next/headers";
import {
  DASH_LOCALE_COOKIE,
  isDashLocale,
  type DashLocale,
} from "@/i18n/dashboard";

export async function setDashLocaleAction(locale: DashLocale) {
  if (!isDashLocale(locale)) return;
  const jar = await cookies();
  jar.set(DASH_LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
}
