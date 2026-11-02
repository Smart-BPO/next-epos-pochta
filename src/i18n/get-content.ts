import type { Locale } from "@/i18n/config";
import type { SiteCopy } from "@/data/types";
import { ruCopy } from "@/data/ru";
import { uzCopy } from "@/data/uz";
import { zhCopy } from "@/data/zh";

/** Static content with optional CMS overlays elsewhere (settings via getRuntimeSiteConfig). */
export function getContent(locale: Locale): SiteCopy {
  if (locale === "uz") return uzCopy;
  if (locale === "zh") return zhCopy;
  return ruCopy;
}
