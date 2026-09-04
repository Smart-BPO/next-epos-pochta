import type { Locale } from "@/i18n/config";
import { getContent } from "@/i18n/get-content";
import { PageContainer } from "@/components/atoms/PageContainer";

export function PrivacyPageView({ locale }: { locale: Locale }) {
  const copy = getContent(locale);
  return (
    <section className="page-intro">
      <PageContainer className="legal-content">
        <h1>{copy.privacy.title}</h1>
        {copy.privacy.body.map((p) => (
          <p key={p.slice(0, 24)}>{p}</p>
        ))}
      </PageContainer>
    </section>
  );
}

export function TermsPageView({ locale }: { locale: Locale }) {
  const copy = getContent(locale);
  return (
    <section className="page-intro">
      <PageContainer className="legal-content">
        <h1>{copy.terms.title}</h1>
        {copy.terms.body.map((p) => (
          <p key={p.slice(0, 24)}>{p}</p>
        ))}
        <h2>{copy.terms.prohibitedTitle}</h2>
        <p>{copy.terms.prohibitedNote}</p>
      </PageContainer>
    </section>
  );
}
