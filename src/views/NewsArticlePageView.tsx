import Image from "next/image";
import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { localePath } from "@/i18n/paths";
import { getContent } from "@/i18n/get-content";
import type { LocalizedNewsArticle } from "@/data/news/types";
import { PageContainer } from "@/components/atoms/PageContainer";
import { NewsCard } from "@/components/molecules/NewsCard";
import { JsonLd } from "@/components/seo/JsonLd";
import { PageCta } from "@/components/organisms/PageCta";
import { formatNewsDate, getLatestNews } from "@/lib/news/repository";
import { getNewsArticleSchema } from "@/utils/seo/json-ld";
import { sanitizeNewsHtml } from "@/lib/news/body-html";
import {
  legalContent,
  pageIntro,
  pageIntroTitle,
  section,
  sectionLead,
  sectionMuted,
  sectionTitle,
} from "@/styles/ui";

export async function NewsArticlePageView({
  locale,
  article,
}: {
  locale: Locale;
  article: LocalizedNewsArticle;
}) {
  const copy = getContent(locale);
  const related = (await getLatestNews(locale, 4))
    .filter((item) => item.slug !== article.slug)
    .slice(0, 3);
  const safeHtml = sanitizeNewsHtml(article.bodyHtml || "");

  return (
    <>
      <JsonLd data={getNewsArticleSchema(locale, article)} />
      <section className={pageIntro}>
        <PageContainer>
          <h1 className={pageIntroTitle}>{article.title}</h1>
          <p className={sectionLead}>{article.excerpt}</p>
        </PageContainer>
      </section>

      {article.coverImage ? (
        <section className="pb-[var(--section-y)]">
          <PageContainer>
            <div className="relative aspect-[21/9] overflow-hidden rounded-3xl border border-black/20 bg-surface-muted">
              <Image
                src={article.coverImage}
                alt={article.coverAlt || article.title}
                fill
                className="object-contain object-center p-6 sm:p-10"
                sizes="(max-width: 1232px) 100vw, 1232px"
                priority
              />
            </div>
          </PageContainer>
        </section>
      ) : null}

      <section className={sectionMuted}>
        <PageContainer className={legalContent}>
          <p className="!mt-0 mb-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-black/50">
            <Link
              href={localePath(locale, "/news/")}
              className="font-medium text-primary hover:underline"
            >
              ← {copy.news.backToNews}
            </Link>
            <span aria-hidden>·</span>
            <time dateTime={article.publishedAt}>
              {formatNewsDate(article.publishedAt, locale)}
            </time>
          </p>
          <div
            className="news-article-body prose prose-neutral max-w-none"
            dangerouslySetInnerHTML={{ __html: safeHtml }}
          />
        </PageContainer>
      </section>

      {related.length > 0 ? (
        <section className={section}>
          <PageContainer className="flex flex-col gap-6 md:gap-9">
            <h2 className={sectionTitle}>{copy.news.otherNews}</h2>
            <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3">
              {related.map((item) => (
                <NewsCard key={item.id} locale={locale} article={item} />
              ))}
            </div>
          </PageContainer>
        </section>
      ) : null}

      <PageCta locale={locale} content={copy} />
    </>
  );
}
