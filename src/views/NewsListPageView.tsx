import type { Locale } from "@/i18n/config";
import { getContent } from "@/i18n/get-content";
import { PageContainer } from "@/components/atoms/PageContainer";
import { NewsCard } from "@/components/molecules/NewsCard";
import { JsonLd } from "@/components/seo/JsonLd";
import { PageCta } from "@/components/organisms/PageCta";
import { listNews } from "@/lib/news/repository";
import { getNewsCollectionSchema } from "@/utils/seo/json-ld";
import {
  pageIntro,
  pageIntroTitle,
  sectionLead,
  sectionMuted,
} from "@/styles/ui";

export function NewsListPageView({ locale }: { locale: Locale }) {
  const copy = getContent(locale);
  const articles = listNews(locale);

  return (
    <>
      <JsonLd data={getNewsCollectionSchema(locale, articles)} />
      <section className={pageIntro}>
        <PageContainer>
          <h1 className={pageIntroTitle}>{copy.news.title}</h1>
          <p className={sectionLead}>{copy.news.lead}</p>
        </PageContainer>
      </section>

      <section className={sectionMuted}>
        <PageContainer>
          {articles.length === 0 ? (
            <p className="m-0 text-[length:var(--home-lead)] text-black/60">
              {copy.news.empty}
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
              {articles.map((article) => (
                <NewsCard key={article.id} locale={locale} article={article} />
              ))}
            </div>
          )}
        </PageContainer>
      </section>

      <PageCta locale={locale} content={copy} />
    </>
  );
}
