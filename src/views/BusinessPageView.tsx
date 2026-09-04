import type { Locale } from "@/i18n/config";
import { getContent } from "@/i18n/get-content";
import { localePath } from "@/i18n/paths";
import { SITE_CONFIG } from "@/utils/consts";
import { Button } from "@/components/atoms/Button";
import { PageContainer } from "@/components/atoms/PageContainer";
import { TrustIcon } from "@/components/atoms/TrustIcon";
import { BusinessForm } from "@/components/organisms/BusinessForm";

export function BusinessPageView({ locale }: { locale: Locale }) {
  const copy = getContent(locale);

  return (
    <>
      <section className="hero">
        <PageContainer>
          <p className="hero-brand">{SITE_CONFIG.name}</p>
          <h1>{copy.business.heroTitle}</h1>
          <p className="hero-lead">{copy.business.heroLead}</p>
          <div className="hero-actions">
            <Button href="#business-form">{copy.ui.getOffer}</Button>
          </div>
        </PageContainer>
      </section>

      <section className="section">
        <PageContainer>
          <h2 className="section-title">{copy.business.segmentsTitle}</h2>
          <ul className="feature-list">
            {copy.business.segments.map((s) => (
              <li key={s.title}>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </li>
            ))}
          </ul>
        </PageContainer>
      </section>

      <section className="section section-muted">
        <PageContainer>
          <h2 className="section-title">{copy.business.capabilitiesTitle}</h2>
          <div className="trust-grid">
            {copy.business.capabilities.map((item, index) => (
              <article key={item} className="trust-item">
                <TrustIcon index={index} />
                <h3>{item}</h3>
              </article>
            ))}
          </div>
        </PageContainer>
      </section>

      <section className="section">
        <PageContainer>
          <h2 className="section-title">{copy.business.connectTitle}</h2>
          <div className="steps">
            {copy.business.connectSteps.map((step) => (
              <article key={step} className="step">
                <p style={{ margin: 0 }}>{step}</p>
              </article>
            ))}
          </div>
        </PageContainer>
      </section>

      <section className="section section-muted" id="api">
        <PageContainer>
          <h2 className="section-title">{copy.business.apiTitle}</h2>
          <p className="section-lead">{copy.business.apiLead}</p>
          <div className="trust-item" style={{ marginBottom: "1.25rem" }}>
            <TrustIcon index={3} />
          </div>
          <Button href={localePath(locale, "/contacts/")} variant="secondary">
            {copy.ui.learnApi}
          </Button>
        </PageContainer>
      </section>

      <section className="section" id="business-form">
        <PageContainer>
          <h2 className="section-title">{copy.business.formTitle}</h2>
          <BusinessForm locale={locale} content={copy} />
        </PageContainer>
      </section>
    </>
  );
}
