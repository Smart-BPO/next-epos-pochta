import type { Locale } from "@/i18n/config";
import { getContent } from "@/i18n/get-content";
import { localePath } from "@/i18n/paths";
import { Button } from "@/components/atoms/Button";
import { PageContainer } from "@/components/atoms/PageContainer";

export function NotFoundView({ locale }: { locale: Locale }) {
  const copy = getContent(locale);
  return (
    <section className="section">
      <PageContainer>
        <h1 className="section-title">{copy.notFound.title}</h1>
        <p className="section-lead">{copy.notFound.lead}</p>
        <div className="hero-actions">
          <Button href={localePath(locale, "/")}>
            {locale === "uz" ? "Bosh sahifa" : "На главную"}
          </Button>
          <Button href={localePath(locale, "/tracking/")} variant="secondary">
            {copy.ui.track}
          </Button>
          <Button href={localePath(locale, "/request-price/")} variant="secondary">
            {copy.ui.requestPrice}
          </Button>
        </div>
      </PageContainer>
    </section>
  );
}
