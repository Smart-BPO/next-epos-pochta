import type { Locale } from "@/i18n/config";
import { getContent } from "@/i18n/get-content";
import { localePath } from "@/i18n/paths";
import { PageContainer } from "@/components/atoms/PageContainer";
import { Button } from "@/components/atoms/Button";
import { FaqExplorer } from "@/components/molecules/FaqExplorer";
import { JsonLd } from "@/components/seo/JsonLd";
import { getBreadcrumbSchema, getFaqSchema } from "@/utils/seo/json-ld";
import {
  pageIntro,
  pageIntroTitle,
  section,
  sectionLead,
} from "@/styles/ui";

export function FaqPageView({ locale }: { locale: Locale }) {
  const copy = getContent(locale);
  const faq = copy.faq;

  return (
    <>
      <JsonLd
        data={getBreadcrumbSchema([
          {
            name: copy.calculator.breadcrumbHome,
            path: localePath(locale, "/"),
          },
          { name: faq.title, path: localePath(locale, "/faq/") },
        ])}
      />
      <JsonLd data={getFaqSchema(faq.items)} />

      <section className={pageIntro}>
        <PageContainer>
          <h1 className={pageIntroTitle}>{faq.title}</h1>
          <p className={sectionLead}>{faq.lead}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button href={localePath(locale, "/calculator/")} variant="primary">
              {copy.ui.calculate}
            </Button>
            <Button
              href={localePath(locale, "/delivery/")}
              variant="secondary"
            >
              {copy.footer.geography}
            </Button>
            <Button href={localePath(locale, "/services/")} variant="secondary">
              {locale === "uz" ? "Xizmatlar" : "Услуги"}
            </Button>
          </div>
        </PageContainer>
      </section>

      <section className={`${section} bg-surface-muted/60`}>
        <PageContainer>
          <FaqExplorer faq={faq} />
        </PageContainer>
      </section>
    </>
  );
}
