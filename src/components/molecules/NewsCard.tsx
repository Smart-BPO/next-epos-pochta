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
  const categoryLabel = copy.news.categories[article.category];

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-3xl border border-black/20 bg-white">
      {article.coverImage ? (
        <Link
          href={href}
          className="relative block aspect-[16/10] shrink-0 bg-surface-muted"
        >
          <Image
            src={article.coverImage}
            alt=""
            fill
            className="object-contain object-center p-4"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </Link>
      ) : null}
      <div className="flex flex-1 flex-col gap-3 p-[var(--card-pad)]">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-black/50">
          <time dateTime={article.publishedAt}>
            {formatNewsDate(article.publishedAt, locale)}
          </time>
          <span aria-hidden className="text-black/25">
            ·
          </span>
          <span>{categoryLabel}</span>
        </div>
        <h3 className="m-0 font-display text-xl font-semibold uppercase leading-snug tracking-[-0.02em] text-black">
          <Link href={href} className="hover:text-primary">
            {article.title}
          </Link>
        </h3>
        <p className="m-0 flex-1 text-base leading-normal text-black/60">
          {article.excerpt}
        </p>
        <Link
          href={href}
          className="mt-1 inline-flex text-base font-medium text-primary hover:underline"
        >
          {copy.news.readMore}
        </Link>
      </div>
    </article>
  );
}
