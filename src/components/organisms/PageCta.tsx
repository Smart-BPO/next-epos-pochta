import type { Locale } from "@/i18n/config";
import { localePath } from "@/i18n/paths";
import type { SiteCopy } from "@/data/types";
import { Button } from "@/components/atoms/Button";
import { PageContainer } from "@/components/atoms/PageContainer";
import { homeSectionTitle, pageCta, section } from "@/styles/ui";

export function PageCta({
  locale,
  content,
}: {
  locale: Locale;
  content: SiteCopy;
}) {
  return (
    <section className={`${section} pt-0`}>
      <PageContainer>
        <div className={pageCta}>
          <div className="relative z-10 flex max-w-xl flex-col gap-4">
            <h2 className={`${homeSectionTitle} text-white`}>{content.cta.title}</h2>
            <p className="m-0 text-[length:var(--home-lead)] text-white/60">
              {content.cta.lead}
            </p>
            <div className="mt-2">
              <Button href={localePath(locale, "/request-price/")} variant="primary">
                {content.ui.requestPrice}
              </Button>
            </div>
          </div>
        </div>
      </PageContainer>
    </section>
  );
}
