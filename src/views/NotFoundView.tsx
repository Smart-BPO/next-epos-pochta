import type { Locale } from "@/i18n/config";
import { getContent } from "@/i18n/get-content";
import { localePath } from "@/i18n/paths";
import { Button } from "@/components/atoms/Button";
import { PageContainer } from "@/components/atoms/PageContainer";
import {
  heroActions,
  pageIntroTitle,
  section,
  sectionLead,
} from "@/styles/ui";

export function NotFoundView({ locale }: { locale: Locale }) {
  const copy = getContent(locale);
  return (
    <section className={section}>
      <PageContainer>
        <h1 className={pageIntroTitle}>{copy.notFound.title}</h1>
        <p className={sectionLead}>{copy.notFound.lead}</p>
        <div className={heroActions}>
          <Button href={localePath(locale, "/")}>
            {locale === "uz" ? "Bosh sahifa" : "На главную"}
          </Button>
        </div>
      </PageContainer>
    </section>
  );
}
