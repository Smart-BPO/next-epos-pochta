import type { Locale } from "@/i18n/config";
import { getContent } from "@/i18n/get-content";
import { localePath } from "@/i18n/paths";
import { SITE_CONFIG } from "@/utils/consts";
import { Button } from "@/components/atoms/Button";
import { PageContainer } from "@/components/atoms/PageContainer";
import { TrustIcon } from "@/components/atoms/TrustIcon";
import { BusinessForm } from "@/components/organisms/BusinessForm";
import { cn } from "@/lib/cn";
import {
  anchorSection,
  featureItem,
  featureItemText,
  featureItemTitle,
  featureList,
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
  trustGrid,
  trustItem,
} from "@/styles/ui";

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
          </div>
        </PageContainer>
      </section>

      <section className={section}>
        <PageContainer>
          <h2 className={sectionTitle}>{copy.business.segmentsTitle}</h2>
          <ul className={featureList}>
            {copy.business.segments.map((s) => (
              <li key={s.title} className={featureItem}>
                <h3 className={featureItemTitle}>{s.title}</h3>
                <p className={featureItemText}>{s.text}</p>
              </li>
            ))}
          </ul>
        </PageContainer>
      </section>

      <section className={sectionMuted}>
        <PageContainer>
          <h2 className={sectionTitle}>{copy.business.capabilitiesTitle}</h2>
          <div className={trustGrid}>
            {copy.business.capabilities.map((item, index) => (
              <article key={item} className={trustItem}>
                <TrustIcon index={index} />
                <h3 className="m-0 text-[1.05rem] font-semibold">{item}</h3>
              </article>
            ))}
          </div>
        </PageContainer>
      </section>

      <section className={section}>
        <PageContainer>
          <h2 className={sectionTitle}>{copy.business.connectTitle}</h2>
          <div className={steps}>
            {copy.business.connectSteps.map((s) => (
              <article key={s} className={step}>
                <p className="m-0">{s}</p>
              </article>
            ))}
          </div>
        </PageContainer>
      </section>

      <section className={cn(sectionMuted, anchorSection)} id="api">
        <PageContainer>
          <h2 className={sectionTitle}>{copy.business.apiTitle}</h2>
          <p className={sectionLead}>{copy.business.apiLead}</p>
          <div className={`${trustItem} mb-5`}>
            <TrustIcon index={3} />
          </div>
          <Button href={localePath(locale, "/contacts/")} variant="secondary">
            {copy.ui.learnApi}
          </Button>
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
