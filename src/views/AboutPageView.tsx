import type { Locale } from "@/i18n/config";
import { getContent } from "@/i18n/get-content";
import { PageContainer } from "@/components/atoms/PageContainer";
import { PageCta } from "@/components/organisms/PageCta";
import { SITE_CONFIG } from "@/utils/consts";

export function AboutPageView({ locale }: { locale: Locale }) {
  const copy = getContent(locale);

  return (
    <>
      <section className="section">
        <PageContainer>
          <h1 className="section-title">{copy.about.title}</h1>
          <p className="section-lead">{copy.about.lead}</p>
        </PageContainer>
      </section>

      <section className="section section-muted">
        <PageContainer>
          <h2 className="section-title">{copy.about.missionTitle}</h2>
          <p>{copy.about.mission}</p>
        </PageContainer>
      </section>

      <section className="section">
        <PageContainer>
          <h2 className="section-title">{copy.about.geoTitle}</h2>
          <p>{copy.about.geo}</p>
        </PageContainer>
      </section>

      <section className="section section-muted">
        <PageContainer>
          <h2 className="section-title">{copy.about.benefitsTitle}</h2>
          <ul className="grid-cards" style={{ listStyle: "none", padding: 0 }}>
            {copy.home.benefits.map((b) => (
              <li key={b} className="card">
                {b}
              </li>
            ))}
          </ul>
        </PageContainer>
      </section>

      <section className="section">
        <PageContainer>
          <h2 className="section-title">{copy.about.legalTitle}</h2>
          <div className="card">
            <p>
              <strong>{SITE_CONFIG.legalName}</strong>
            </p>
            <p>
              ИНН / STIR: {SITE_CONFIG.address.inn}
              <br />
              ОКЭД / OKED: {SITE_CONFIG.address.oked}
            </p>
            <p>{SITE_CONFIG.address.line}</p>
            <p>
              <a href={`tel:${SITE_CONFIG.phone}`}>{SITE_CONFIG.phoneDisplay}</a>
            </p>
          </div>
        </PageContainer>
      </section>

      <PageCta locale={locale} content={copy} />
    </>
  );
}
