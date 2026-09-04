import type { Metadata } from "next";
import type { Locale } from "@/i18n/config";
import { ogLocale, pagePaths, type PageKey } from "@/i18n/config";
import { getContent } from "@/i18n/get-content";
import { getLocalizedAlternates, localePath } from "@/i18n/paths";
import { createPageMetadata, canonicalPageUrl } from "@/utils/seo/metadata";

const metaKeyByPage: Record<
  Exclude<PageKey, "notFound">,
  keyof ReturnType<typeof getContent>["meta"]
> = {
  home: "homeTitle",
  services: "servicesTitle",
  business: "businessTitle",
  businessConnect: "businessConnectTitle",
  tracking: "trackingTitle",
  requestPrice: "requestPriceTitle",
  about: "aboutTitle",
  news: "newsTitle",
  contacts: "contactsTitle",
  privacy: "privacyTitle",
  terms: "termsTitle",
};

const descKeyByPage: Record<
  Exclude<PageKey, "notFound">,
  keyof ReturnType<typeof getContent>["meta"]
> = {
  home: "homeDescription",
  services: "servicesDescription",
  business: "businessDescription",
  businessConnect: "businessConnectDescription",
  tracking: "trackingDescription",
  requestPrice: "requestPriceDescription",
  about: "aboutDescription",
  news: "newsDescription",
  contacts: "contactsDescription",
  privacy: "privacyDescription",
  terms: "termsDescription",
};

export function getLocalizedPageMetadata(
  locale: Locale,
  page: Exclude<PageKey, "notFound">,
  options?: { noIndex?: boolean },
): Metadata {
  const content = getContent(locale);
  const path = localePath(locale, pagePaths[page]);
  const alternates = getLocalizedAlternates(pagePaths[page]);

  return createPageMetadata(
    String(content.meta[metaKeyByPage[page]]),
    String(content.meta[descKeyByPage[page]]),
    path,
    {
      locale,
      ogLocale: ogLocale[locale],
      noIndex: options?.noIndex ?? page === "tracking",
      alternates: Object.fromEntries(
        Object.entries(alternates).map(([lang, href]) => [
          lang,
          canonicalPageUrl(href),
        ]),
      ),
    },
  );
}
