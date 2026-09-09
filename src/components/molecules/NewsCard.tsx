import Image from "next/image";
import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { localePath } from "@/i18n/paths";
import type { LocalizedNewsArticle } from "@/data/news/types";
import { formatNewsDate } from "@/lib/news/repository";
import { getContent } from "@/i18n/get-content";

export function NewsCard({
  locale,
  article,
}: {
  locale: Locale;
  article: LocalizedNewsArticle;
}) {
  const copy = getContent(locale);
  const href = localePath(locale, `/news/${article.slug}/`);
  const categoryLabel =
    (copy.news.categories as Record<string, string>)[article.category] ??
    article.category;

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-black/15 bg-white sm:rounded-3xl sm:border-black/20">
      {article.coverImage ? (
        <Link
          href={href}
          className="relative block aspect-[4/3] shrink-0 bg-surface-muted sm:aspect-[16/10]"
        >
          <Image
            src={article.coverImage}
            alt={article.coverAlt || article.title}
            fill
            className="object-contain object-center p-2.5 sm:p-4"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 33vw"
          />
        </Link>
      ) : null}
      <div className="flex flex-1 flex-col gap-1.5 p-3 sm:gap-3 sm:p-[var(--card-pad)]">
        <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[0.6875rem] leading-snug text-black/50 sm:gap-x-3 sm:gap-y-1 sm:text-sm">
          <time dateTime={article.publishedAt}>
            {formatNewsDate(article.publishedAt, locale)}
          </time>
          <span aria-hidden className="text-black/25">
            ·
          </span>
          <span className="truncate">{categoryLabel}</span>
        </div>
        <h3 className="m-0 font-display text-[0.8125rem] font-semibold uppercase leading-snug tracking-[-0.02em] text-black sm:text-xl">
          <Link href={href} className="hover:text-primary">
            {article.title}
          </Link>
        </h3>
        <p className="m-0 line-clamp-3 flex-1 text-xs leading-snug text-black/60 sm:line-clamp-none sm:text-base sm:leading-normal">
          {article.excerpt}
        </p>
        <Link
          href={href}
          className="mt-0.5 inline-flex text-xs font-medium text-primary hover:underline sm:mt-1 sm:text-base"
        >
          {copy.news.readMore}
        </Link>
      </div>
    </article>
  );
}
