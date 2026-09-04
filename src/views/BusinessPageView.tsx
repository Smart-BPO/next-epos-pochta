import type { Locale } from "@/i18n/config";
import { getContent } from "@/i18n/get-content";
import { localePath } from "@/i18n/paths";
import { Button } from "@/components/atoms/Button";
import { PageContainer } from "@/components/atoms/PageContainer";
import { BusinessForm } from "@/components/organisms/BusinessForm";

export function BusinessPageView({ locale }: { locale: Locale }) {
  const copy = getContent(locale);

  return (
    <>
      <section className="hero">
        <PageContainer>
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
          <div className="grid-cards">
            {copy.business.segments.map((s) => (
              <article key={s.title} className="card">
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </article>
            ))}
          </div>
        </PageContainer>
      </section>

      <section className="section section-muted">
        <PageContainer>
          <h2 className="section-title">{copy.business.capabilitiesTitle}</h2>
          <ul className="grid-cards" style={{ listStyle: "none", padding: 0 }}>
            {copy.business.capabilities.map((item) => (
              <li key={item} className="card">
                {item}
              </li>
            ))}
          </ul>
        </PageContainer>
      </section>

      <section className="section">
        <PageContainer>
          <h2 className="section-title">{copy.business.connectTitle}</h2>
          <ol className="steps">
            {copy.business.connectSteps.map((step) => (
              <li key={step} className="step card" style={{ listStyle: "none" }}>
                {step}
              </li>
            ))}
          </ol>
        </PageContainer>
      </section>

      <section className="section section-muted" id="api">
        <PageContainer>
          <h2 className="section-title">{copy.business.apiTitle}</h2>
          <p className="section-lead">{copy.business.apiLead}</p>
          <Button href={localePath(locale, "/request-price/")} variant="secondary">
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
