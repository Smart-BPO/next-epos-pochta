import type { Locale } from "@/i18n/config";
import { getContent } from "@/i18n/get-content";
import { PageContainer } from "@/components/atoms/PageContainer";
import { TrustIcon } from "@/components/atoms/TrustIcon";
import { PageCta } from "@/components/organisms/PageCta";
import { SITE_CONFIG } from "@/utils/consts";

export function AboutPageView({ locale }: { locale: Locale }) {
  const copy = getContent(locale);

  return (
    <>
      <section className="page-intro">
        <PageContainer>
          <h1>{copy.about.title}</h1>
          <p className="section-lead">{copy.about.lead}</p>
        </PageContainer>
      </section>

      <section className="section section-muted">
        <PageContainer>
          <h2 className="section-title">{copy.about.missionTitle}</h2>
          <p className="section-lead" style={{ marginBottom: 0 }}>
            {copy.about.mission}
          </p>
        </PageContainer>
      </section>

      <section className="section">
        <PageContainer>
          <h2 className="section-title">{copy.about.geoTitle}</h2>
          <p className="section-lead" style={{ marginBottom: 0 }}>
            {copy.about.geo}
          </p>
        </PageContainer>
      </section>

      <section className="section section-muted">
        <PageContainer>
          <h2 className="section-title">{copy.about.benefitsTitle}</h2>
          <div className="trust-grid">
            {copy.home.benefits.map((b, index) => (
              <article key={b} className="trust-item">
                <TrustIcon index={index} />
                <h3>{b}</h3>
              </article>
            ))}
          </div>
        </PageContainer>
      </section>

      <section className="section">
        <PageContainer>
          <h2 className="section-title">{copy.about.legalTitle}</h2>
          <ul className="feature-list">
            <li>
              <h3>{SITE_CONFIG.legalName}</h3>
              <p>
                ИНН / STIR: {SITE_CONFIG.address.inn}
                <br />
                ОКЭД / OKED: {SITE_CONFIG.address.oked}
              </p>
            </li>
            <li>
              <h3>{locale === "uz" ? "Manzil" : "Адрес"}</h3>
              <p>{SITE_CONFIG.address.line}</p>
            </li>
            <li>
              <h3>{copy.ui.call}</h3>
              <p>
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
