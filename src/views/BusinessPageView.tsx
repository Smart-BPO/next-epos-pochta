import Image from "next/image";
import type { Locale } from "@/i18n/config";
import { getContent } from "@/i18n/get-content";
import { localePath } from "@/i18n/paths";
import { SITE_CONFIG } from "@/utils/consts";
import { Button } from "@/components/atoms/Button";
import { PageContainer } from "@/components/atoms/PageContainer";
import { BusinessForm } from "@/components/organisms/BusinessForm";
import { cn } from "@/lib/cn";
import {
  anchorSection,
  hero,
  heroActions,
  heroBrand,
  heroLead,
  heroTitle,
  section,
  sectionLead,
  sectionMuted,
  sectionTitle,
  step,
  steps,
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

export function BusinessPageView({ locale }: { locale: Locale }) {
  const copy = getContent(locale);

  return (
    <>
      <section className={hero}>
        <PageContainer>
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

      <section className={section}>
        <PageContainer className="flex flex-col gap-6 md:gap-9">
          <h2 className={sectionTitle}>{copy.business.segmentsTitle}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {copy.business.segments.map((s) => (
              <article
                key={s.title}
                className="flex h-full flex-col gap-3 rounded-3xl border border-black/20 bg-white p-[var(--card-pad)]"
              >
                <h3 className="m-0 text-xl font-semibold text-black">{s.title}</h3>
                <p className="m-0 text-base text-black/60">{s.text}</p>
              </article>
            ))}
          </div>
        </PageContainer>
      </section>

      <section className={sectionMuted}>
        <PageContainer className="flex flex-col gap-6 md:gap-9">
          <h2 className={sectionTitle}>{copy.business.capabilitiesTitle}</h2>
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
                <p className="m-0 text-lg text-black/60">{item}</p>
              </article>
            ))}
          </div>
        </PageContainer>
      </section>

      <section className={section}>
        <PageContainer className="flex flex-col gap-6 md:gap-9">
          <h2 className={sectionTitle}>{copy.business.connectTitle}</h2>
          <div className={steps}>
            {copy.business.connectSteps.map((s, index) => (
              <article key={s} className={step}>
                <p className="m-0 mb-1 text-sm font-semibold text-black/40">
                  {index + 1}
                </p>
                <p className="m-0 text-base text-black/70">{s}</p>
              </article>
            ))}
          </div>
        </PageContainer>
      </section>

      <section className={cn(sectionMuted, anchorSection)} id="api">
        <PageContainer>
          <div className="rounded-3xl border border-black/20 bg-white p-[var(--card-pad)]">
            <h2 className={sectionTitle}>{copy.business.apiTitle}</h2>
            <p className={sectionLead}>{copy.business.apiLead}</p>
            <div className="mb-5 flex size-12 items-center justify-center">
              <Image
                src="/images/home/benefits/api.svg"
                alt=""
                width={48}
                height={48}
                unoptimized
              />
            </div>
            <Button href={localePath(locale, "/contacts/")} variant="secondary">
              {copy.ui.learnApi}
            </Button>
          </div>
        </PageContainer>
      </section>

      <section className={cn(section, anchorSection)} id="business-form">
        <PageContainer>
          <h2 className={sectionTitle}>{copy.business.formTitle}</h2>
          <BusinessForm locale={locale} content={copy} />
        </PageContainer>
      </section>
    </>
  );
}
