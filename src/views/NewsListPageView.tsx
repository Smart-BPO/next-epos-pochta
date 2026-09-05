import type { Locale } from "@/i18n/config";
import { getContent } from "@/i18n/get-content";
import { PageContainer } from "@/components/atoms/PageContainer";
import { NewsCard } from "@/components/molecules/NewsCard";
import {
  NewsListControls,
  NewsPagination,
} from "@/components/molecules/NewsListControls";
import { JsonLd } from "@/components/seo/JsonLd";
import { PageCta } from "@/components/organisms/PageCta";
import {
  listNews,
  parseNewsListQuery,
  queryNews,
} from "@/lib/news/repository";
import { getNewsCollectionSchema } from "@/utils/seo/json-ld";
import {
  pageIntro,
  pageIntroTitle,
  sectionLead,
  sectionMuted,
} from "@/styles/ui";

export function NewsListPageView({
  locale,
  searchParams,
}: {
  locale: Locale;
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const copy = getContent(locale);
  const query = parseNewsListQuery(searchParams);
  const result = queryNews(locale, query);
  const allArticles = listNews(locale);

  const from = result.total === 0 ? 0 : (result.page - 1) * result.pageSize + 1;
  const to = Math.min(result.page * result.pageSize, result.total);
  const resultsLabel = copy.news.resultsLabel
    .replace("{from}", String(from))
    .replace("{to}", String(to))
    .replace("{total}", String(result.total));

  const hasActiveFilters =
    query.category !== "all" ||
    query.sort !== "newest" ||
    query.q.length > 0;

  return (
    <>
      <JsonLd data={getNewsCollectionSchema(locale, allArticles)} />
      <section className={pageIntro}>
        <PageContainer>
          <h1 className={pageIntroTitle}>{copy.news.title}</h1>
          <p className={sectionLead}>{copy.news.lead}</p>
        </PageContainer>
      </section>

      <section className={sectionMuted}>
        <PageContainer className="flex flex-col gap-8">
          <NewsListControls
            copy={copy.news}
            categories={result.categories}
            category={query.category}
            sort={query.sort}
            q={query.q}
            page={result.page}
          />

          {result.total === 0 ? (
            <p className="m-0 text-[length:var(--home-lead)] text-black/60">
              {allArticles.length === 0 || !hasActiveFilters
                ? copy.news.empty
                : copy.news.emptyFiltered}
            </p>
          ) : (
            <>
              <p className="m-0 text-sm text-black/45">{resultsLabel}</p>
              <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
                {result.items.map((article) => (
                  <NewsCard
                    key={article.id}
                    locale={locale}
                    article={article}
                  />
                ))}
              </div>
              <NewsPagination
                copy={copy.news}
                page={result.page}
                totalPages={result.totalPages}
                category={query.category}
                sort={query.sort}
                q={query.q}
              />
            </>
          )}
        </PageContainer>
      </section>

      <PageCta locale={locale} content={copy} />
    </>
  );
}
