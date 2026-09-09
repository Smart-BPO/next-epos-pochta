import Image from "next/image";
import { Suspense } from "react";
import dynamic from "next/dynamic";
import type { Locale } from "@/i18n/config";
import { getContent } from "@/i18n/get-content";
import { localePath } from "@/i18n/paths";
import { Button } from "@/components/atoms/Button";
import { PageContainer } from "@/components/atoms/PageContainer";
import { BusinessLogisticsScene } from "@/components/molecules/BusinessLogisticsScene";
import { DeliveryChain } from "@/components/molecules/DeliveryChain";
import { HomeActionBar } from "@/components/molecules/HomeActionBar";
import { NewsCard } from "@/components/molecules/NewsCard";
import { getLatestNews } from "@/lib/news/repository";
import {
  homeHero,
  homeHeroCopy,
  homeHeroGrid,
  homeHeroLead,
  homeHeroMap,
  homeHeroNote,
  homeHeroTitle,
  homeHeroVisual,
  homeNeedsCard,
  homeNeedsGrid,
  homeNeedsSection,
  homeSectionLead,
  homeSectionTitle,
  section,
  sectionMuted,
} from "@/styles/ui";

const GeoSection = dynamic(
  () =>
    import("@/components/organisms/GeoSection").then((m) => m.GeoSection),
  {
    loading: () => (
      <section className={section} aria-hidden>
        <PageContainer>
          <div className="min-h-[22rem] animate-pulse rounded-3xl bg-black/[0.04] motion-reduce:animate-none" />
        </PageContainer>
      </section>
    ),
  },
);

const NEED_IMAGES: Record<string, string> = {
  documents: "/images/home/needs/documents.png",
  parcel: "/images/home/needs/parcels.png",
  goods: "/images/home/needs/goods.png",
  regular: "/images/home/needs/regular.png",
};

const BUSINESS_ICONS = [
  "/images/home/business/regular-pickup.svg",
  "/images/home/business/bulk-shipments.svg",
  "/images/home/business/doorstep-delivery.svg",
  "/images/home/business/returns.svg",
  "/images/home/business/cash-on-delivery.svg",
  "/images/home/business/api-reporting.svg",
] as const;

const BENEFIT_ICONS = [
  "/images/home/benefits/delivery.svg",
  "/images/home/benefits/free.svg",
  "/images/home/benefits/return.svg",
  "/images/home/benefits/sms.svg",
  "/images/home/benefits/tracking.svg",
  "/images/home/benefits/support.svg",
  "/images/home/benefits/api.svg",
  "/images/home/benefits/terms.svg",
] as const;

async function HomeNewsSection({
  locale,
  copy,
}: {
  locale: Locale;
  copy: ReturnType<typeof getContent>;
}) {
  const latestNews = await getLatestNews(locale, 3);
  if (latestNews.length === 0) return null;

  return (
    <section className={sectionMuted}>
      <PageContainer className="flex flex-col gap-6 md:gap-9">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex max-w-xl flex-col gap-2">
            <h2 className={homeSectionTitle}>{copy.home.newsTitle}</h2>
            <p className={homeSectionLead}>{copy.home.newsLead}</p>
          </div>
          <Button
            href={localePath(locale, "/news/")}
            variant="secondary"
            className="shrink-0 self-start sm:self-auto"
          >
            {copy.home.newsAll}
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3">
          {latestNews.map((article) => (
            <NewsCard key={article.id} locale={locale} article={article} />
          ))}
        </div>
      </PageContainer>
    </section>
  );
}

