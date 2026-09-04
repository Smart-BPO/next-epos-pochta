import Image from "next/image";
import type { Locale } from "@/i18n/config";
import { getContent } from "@/i18n/get-content";
import { localePath } from "@/i18n/paths";
import { Button } from "@/components/atoms/Button";
import { PageContainer } from "@/components/atoms/PageContainer";
import { FaqList } from "@/components/molecules/FaqList";
import { GeoSearch } from "@/components/molecules/GeoSearch";
import { NewsCard } from "@/components/molecules/NewsCard";
import { QuickTrackForm } from "@/components/molecules/QuickTrackForm";
import { JsonLd } from "@/components/seo/JsonLd";
import { getLatestNews } from "@/lib/news/repository";
import { getFaqSchema } from "@/utils/seo/json-ld";
import {
  homeHero,
  homeHeroActions,
  homeHeroCopy,
  homeHeroGrid,
  homeHeroLead,
  homeHeroMap,
  homeHeroNote,
  homeHeroTitle,
  homeHeroVisual,
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
      <JsonLd data={getFaqSchema(copy.home.faq)} />

      <section className={homeHero}>
        <PageContainer className={homeHeroGrid}>
          <div className={homeHeroCopy}>
            <h1 className={homeHeroTitle}>{copy.home.heroTitle}</h1>
            <p className={homeHeroLead}>{copy.home.heroLead}</p>
            <p className={homeHeroNote}>{copy.home.heroNote}</p>
            <div className={homeHeroActions}>
              <Button
                href={localePath(locale, "/request-price/")}
                variant="heroPrimary"
              >
                {copy.ui.requestPrice}
              </Button>
              <Button
                href={`${localePath(locale, "/request-price/")}?pickup=1`}
                variant="heroSecondary"
              >
                {copy.ui.callCourier}
              </Button>
            </div>
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
            <QuickTrackForm locale={locale} copy={copy} variant="hero" />
          </div>
        </PageContainer>
      </section>

      <section className="bg-gradient-to-b from-primary to-primary-hover py-[var(--section-y)]">
        <PageContainer className="flex flex-col gap-6 md:gap-9">
          <h2 className={`${homeSectionTitle} text-white`}>
            {copy.home.needsTitle}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
            {copy.home.needs.map((item) => (
              <article
                key={item.id}
                className="flex h-full flex-col gap-4 rounded-3xl border border-black/20 bg-white p-[var(--card-pad)]"
              >
                <h3 className="m-0 min-h-[2.5em] font-display text-xl font-semibold uppercase leading-tight text-black md:text-2xl">
                  {item.title}
                </h3>
                <div className="relative h-[10rem] w-full shrink-0 overflow-hidden sm:h-[12.5rem]">
                  <Image
                    src={NEED_IMAGES[item.id] ?? NEED_IMAGES.documents}
                    alt=""
                    fill
                    className="object-contain object-center"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                </div>
                <p className="m-0 flex-1 text-base text-black/60">
                  {item.description}
                </p>
                <Button
                  href={`${localePath(locale, "/request-price/")}?category=${item.id}`}
                  variant="secondary"
                  className="w-full"
                >
                  {copy.ui.requestPrice}
                </Button>
              </article>
            ))}
          </div>
        </PageContainer>
      </section>

      <section className={section}>
        <PageContainer className="flex flex-col gap-6 md:gap-9">
          <h2 className={homeSectionTitle}>{copy.home.modesTitle}</h2>
          <div className="flex flex-col gap-4 md:gap-6">
            {copy.home.modes.map((mode, index) => (
              <article
                key={mode.id}
                className="relative overflow-hidden rounded-3xl border border-black/20 bg-white p-[var(--card-pad)] pr-16 sm:pr-20 md:pr-28"
              >
                <h3 className="relative z-10 m-0 max-w-[18ch] font-display text-xl font-semibold uppercase text-black md:max-w-none md:text-2xl">
                  {mode.title}
                </h3>
                <p className="relative z-10 mt-3 max-w-2xl text-base text-black/60 md:mt-4">
                  {mode.description}
                </p>
                <span
                  aria-hidden
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rotate-[15deg] font-display text-[4.5rem] font-black leading-none text-black/20 sm:right-6 sm:text-[6rem] md:right-12 md:text-[10rem]"
                >
                  {index + 1}
                </span>
              </article>
            ))}
          </div>
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

      <section className={section}>
        <PageContainer className="flex flex-col gap-6 md:gap-9">
          <div className="flex flex-col gap-4">
            <h2 className={`${homeSectionTitle} max-w-[45rem]`}>
              {copy.home.businessTitle}
            </h2>
            <p className={homeSectionLead}>{copy.home.businessLead}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
            {copy.home.businessItems.map((item) => (
              <div
                key={item}
                className="rounded-full border border-black/20 bg-white px-5 py-5 text-center text-lg text-black sm:px-6 sm:py-6 md:text-xl"
              >
                {item}
              </div>
            ))}
            <Button
              href={`${localePath(locale, "/business/")}#api`}
              variant="secondary"
              className="w-full self-stretch"
            >
              {copy.ui.learnApi}
            </Button>
            <Button
              href={localePath(locale, "/business/")}
              variant="primary"
              className="w-full self-stretch"
            >
              {copy.ui.getOffer}
            </Button>
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

      <section id="faq" className={`${section} scroll-mt-[var(--header-height)]`}>
        <PageContainer className="flex flex-col gap-6 md:gap-9">
          <h2 className={homeSectionTitle}>{copy.home.faqTitle}</h2>
          <FaqList items={copy.home.faq} />
        </PageContainer>
      </section>

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
