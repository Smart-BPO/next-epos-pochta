import type { Locale } from "@/i18n/config";
import { localePath } from "@/i18n/paths";
import type { SiteCopy } from "@/data/types";
import { Button } from "@/components/atoms/Button";
import { PageContainer } from "@/components/atoms/PageContainer";
import { pageCta, section, sectionTitle } from "@/styles/ui";

export function PageCta({
  locale,
  content,
}: {
  locale: Locale;
  content: SiteCopy;
}) {
  return (
    <section className={section}>
      <PageContainer>
        <div className={pageCta}>
          <h2 className={`${sectionTitle} text-white`}>{content.cta.title}</h2>
          <p className="max-w-xl text-[#d4d4d4]">{content.cta.lead}</p>
          <div className="mt-5">
            <Button href={localePath(locale, "/request-price/")} variant="onDark">
              {content.ui.requestPrice}
            </Button>
          </div>
        </div>
      </PageContainer>
    </section>
  );
}
