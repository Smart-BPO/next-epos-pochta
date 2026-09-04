import type { Locale } from "@/i18n/config";
import { getContent } from "@/i18n/get-content";
import { PageContainer } from "@/components/atoms/PageContainer";
import { TrustIcon } from "@/components/atoms/TrustIcon";
import { PageCta } from "@/components/organisms/PageCta";
import { SITE_CONFIG } from "@/utils/consts";
import {
  featureItem,
  featureItemText,
  featureItemTitle,
  featureList,
  pageIntro,
  pageIntroTitle,
  section,
  sectionLead,
  sectionMuted,
  sectionTitle,
  trustGrid,
  trustItem,
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
          <h2 className={sectionTitle}>{copy.about.missionTitle}</h2>
          <p className={`${sectionLead} mb-0`}>{copy.about.mission}</p>
        </PageContainer>
      </section>

      <section className={section}>
        <PageContainer>
          <h2 className={sectionTitle}>{copy.about.geoTitle}</h2>
          <p className={`${sectionLead} mb-0`}>{copy.about.geo}</p>
        </PageContainer>
      </section>

      <section className={sectionMuted}>
        <PageContainer>
          <h2 className={sectionTitle}>{copy.about.benefitsTitle}</h2>
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
          <h2 className={sectionTitle}>{copy.about.legalTitle}</h2>
          <ul className={featureList}>
            <li className={featureItem}>
              <h3 className={featureItemTitle}>{SITE_CONFIG.legalName}</h3>
              <p className={featureItemText}>
                ИНН / STIR: {SITE_CONFIG.address.inn}
                <br />
                ОКЭД / OKED: {SITE_CONFIG.address.oked}
              </p>
            </li>
            <li className={featureItem}>
              <h3 className={featureItemTitle}>
                {locale === "uz" ? "Manzil" : "Адрес"}
              </h3>
              <p className={featureItemText}>{SITE_CONFIG.address.line}</p>
            </li>
            <li className={featureItem}>
              <h3 className={featureItemTitle}>{copy.ui.call}</h3>
              <p className={featureItemText}>
                <a href={`tel:${SITE_CONFIG.phone}`}>
                  {SITE_CONFIG.phoneDisplay}
                </a>
              </p>
            </li>
          </ul>
        </PageContainer>
      </section>

      <PageCta locale={locale} content={copy} />
    </>
  );
}
