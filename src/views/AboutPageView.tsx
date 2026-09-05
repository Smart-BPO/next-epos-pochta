import Image from "next/image";
import type { Locale } from "@/i18n/config";
import { getContent } from "@/i18n/get-content";
import { localePath } from "@/i18n/paths";
import { Button } from "@/components/atoms/Button";
import { PageContainer } from "@/components/atoms/PageContainer";
import { GeoSearch } from "@/components/molecules/GeoSearch";
import { PageCta } from "@/components/organisms/PageCta";
import { SITE_CONFIG } from "@/utils/consts";
import {
  homeSectionLead,
  homeSectionTitle,
  pageIntro,
  pageIntroTitle,
  sectionLead,
  sectionMuted,
  sectionTitle,
} from "@/styles/ui";

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
          <div className="relative overflow-hidden rounded-3xl border border-black/20 bg-white p-6 sm:p-8 md:min-h-[16rem] md:p-12">
            <div className="relative z-10 max-w-2xl">
              <h2 className={homeSectionTitle}>{copy.about.missionTitle}</h2>
              <p className="mt-4 m-0 text-[length:var(--home-lead)] text-black/60">
                {copy.about.mission}
              </p>
            </div>
            <Image
              src="/images/home/cta/devices.png"
              alt=""
              width={442}
              height={230}
              className="pointer-events-none relative mx-auto mt-8 block h-auto w-full max-w-sm select-none object-contain opacity-90 md:absolute md:bottom-0 md:right-0 md:mx-0 md:mt-0 md:h-[min(100%,14rem)] md:w-[min(42%,22rem)] md:max-w-none"
              sizes="(max-width: 768px) 100vw, 22rem"
            />
          </div>
        </PageContainer>
      </section>

      <section className="relative isolate overflow-hidden py-[var(--section-y)]">
        <Image
          src="/images/hero/uzbekistan-map.svg"
          alt=""
          width={1000}
          height={652}
          className="pointer-events-none absolute inset-y-0 right-0 hidden w-[min(100%,40rem)] max-w-[min(100%,46rem)] select-none object-contain object-right opacity-90 md:block"
          unoptimized
        />
        <PageContainer className="relative z-10 flex flex-col gap-6 md:gap-9">
          <div className="flex max-w-xl flex-col gap-2">
            <h2 className={homeSectionTitle}>{copy.about.geoTitle}</h2>
            <p className={homeSectionLead}>{copy.about.geo}</p>
          </div>
          <GeoSearch locale={locale} copy={copy} variant="home" />
        </PageContainer>
      </section>

      <section className={sectionMuted}>
        <PageContainer className="flex flex-col gap-6 md:gap-9">
          <h2 className={sectionTitle}>{copy.about.legalTitle}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
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
              <Button
                href={localePath(locale, "/contacts/")}
                variant="secondary"
                className="mt-4"
              >
                {copy.footer.contacts}
              </Button>
            </article>
          </div>
        </PageContainer>
      </section>

      <PageCta locale={locale} content={copy} />
    </>
  );
}
