import type { Locale } from "@/i18n/config";
import { getContent } from "@/i18n/get-content";
import { localePath } from "@/i18n/paths";
import { SITE_CONFIG } from "@/utils/consts";
import { Button } from "@/components/atoms/Button";
import { PageContainer } from "@/components/atoms/PageContainer";
import { TrustIcon } from "@/components/atoms/TrustIcon";
import { GeoSearch } from "@/components/molecules/GeoSearch";
import { QuickTrackForm } from "@/components/molecules/QuickTrackForm";
import { JsonLd } from "@/components/seo/JsonLd";
import { getFaqSchema } from "@/utils/seo/json-ld";

export function HomePageView({ locale }: { locale: Locale }) {
  const copy = getContent(locale);

  return (
    <>
      <JsonLd data={getFaqSchema(copy.home.faq)} />

      <section className="hero">
        <PageContainer>
          <p className="hero-brand">{SITE_CONFIG.name}</p>
          <h1>{copy.home.heroTitle}</h1>
          <p className="hero-lead">{copy.home.heroLead}</p>
          <p className="hero-note">{copy.home.heroNote}</p>
          <div className="hero-actions">
            <Button href={localePath(locale, "/request-price/")}>
              {copy.ui.requestPrice}
            </Button>
            <Button
              href={`${localePath(locale, "/request-price/")}?pickup=1`}
              variant="secondary"
            >
              {copy.ui.callCourier}
            </Button>
          </div>
        </PageContainer>
      </section>

      <section className="section">
        <PageContainer>
          <h2 className="section-title">{copy.home.trackTitle}</h2>
          <p className="section-lead">{copy.home.trackHint}</p>
          <div className="track-shell">
            <QuickTrackForm locale={locale} copy={copy} />
          </div>
        </PageContainer>
      </section>

      <section className="section section-muted">
        <PageContainer>
          <h2 className="section-title">{copy.home.needsTitle}</h2>
          <div>
            {copy.home.needs.map((item) => (
              <article key={item.id} className="action-tile">
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
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

      <section className="section">
        <PageContainer>
          <h2 className="section-title">{copy.home.modesTitle}</h2>
          <ul className="feature-list">
            {copy.home.modes.map((mode) => (
              <li key={mode.id}>
                <h3>{mode.title}</h3>
                <p>{mode.description}</p>
              </li>
            ))}
          </ul>
        </PageContainer>
      </section>

      <section className="section section-muted">
        <PageContainer>
          <h2 className="section-title">{copy.home.benefitsTitle}</h2>
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
          <h2 className="section-title">{copy.home.howTitle}</h2>
          <div className="steps">
            {copy.home.howSteps.map((step) => (
              <article key={step.title} className="step">
                <h3 style={{ margin: "0 0 0.35rem" }}>{step.title}</h3>
                <p style={{ margin: 0, color: "var(--color-ink-muted)" }}>
                  {step.text}
                </p>
              </article>
            ))}
          </div>
        </PageContainer>
      </section>

      <section className="section section-muted">
        <PageContainer>
          <h2 className="section-title">{copy.home.businessTitle}</h2>
          <p className="section-lead">{copy.home.businessLead}</p>
          <ul className="feature-list">
            {copy.home.businessItems.map((item) => (
              <li key={item}>
                <p>{item}</p>
              </li>
            ))}
          </ul>
          <div className="hero-actions" style={{ marginTop: "1.25rem" }}>
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

      <section className="section">
        <PageContainer>
          <h2 className="section-title">{copy.home.geoTitle}</h2>
          <p className="section-lead">{copy.home.geoLead}</p>
          <GeoSearch locale={locale} copy={copy} />
        </PageContainer>
      </section>

      <section className="section section-muted">
        <PageContainer>
          <h2 className="section-title">{copy.home.faqTitle}</h2>
          <div className="faq">
            {copy.home.faq.map((item) => (
              <details key={item.question}>
                <summary>{item.question}</summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>
        </PageContainer>
      </section>

      <section className="section">
        <PageContainer>
          <div className="page-cta">
            <h2 className="section-title" style={{ color: "white" }}>
              {copy.home.finalTitle}
            </h2>
            <p>{copy.home.finalLead}</p>
            <div style={{ marginTop: "1.25rem" }}>
              <Button
                href={localePath(locale, "/request-price/")}
                className="btn-on-dark"
              >
                {copy.ui.requestPrice}
              </Button>
            </div>
          </div>
        </PageContainer>
      </section>
    </>
  );
}
