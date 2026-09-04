import type { Metadata } from "next";
import type { Locale } from "@/i18n/config";
import { ogLocale } from "@/i18n/config";
import { getLocalizedAlternates, localePath } from "@/i18n/paths";
import type { LocalizedNewsArticle } from "@/data/news/types";
import { createPageMetadata, canonicalPageUrl } from "@/utils/seo/metadata";

export function getNewsArticleMetadata(
  locale: Locale,
  article: LocalizedNewsArticle,
): Metadata {
  const path = localePath(locale, `/news/${article.slug}/`);
  const alternates = getLocalizedAlternates(`/news/${article.slug}/`);

  return createPageMetadata(article.title, article.excerpt, path, {
    locale,
    ogLocale: ogLocale[locale],
    image: article.coverImage ?? "/images/og/default.png",
    alternates: Object.fromEntries(
      Object.entries(alternates).map(([lang, href]) => [
        lang,
        canonicalPageUrl(href),
      ]),
    ),
  });
}
