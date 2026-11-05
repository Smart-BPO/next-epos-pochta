"use client";

import type { Locale } from "@/i18n/config";
import { getContent } from "@/i18n/get-content";
import { PageContainer } from "@/components/atoms/PageContainer";
import { TrackingLookup } from "@/components/tracking/TrackingLookup";
import { pageIntro, pageIntroTitle, sectionLead } from "@/styles/ui";

export function TrackingPageView({ locale }: { locale: Locale }) {
  const copy = getContent(locale);

  return (
    <>
      <section className={pageIntro}>
        <PageContainer>
          <h1 className={pageIntroTitle}>{copy.tracking.title}</h1>
          <p className={sectionLead}>{copy.tracking.lead}</p>
        </PageContainer>
      </section>

      <section className="pb-[var(--section-y)]">
        <PageContainer>
          <TrackingLookup locale={locale} />
        </PageContainer>
      </section>
    </>
  );
}
