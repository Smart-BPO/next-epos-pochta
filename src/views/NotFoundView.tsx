import type { Locale } from "@/i18n/config";
import { loc } from "@/i18n/loc";
import { getContent } from "@/i18n/get-content";
import { localePath } from "@/i18n/paths";
import { Button } from "@/components/atoms/Button";
import { PageContainer } from "@/components/atoms/PageContainer";
import {
  pageIntro,
  pageIntroTitle,
  sectionLead,
} from "@/styles/ui";

export function NotFoundView({ locale }: { locale: Locale }) {
  const copy = getContent(locale);
  return (
    <section className={pageIntro}>
      <PageContainer>
        <h1 className={pageIntroTitle}>{copy.notFound.title}</h1>
        <p className={sectionLead}>{copy.notFound.lead}</p>
        <Button href={localePath(locale, "/")}>
          {loc(locale, "Bosh sahifa", "На главную", "返回首页")}
        </Button>
      </PageContainer>
    </section>
  );
}
