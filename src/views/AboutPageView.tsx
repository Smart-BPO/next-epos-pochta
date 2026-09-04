import Image from "next/image";
import type { Locale } from "@/i18n/config";
import { getContent } from "@/i18n/get-content";
import { PageContainer } from "@/components/atoms/PageContainer";
import { PageCta } from "@/components/organisms/PageCta";
import { SITE_CONFIG } from "@/utils/consts";
import {
  pageIntro,
  pageIntroTitle,
  section,
  sectionLead,
  sectionMuted,
  sectionTitle,
} from "@/styles/ui";

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

export function AboutPageView({ locale }: { locale: Locale }) {
  const copy = getContent(locale);

  return (
    <>
      <section className={pageIntro}>
        <PageContainer>
          <h1 className={pageIntroTitle}>{copy.about.title}</h1>
          <p className={sectionLead}>{copy.about.lead}</p>
        </PageContainer>
      </section>

      <section className={sectionMuted}>
        <PageContainer>
          <div className="rounded-3xl border border-black/20 bg-white p-[var(--card-pad)]">
            <h2 className={sectionTitle}>{copy.about.missionTitle}</h2>
            <p className="m-0 max-w-3xl text-[length:var(--home-lead)] text-black/60">
              {copy.about.mission}
            </p>
          </div>
        </PageContainer>
      </section>

      <section className={section}>
        <PageContainer>
          <div className="rounded-3xl border border-black/20 bg-white p-[var(--card-pad)]">
            <h2 className={sectionTitle}>{copy.about.geoTitle}</h2>
            <p className="m-0 max-w-3xl text-[length:var(--home-lead)] text-black/60">
              {copy.about.geo}
            </p>
          </div>
        </PageContainer>
      </section>

      <section className={sectionMuted}>
        <PageContainer className="flex flex-col gap-6 md:gap-9">
          <h2 className={sectionTitle}>{copy.about.benefitsTitle}</h2>
          <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
            {copy.home.benefits.map((b, index) => (
              <article
                key={b}
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
                <p className="m-0 text-lg text-black/60">{b}</p>
              </article>
            ))}
          </div>
        </PageContainer>
      </section>

      <section className={section}>
        <PageContainer className="flex flex-col gap-6 md:gap-9">
          <h2 className={sectionTitle}>{copy.about.legalTitle}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <article className="rounded-3xl border border-black/20 bg-white p-[var(--card-pad)]">
              <h3 className="m-0 mb-2 text-lg font-semibold text-black">
                {SITE_CONFIG.legalName}
              </h3>
              <p className="m-0 text-sm text-black/60">
                ИНН / STIR: {SITE_CONFIG.address.inn}
                <br />
                ОКЭД / OKED: {SITE_CONFIG.address.oked}
              </p>
            </article>
            <article className="rounded-3xl border border-black/20 bg-white p-[var(--card-pad)]">
              <h3 className="m-0 mb-2 text-lg font-semibold text-black">
                {locale === "uz" ? "Manzil" : "Адрес"}
              </h3>
              <p className="m-0 text-sm text-black/60">{SITE_CONFIG.address.line}</p>
            </article>
            <article className="rounded-3xl border border-black/20 bg-white p-[var(--card-pad)] sm:col-span-2 lg:col-span-1">
              <h3 className="m-0 mb-2 text-lg font-semibold text-black">
                {copy.ui.call}
              </h3>
              <p className="m-0 text-sm text-black/60">
                <a href={`tel:${SITE_CONFIG.phone}`}>{SITE_CONFIG.phoneDisplay}</a>
              </p>
            </article>
          </div>
        </PageContainer>
      </section>

      <PageCta locale={locale} content={copy} />
    </>
  );
}
