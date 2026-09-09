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
  const title = (article.seoTitle || article.title).trim();
  const description = (article.seoDescription || article.excerpt).trim();
  const image =
    article.ogImage || article.coverImage || "/images/og/default.png";

  return createPageMetadata(title, description, path, {
    locale,
    ogLocale: ogLocale[locale],
    image,
    ogType: "article",
    noIndex: Boolean(article.noindex),
    alternates: Object.fromEntries(
      Object.entries(alternates).map(([lang, href]) => [
        lang,
        canonicalPageUrl(href),
      ]),
    ),
  });
}