export async function HomePageView({ locale }: { locale: Locale }) {
  const copy = getContent(locale);

  return (
    <>
      <section className={homeHero}>
        <PageContainer className={homeHeroGrid}>
          <div className={homeHeroCopy}>
            <h1 className={homeHeroTitle}>{copy.home.heroTitle}</h1>
            <p className={homeHeroLead}>{copy.home.heroLead}</p>
            <p className={homeHeroNote}>{copy.home.heroNote}</p>
          </div>

          <div className={homeHeroVisual}>
            <Image
              src="/images/hero/uzbekistan-map.svg"
              alt=""
              width={1000}
              height={652}
              className={homeHeroMap}
              unoptimized
            />
          </div>
        </PageContainer>
      </section>

      <div className="relative">
        <HomeActionBar locale={locale} copy={copy} />
        <section className={homeNeedsSection}>
          <PageContainer className="flex flex-col gap-4 sm:gap-5 md:gap-7">
            <h2
              className={`${homeSectionTitle} text-[1.35rem] text-white sm:text-[length:var(--home-title)]`}
            >
              {copy.home.needsTitle}
            </h2>
            <div className={homeNeedsGrid}>
              {copy.home.needs.map((item) => (
                <article key={item.id} className={homeNeedsCard}>
                  <h3 className="m-0 font-display text-sm font-semibold uppercase leading-tight text-black sm:text-lg md:text-xl">
                    {item.title}
                  </h3>
                  <div className="relative mx-auto h-20 w-full shrink-0 overflow-hidden sm:h-28 lg:h-[10.5rem]">
                    <Image
                      src={NEED_IMAGES[item.id] ?? NEED_IMAGES.documents}
                      alt=""
                      fill
                      className="object-contain object-center"
                      sizes="(max-width: 640px) 45vw, (max-width: 1024px) 50vw, 25vw"
                      loading="lazy"
                    />
                  </div>
                  <p className="m-0 hidden flex-1 text-sm text-black/60 sm:block sm:text-base">
                    {item.description}
                  </p>
                </article>
              ))}
            </div>
          </PageContainer>
        </section>
      </div>

      <section className={section}>
        <PageContainer className="flex flex-col gap-6 md:gap-9">
          <h2 className={homeSectionTitle}>{copy.home.modesTitle}</h2>
          <DeliveryChain locale={locale} />
        </PageContainer>
      </section>

      <section className={section}>
        <PageContainer className="flex flex-col gap-6 md:gap-9">
          <h2 className={homeSectionTitle}>{copy.home.benefitsTitle}</h2>
          <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
            {copy.home.benefits.map((text, index) => (
              <article
                key={text}
                className="flex h-full flex-col gap-2.5 rounded-2xl border border-black/15 bg-white p-3 sm:gap-4 sm:rounded-3xl sm:border-black/20 sm:p-[var(--card-pad)]"
              >
                <div className="relative size-9 shrink-0 sm:size-12">
                  <Image
                    src={BENEFIT_ICONS[index] ?? BENEFIT_ICONS[0]}
                    alt=""
                    width={48}
                    height={48}
                    className="size-full"
                    unoptimized
                    loading="lazy"
                  />
                </div>
                <p className="m-0 text-sm leading-snug text-black/60 sm:text-lg md:text-xl">
                  {text}
                </p>
              </article>
            ))}
          </div>
        </PageContainer>
      </section>

      <section className={section}>
        <PageContainer className="flex flex-col gap-6 md:gap-9">
          <h2 className={homeSectionTitle}>{copy.home.howTitle}</h2>
          <div className="flex flex-col items-center gap-3 sm:gap-4 md:gap-6 lg:flex-row lg:items-center lg:justify-between lg:gap-0">
            {copy.home.howSteps.map((step, index) => (
              <div
                key={step.title}
                className="flex w-full flex-col items-center gap-3 sm:gap-4 md:gap-6 lg:w-auto lg:min-w-0 lg:flex-1 lg:flex-row lg:gap-0"
              >
                <article className="flex aspect-square w-full max-w-[min(100%,14rem)] flex-col items-center justify-center gap-2 overflow-hidden rounded-full border border-black/20 bg-white px-5 py-4 text-center sm:max-w-[min(100%,16rem)] sm:gap-3 sm:px-7 sm:py-5 md:max-w-[min(100%,18.125rem)] md:gap-4 md:px-8 md:py-6 lg:mx-auto">
                  <p className="m-0 font-display text-4xl font-semibold uppercase text-black/30 sm:text-5xl md:text-6xl">
                    {index + 1}
                  </p>
                  <h3 className="m-0 text-base font-medium text-black sm:text-xl md:text-2xl">
                    {step.title}
                  </h3>
                  <p className="m-0 text-sm text-black/60 sm:text-base md:text-lg">
                    {step.text}
                  </p>
                </article>
                {index < copy.home.howSteps.length - 1 ? (
                  <div className="z-10 shrink-0 rounded-full bg-gradient-to-b from-primary to-primary-hover px-3 py-1.5 sm:px-4 sm:py-2 lg:-mx-2 xl:-mx-3">
                    <Image
                      src="/images/home/steps/arrow.svg"
                      alt=""
                      width={32}
                      height={32}
                      className="size-6 rotate-90 sm:size-8 lg:rotate-0"
                      unoptimized
                      loading="lazy"
                    />
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </PageContainer>
      </section>

      <section className="bg-gradient-to-b from-primary to-primary-hover py-[var(--section-y)]">
        <PageContainer>
          <div className="grid items-stretch gap-6 overflow-hidden rounded-3xl bg-white p-5 shadow-[0_16px_48px_rgb(15_18_24/0.12)] sm:gap-8 sm:p-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-6 lg:p-10 xl:gap-10">
            <div className="flex flex-col gap-5 lg:gap-6 lg:py-1">
              <p className="m-0 text-sm font-semibold uppercase tracking-[0.08em] text-primary">
                {copy.home.businessEyebrow}
              </p>
              <h2 className={`${homeSectionTitle} max-w-[22ch]`}>
                {copy.home.businessTitle}
              </h2>
              <p className="m-0 max-w-[34rem] text-[length:var(--home-lead)] text-black/60">
                {copy.home.businessLead}
              </p>

              <ul className="m-0 mt-1 grid list-none grid-cols-2 gap-x-4 gap-y-5 p-0 sm:grid-cols-3 sm:gap-x-6 sm:gap-y-7">
                {copy.home.businessItems.map((item, index) => (
                  <li
                    key={item}
                    className="flex flex-col items-start gap-2.5 sm:items-center sm:text-center"
                  >
                    <Image
                      src={BUSINESS_ICONS[index] ?? BUSINESS_ICONS[0]}
                      alt=""
                      width={36}
                      height={36}
                      className="size-8 sm:size-9"
                      unoptimized
                      loading="lazy"
                    />
                    <span className="text-sm font-medium leading-snug text-black sm:text-[0.95rem]">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-auto flex flex-col gap-3 pt-2 sm:flex-row sm:flex-wrap">
                <Button
                  href={`${localePath(locale, "/business/")}#api`}
                  variant="secondary"
                  width="mobile"
                >
                  {copy.ui.learnApi}
                </Button>
                <Button
                  href={localePath(locale, "/business/connect/")}
                  variant="primary"
                  width="mobile"
                >
                  {copy.ui.getOffer}
                </Button>
              </div>
            </div>

            <BusinessLogisticsScene />
          </div>
        </PageContainer>
      </section>

      <GeoSection locale={locale} copy={copy} />

      <Suspense fallback={null}>
        <HomeNewsSection locale={locale} copy={copy} />
      </Suspense>

      <section className="pb-[var(--section-y)]">
        <PageContainer>
          <div className="relative overflow-hidden rounded-3xl border border-black/20 bg-black p-6 sm:p-8 md:min-h-[17.5rem] md:p-12">
            <div className="relative z-10 flex max-w-xl flex-col gap-4">
              <h2 className={`${homeSectionTitle} text-white`}>
                {copy.home.finalTitle}
              </h2>
              <p className="m-0 text-[length:var(--home-lead)] text-white/60">
                {copy.home.finalLead}
              </p>
              <div className="mt-2">
                <Button href={localePath(locale, "/request-price/")} variant="primary">
                  {copy.ui.requestPrice}
                </Button>
              </div>
            </div>
            <Image
              src="/images/home/cta/devices.png"
              alt=""
              width={442}
              height={230}
              className="pointer-events-none relative mx-auto mt-6 block h-auto w-full max-w-xs select-none object-contain object-bottom sm:mt-8 sm:max-w-md md:absolute md:-bottom-1 md:right-0 md:mx-0 md:mt-0 md:h-[min(100%,18.5rem)] md:w-[min(52%,28rem)] md:max-w-none md:object-cover md:object-top"
              sizes="(max-width: 768px) 100vw, 28rem"
              loading="lazy"
            />
          </div>
        </PageContainer>
      </section>
    </>
  );
}
