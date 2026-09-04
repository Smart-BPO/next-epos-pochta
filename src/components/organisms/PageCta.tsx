import type { Locale } from "@/i18n/config";
import { localePath } from "@/i18n/paths";
import type { SiteCopy } from "@/data/types";
import { Button } from "@/components/atoms/Button";
import { PageContainer } from "@/components/atoms/PageContainer";

export function PageCta({ locale, content }: { locale: Locale; content: SiteCopy }) {
  return (
    <section className="section">
      <PageContainer>
        <div className="page-cta">
          <h2 className="section-title" style={{ color: "white" }}>
            {content.cta.title}
          </h2>
          <p>{content.cta.lead}</p>
          <div style={{ marginTop: "1.25rem" }}>
            <Button href={localePath(locale, "/request-price/")}>
              {content.ui.requestPrice}
            </Button>
          </div>
        </div>
      </PageContainer>
    </section>
  );
}
