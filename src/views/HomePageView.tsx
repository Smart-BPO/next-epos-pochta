import Image from "next/image";
import type { Locale } from "@/i18n/config";
import { getContent } from "@/i18n/get-content";
import { localePath } from "@/i18n/paths";
import { Button } from "@/components/atoms/Button";
import { PageContainer } from "@/components/atoms/PageContainer";
import { TrustIcon } from "@/components/atoms/TrustIcon";
import { GeoSearch } from "@/components/molecules/GeoSearch";
import { QuickTrackForm } from "@/components/molecules/QuickTrackForm";
import { JsonLd } from "@/components/seo/JsonLd";
import { getFaqSchema } from "@/utils/seo/json-ld";
import {
  actionTile,
  faqDetails,
  faqSummary,
  featureItem,
  featureItemText,
  featureItemTitle,
  featureList,
  heroActions,
  homeHero,
  homeHeroActions,
  homeHeroCopy,
  homeHeroGrid,
  homeHeroLead,
  homeHeroMap,
  homeHeroNote,
  homeHeroTitle,
  homeHeroVisual,
  pageCta,
  section,
  sectionLead,
  sectionMuted,
  sectionTitle,
  step,
  steps,
  trustGrid,
  trustItem,
} from "@/styles/ui";

export function HomePageView({ locale }: { locale: Locale }) {
  const copy = getContent(locale);

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

      <section className={sectionMuted}>
        <PageContainer>
          <h2 className={sectionTitle}>{copy.home.needsTitle}</h2>
          <div>
            {copy.home.needs.map((item) => (
              <article key={item.id} className={actionTile}>
                <div>
                  <h3 className="m-0 text-[1.1rem] font-semibold">{item.title}</h3>
                  <p className="m-0 text-ink-muted">{item.description}</p>
                </div>
                <Button
                  href={`${localePath(locale, "/request-price/")}?category=${item.id}`}
                >
                  {copy.ui.requestPrice}
                </Button>
              </article>
            ))}
          </div>
        </PageContainer>
      </section>

      <section className={section}>
        <PageContainer>
          <h2 className={sectionTitle}>{copy.home.modesTitle}</h2>
          <ul className={featureList}>
            {copy.home.modes.map((mode) => (
              <li key={mode.id} className={featureItem}>
                <h3 className={featureItemTitle}>{mode.title}</h3>
                <p className={featureItemText}>{mode.description}</p>
              </li>
            ))}
          </ul>
        </PageContainer>
      </section>

      <section className={sectionMuted}>
        <PageContainer>
          <h2 className={sectionTitle}>{copy.home.benefitsTitle}</h2>
          <div className={trustGrid}>
            {copy.home.benefits.map((b, index) => (
              <article key={b} className={trustItem}>
                <TrustIcon index={index} />
                <h3 className="m-0 text-[1.05rem] font-semibold">{b}</h3>
              </article>
            ))}
          </div>
        </PageContainer>
      </section>

      <section className={section}>
        <PageContainer>
          <h2 className={sectionTitle}>{copy.home.howTitle}</h2>
          <div className={steps}>
            {copy.home.howSteps.map((s) => (
              <article key={s.title} className={step}>
                <h3 className="m-0 mb-1.5">{s.title}</h3>
                <p className="m-0 text-ink-muted">{s.text}</p>
              </article>
            ))}
          </div>
        </PageContainer>
      </section>

      <section className={sectionMuted}>
        <PageContainer>
          <h2 className={sectionTitle}>{copy.home.businessTitle}</h2>
          <p className={sectionLead}>{copy.home.businessLead}</p>
          <ul className={featureList}>
            {copy.home.businessItems.map((item) => (
              <li key={item} className={featureItem}>
                <p className={featureItemText}>{item}</p>
              </li>
            ))}
          </ul>
          <div className={`${heroActions} mt-5`}>
            <Button href={localePath(locale, "/business/")}>
              {copy.ui.getOffer}
            </Button>
            <Button
              href={`${localePath(locale, "/business/")}#api`}
              variant="secondary"
            >
              {copy.ui.learnApi}
            </Button>
          </div>
        </PageContainer>
      </section>

      <section className={section}>
        <PageContainer>
          <h2 className={sectionTitle}>{copy.home.geoTitle}</h2>
          <p className={sectionLead}>{copy.home.geoLead}</p>
          <GeoSearch locale={locale} copy={copy} />
        </PageContainer>
      </section>

      <section className={sectionMuted}>
        <PageContainer>
          <h2 className={sectionTitle}>{copy.home.faqTitle}</h2>
          <div>
            {copy.home.faq.map((item) => (
              <details key={item.question} className={faqDetails}>
                <summary className={faqSummary}>{item.question}</summary>
                <p className="text-ink-muted">{item.answer}</p>
              </details>
            ))}
          </div>
        </PageContainer>
      </section>

      <section className={section}>
        <PageContainer>
          <div className={pageCta}>
            <h2 className={`${sectionTitle} text-white`}>{copy.home.finalTitle}</h2>
            <p className="max-w-xl text-[#d4d4d4]">{copy.home.finalLead}</p>
            <div className="mt-5">
              <Button href={localePath(locale, "/request-price/")} variant="onDark">
                {copy.ui.requestPrice}
              </Button>
            </div>
          </div>
        </PageContainer>
      </section>
    </>
  );
}
