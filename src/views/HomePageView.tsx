import Image from "next/image";
import type { Locale } from "@/i18n/config";
import { getContent } from "@/i18n/get-content";
import { localePath } from "@/i18n/paths";
import { Button } from "@/components/atoms/Button";
import { PageContainer } from "@/components/atoms/PageContainer";
import { BusinessLogisticsScene } from "@/components/molecules/BusinessLogisticsScene";
import { DeliveryChain } from "@/components/molecules/DeliveryChain";
import { GeoSearch } from "@/components/molecules/GeoSearch";
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

export function HomePageView({ locale }: { locale: Locale }) {
  const copy = getContent(locale);
  const latestNews = getLatestNews(locale, 3);

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
              priority
              unoptimized
            />
          </div>
        </PageContainer>
      </section>

      <section className={homeNeedsSection}>
        <HomeActionBar locale={locale} copy={copy} />
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
                  />
                </div>
                <p className="m-0 hidden flex-1 text-sm text-black/60 sm:block sm:text-base">
                  {item.description}
                </p>
                <Button
                  href={
                    item.id === "regular"
                      ? localePath(locale, "/request-price/")
                      : `${localePath(locale, "/calculator/")}?category=${item.id}`
                  }
                  variant="secondary"
                  className="mt-auto w-full !min-h-10 !px-2 !py-2 text-xs sm:!min-h-11 sm:!px-4 sm:text-sm"
                >
                  <span className="sm:hidden">{copy.ui.calculate}</span>
                  <span className="hidden sm:inline">
                    {item.id === "regular"
                      ? copy.ui.requestPrice
                      : copy.ui.calculate}
                  </span>
                </Button>
              </article>
            ))}
          </div>
        </PageContainer>
      </section>

      <section className={section}>
        <PageContainer className="flex flex-col gap-6 md:gap-9">
          <h2 className={homeSectionTitle}>{copy.home.modesTitle}</h2>
          <DeliveryChain locale={locale} />
        </PageContainer>
      </section>

      <section className={section}>
        <PageContainer className="flex flex-col gap-6 md:gap-9">
          <h2 className={homeSectionTitle}>{copy.home.benefitsTitle}</h2>
          <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
            {copy.home.benefits.map((text, index) => (
              <article
                key={text}
                className="flex h-full flex-col gap-4 rounded-3xl border border-black/20 bg-white p-[var(--card-pad)]"
              >
                <div className="relative size-12 shrink-0">
                  <Image
                    src={BENEFIT_ICONS[index] ?? BENEFIT_ICONS[0]}
                    alt=""
                    width={48}
                    height={48}
                    unoptimized
                  />
                </div>
                <p className="m-0 text-lg text-black/60 md:text-xl">{text}</p>
              </article>
            ))}
          </div>
        </PageContainer>
      </section>

      <section className={section}>
        <PageContainer className="flex flex-col gap-6 md:gap-9">
          <h2 className={homeSectionTitle}>{copy.home.howTitle}</h2>
          <div className="flex flex-col items-center gap-4 md:gap-6 lg:flex-row lg:items-center lg:justify-between lg:gap-0">
            {copy.home.howSteps.map((step, index) => (
              <div
                key={step.title}
                className="flex w-full flex-col items-center gap-4 md:gap-6 lg:w-auto lg:min-w-0 lg:flex-1 lg:flex-row lg:gap-0"
              >
                <article className="flex aspect-square w-full max-w-[min(100%,18.125rem)] flex-col items-center justify-center gap-3 overflow-hidden rounded-full border border-black/20 bg-white px-6 py-5 text-center sm:gap-4 sm:px-8 sm:py-6 lg:mx-auto">
                  <p className="m-0 font-display text-5xl font-semibold uppercase text-black/30 md:text-6xl">
                    {index + 1}
                  </p>
                  <h3 className="m-0 text-lg font-medium text-black sm:text-xl md:text-2xl">
                    {step.title}
                  </h3>
                  <p className="m-0 text-base text-black/60 sm:text-lg">{step.text}</p>
                </article>
                {index < copy.home.howSteps.length - 1 ? (
                  <div className="z-10 shrink-0 rounded-full bg-gradient-to-b from-primary to-primary-hover px-4 py-2 lg:-mx-2 xl:-mx-3">
                    <Image
                      src="/images/home/steps/arrow.svg"
                      alt=""
                      width={32}
                      height={32}
                      className="rotate-90 lg:rotate-0"
                      unoptimized
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
          <div className="grid items-stretch gap-8 overflow-hidden rounded-3xl bg-white p-6 shadow-[0_16px_48px_rgb(15_18_24/0.12)] sm:p-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-6 lg:p-10 xl:gap-10">
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

              <ul className="m-0 mt-1 grid list-none grid-cols-2 gap-x-5 gap-y-6 p-0 sm:grid-cols-3 sm:gap-x-6 sm:gap-y-7">
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
                      className="size-9"
                      unoptimized
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
                  className="w-full sm:w-auto"
                >
                  {copy.ui.learnApi}
                </Button>
                <Button
                  href={localePath(locale, "/business/connect/")}
                  variant="primary"
                  className="w-full sm:w-auto"
                >
                  {copy.ui.getOffer}
                </Button>
              </div>
            </div>

            <BusinessLogisticsScene />
          </div>
        </PageContainer>
      </section>

      <section
        id="geo"
        className="relative isolate scroll-mt-[var(--header-height)] overflow-hidden py-[var(--section-y)]"
      >
        <Image
          src="/images/hero/uzbekistan-map.svg"
          alt=""
          width={1000}
          height={652}
          className="pointer-events-none absolute inset-y-0 right-0 hidden w-[min(100%,40rem)] max-w-[min(100%,46rem)] select-none object-contain object-right opacity-90 md:block"
          unoptimized
        />
        <PageContainer className="relative z-10 flex flex-col gap-6 md:gap-9">
          <div className="flex max-w-xl flex-col gap-4">
            <h2 className={homeSectionTitle}>{copy.home.geoTitle}</h2>
            <p className={homeSectionLead}>{copy.home.geoLead}</p>
          </div>
          <GeoSearch locale={locale} copy={copy} variant="home" />
          <Image
            src="/images/hero/uzbekistan-map.svg"
            alt=""
            width={1000}
            height={652}
            className="pointer-events-none relative mx-auto h-auto w-full max-w-sm select-none object-contain opacity-90 md:hidden"
            unoptimized
          />
        </PageContainer>
      </section>

      {latestNews.length > 0 ? (
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
            <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
              {latestNews.map((article) => (
                <NewsCard key={article.id} locale={locale} article={article} />
              ))}
            </div>
          </PageContainer>
        </section>
      ) : null}

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
              className="pointer-events-none relative mx-auto mt-8 block h-auto w-full max-w-md select-none object-contain object-bottom md:absolute md:-bottom-1 md:right-0 md:mx-0 md:mt-0 md:h-[min(100%,18.5rem)] md:w-[min(52%,28rem)] md:max-w-none md:object-cover md:object-top"
              sizes="(max-width: 768px) 100vw, 28rem"
            />
          </div>
        </PageContainer>
      </section>
    </>
  );
}
