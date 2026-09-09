import type { Locale } from "@/i18n/config";
import type { SiteCopy } from "@/data/types";
import { PageContainer } from "@/components/atoms/PageContainer";
import {
  HomeQuoteForm,
  HomeTrackForm,
} from "@/components/molecules/HomeActionBarForms";
import {
  homeActionBar,
  homeActionBridge,
  homeActionDivider,
  homeActionIsland,
  homeActionLabel,
  homeActionPane,
} from "@/styles/ui";

/** Server-rendered island shell so LCP titles paint without waiting on client JS. */
export function HomeActionBar({
  locale,
  copy,
}: {
  locale: Locale;
  copy: SiteCopy;
}) {
  return (
    <section className={homeActionBar} aria-label={copy.home.quoteTitle}>
      <div className={homeActionBridge}>
        <PageContainer>
          <div className={homeActionIsland}>
            <div className={homeActionPane}>
              <h2 className={homeActionLabel}>{copy.home.trackTitle}</h2>
              <HomeTrackForm locale={locale} copy={copy} />
            </div>

            <div className={homeActionDivider} aria-hidden />

            <div className={`${homeActionPane} lg:min-w-0 lg:flex-[1.45]`}>
              <h2 className={homeActionLabel}>{copy.home.quoteTitle}</h2>
              <HomeQuoteForm locale={locale} copy={copy} />
            </div>
          </div>
        </PageContainer>
      </div>
    </section>
  );
}
