"use client";

import { useSearchParams } from "next/navigation";
import type { Locale } from "@/i18n/config";
import { getContent } from "@/i18n/get-content";
import { PageContainer } from "@/components/atoms/PageContainer";
import { RequestPriceForm } from "@/components/organisms/RequestPriceForm";
import {
  alertInfo,
  pageIntro,
  pageIntroTitle,
  sectionMuted,
} from "@/styles/ui";

export function RequestPricePageView({ locale }: { locale: Locale }) {
  const copy = getContent(locale);
  const params = useSearchParams();
  const category = params.get("category") || params.get("service") || "";
  const fromQuery = params.get("from") || "";
  const toQuery = params.get("to") || "";

  return (
    <>
      <section className={pageIntro}>
        <PageContainer>
          <div className="max-w-3xl">
            <h1 className={pageIntroTitle}>{copy.requestPrice.title}</h1>
            <p className="mb-6 text-[length:var(--home-lead)] text-black/60">
              {copy.requestPrice.lead}
            </p>
            <div className={`${alertInfo} rounded-2xl`}>
              {copy.requestPrice.priceNote}
            </div>
          </div>
        </PageContainer>
      </section>

      <section className={sectionMuted}>
        <PageContainer>
          <div className="max-w-3xl">
            <RequestPriceForm
              locale={locale}
              content={copy}
              initialCategory={category}
              initialFromQuery={fromQuery}
              initialToQuery={toQuery}
            />
          </div>
        </PageContainer>
      </section>
    </>
  );
}
