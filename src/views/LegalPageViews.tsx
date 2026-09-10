import type { Locale } from "@/i18n/config";
import { getContent } from "@/i18n/get-content";
import { getLegalBundle } from "@/data/legal/documents";
import { LegalMarkdown } from "@/components/molecules/LegalMarkdown";
import { PageContainer } from "@/components/atoms/PageContainer";
import {
  legalContent,
  pageIntro,
  pageIntroTitle,
} from "@/styles/ui";

export function PrivacyPageView({ locale }: { locale: Locale }) {
  const copy = getContent(locale);
  const legal = getLegalBundle(locale);
  return (
    <section className={pageIntro}>
      <PageContainer className={legalContent}>
        <h1 className={pageIntroTitle}>{copy.privacy.title}</h1>
        <LegalMarkdown markdown={legal.privacyMarkdown} />
      </PageContainer>
    </section>
  );
}

export function TermsPageView({ locale }: { locale: Locale }) {
  const copy = getContent(locale);
  const legal = getLegalBundle(locale);
  return (
    <section className={pageIntro}>
      <PageContainer className={legalContent}>
        <h1 className={pageIntroTitle}>{copy.terms.title}</h1>
        <LegalMarkdown markdown={legal.termsMarkdown} />
      </PageContainer>
    </section>
  );
}
