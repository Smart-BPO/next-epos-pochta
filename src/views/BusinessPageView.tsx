import Image from "next/image";
import type { Locale } from "@/i18n/config";
import { getContent } from "@/i18n/get-content";
import { SITE_CONFIG } from "@/utils/consts";
import { Button } from "@/components/atoms/Button";
import { PageContainer } from "@/components/atoms/PageContainer";
import { BusinessForm } from "@/components/organisms/BusinessForm";
import { PageCta } from "@/components/organisms/PageCta";
import { cn } from "@/lib/cn";
import {
  anchorSection,
  heroActions,
  heroBrand,
  heroLead,
  heroTitle,
  homeSectionLead,
  homeSectionTitle,
  section,
  sectionLead,
  sectionMuted,
  sectionTitle,
} from "@/styles/ui";

const CAPABILITY_ICONS = [
  "/images/home/benefits/delivery.svg",
  "/images/home/benefits/free.svg",
  "/images/home/benefits/return.svg",
  "/images/home/benefits/sms.svg",
  "/images/home/benefits/tracking.svg",
  "/images/home/benefits/support.svg",
  "/images/home/benefits/api.svg",
  "/images/home/benefits/terms.svg",
] as const;

const SEGMENT_IMAGES = [
  "/images/home/needs/goods.png",
  "/images/home/needs/regular.png",
  "/images/home/needs/parcels.png",
] as const;

export function BusinessPageView({ locale }: { locale: Locale }) {
  const copy = getContent(locale);

  return (
    <>
      <section className="relative isolate overflow-hidden bg-white pt-[calc(var(--header-height)+1.5rem)] pb-[var(--section-y)]">
        <Image
          src="/images/hero/uzbekistan-map.svg"
          alt=""
          width={1000}
          height={652}
          className="pointer-events-none absolute inset-y-0 right-0 hidden w-[min(100%,40rem)] max-w-[min(100%,46rem)] select-none object-contain object-right opacity-90 md:block"
          unoptimized
          priority
        />
        <PageContainer className="relative z-10 flex max-w-xl flex-col gap-4 md:gap-6">
          <p className={heroBrand}>{SITE_CONFIG.name}</p>
          <h1 className={heroTitle}>{copy.business.heroTitle}</h1>
          <p className={heroLead}>{copy.business.heroLead}</p>
          <div className={heroActions}>
            <Button href="#business-form" variant="primary">
              {copy.ui.getOffer}
            </Button>
            <Button href="#api" variant="secondary">
              {copy.ui.learnApi}
            </Button>
          </div>
        </PageContainer>
      </section>

      <section className="bg-gradient-to-b from-primary to-primary-hover py-[var(--section-y)]">
        <PageContainer className="flex flex-col gap-6 md:gap-9">
          <h2 className={`${homeSectionTitle} text-white`}>
            {copy.business.segmentsTitle}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
            {copy.business.segments.map((segment, index) => (
              <article
                key={segment.title}
                className="flex h-full flex-col gap-4 rounded-3xl border border-black/20 bg-white p-[var(--card-pad)]"
              >
                <h3 className="m-0 min-h-[2.5em] font-display text-xl font-semibold uppercase leading-tight text-black md:text-2xl">
                  {segment.title}
                </h3>
                <div className="relative h-[10rem] w-full shrink-0 overflow-hidden sm:h-[12.5rem]">
                  <Image
                    src={SEGMENT_IMAGES[index % SEGMENT_IMAGES.length]}
                    alt=""
                    fill
                    className="object-contain object-center"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>
                <p className="m-0 flex-1 text-base text-black/60">{segment.text}</p>
              </article>
            ))}
          </div>
        </PageContainer>
      </section>

      <section className={section}>
        <PageContainer className="flex flex-col gap-6 md:gap-9">
          <div className="flex max-w-xl flex-col gap-2">
            <h2 className={homeSectionTitle}>{copy.business.capabilitiesTitle}</h2>
            <p className={homeSectionLead}>{copy.business.heroLead}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
            {copy.business.capabilities.map((item, index) => (
              <article
                key={item}
                className="flex h-full flex-col gap-4 rounded-3xl border border-black/20 bg-white p-[var(--card-pad)]"
              >
                <div className="relative size-12 shrink-0">
                  <Image
                    src={CAPABILITY_ICONS[index % CAPABILITY_ICONS.length]}
                    alt=""
                    width={48}
                    height={48}
                    unoptimized
                  />
                </div>
                <p className="m-0 text-lg text-black/60 md:text-xl">{item}</p>
              </article>
            ))}
          </div>
        </PageContainer>
      </section>

      <section className={sectionMuted}>
        <PageContainer className="flex flex-col gap-6 md:gap-9">
          <h2 className={homeSectionTitle}>{copy.business.connectTitle}</h2>
          <div className="flex flex-col items-center gap-4 md:gap-6 lg:flex-row lg:items-center lg:justify-between lg:gap-0">
            {copy.business.connectSteps.map((stepText, index) => (
              <div
                key={stepText}
                className="flex w-full flex-col items-center gap-4 md:gap-6 lg:w-auto lg:min-w-0 lg:flex-1 lg:flex-row lg:gap-0"
              >
                <article className="flex aspect-square w-full max-w-[min(100%,18.125rem)] flex-col items-center justify-center gap-3 overflow-hidden rounded-full border border-black/20 bg-white px-6 py-5 text-center sm:gap-4 sm:px-8 sm:py-6 lg:mx-auto">
                  <p className="m-0 font-display text-5xl font-semibold uppercase text-black/30 md:text-6xl">
                    {index + 1}
                  </p>
                  <p className="m-0 text-base text-black/60 sm:text-lg">{stepText}</p>
                </article>
                {index < copy.business.connectSteps.length - 1 ? (
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

      <section className={cn(section, anchorSection)} id="api">
        <PageContainer>
          <div className="relative overflow-hidden rounded-3xl border border-black/20 bg-black p-6 text-white sm:p-8 md:p-12">
            <div className="relative z-10 flex max-w-xl flex-col gap-4">
              <div className="relative size-12">
                <Image
                  src="/images/home/benefits/api.svg"
                  alt=""
                  width={48}
                  height={48}
                  className="brightness-0 invert"
                  unoptimized
                />
              </div>
              <h2 className={`${homeSectionTitle} text-white`}>
                {copy.business.apiTitle}
              </h2>
              <p className="m-0 text-[length:var(--home-lead)] text-white/60">
                {copy.business.apiLead}
              </p>
              <div className="mt-2">
                <Button href="#business-form" variant="primary">
                  {copy.ui.getOffer}
                </Button>
              </div>
            </div>
          </div>
        </PageContainer>
      </section>

      <section className={cn(sectionMuted, anchorSection)} id="business-form">
        <PageContainer className="flex flex-col gap-6 md:gap-9">
          <div>
            <h2 className={sectionTitle}>{copy.business.formTitle}</h2>
            <p className={sectionLead}>{copy.business.heroLead}</p>
          </div>
          <div className="rounded-3xl border border-black/20 bg-white p-[var(--card-pad)]">
            <BusinessForm locale={locale} content={copy} />
          </div>
        </PageContainer>
      </section>

      <PageCta locale={locale} content={copy} />
    </>
  );
}
