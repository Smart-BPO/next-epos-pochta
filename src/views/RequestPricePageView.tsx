"use client";

import { useSearchParams } from "next/navigation";
import type { Locale } from "@/i18n/config";
import { getContent } from "@/i18n/get-content";
import { PageContainer } from "@/components/atoms/PageContainer";
import { RequestPriceForm } from "@/components/organisms/RequestPriceForm";
import {
  pageIntro,
  pageIntroTitle,
  sectionLead,
  sectionMuted,
} from "@/styles/ui";

export function RequestPricePageView({ locale }: { locale: Locale }) {
  const copy = getContent(locale);
  const params = useSearchParams();
  const category = params.get("category") || params.get("service") || "";
  const fromQuery = params.get("from") || "";
  const toQuery = params.get("to") || "";
  const resumeUid = params.get("uid") || "";

  return (
    <>
      <section className={pageIntro}>
        <PageContainer>
          <h1 className={pageIntroTitle}>{copy.requestPrice.title}</h1>
          <p className={sectionLead}>{copy.requestPrice.lead}</p>
        </PageContainer>
      </section>

      <section className={sectionMuted}>
        <PageContainer className="max-w-4xl">
          <RequestPriceForm
            locale={locale}
            content={copy}
            initialCategory={category}
            initialFromQuery={fromQuery}
            initialToQuery={toQuery}
            resumeUid={resumeUid}
          />
        </PageContainer>
      </section>
    </>
  );
}
