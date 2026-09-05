"use client";

import { useSearchParams } from "next/navigation";
import type { Locale } from "@/i18n/config";
import { getContent } from "@/i18n/get-content";
import { localePath } from "@/i18n/paths";
import { PageContainer } from "@/components/atoms/PageContainer";
import { CalculatorForm } from "@/components/organisms/CalculatorForm";
import {
  alertInfo,
  pageIntro,
  pageIntroTitle,
  sectionLead,
  sectionMuted,
} from "@/styles/ui";

export function CalculatorPageView({ locale }: { locale: Locale }) {
  const copy = getContent(locale);
  const params = useSearchParams();
  const fromQuery = params.get("from") || "";
  const toQuery = params.get("to") || "";

  return (
    <>
      <section className={pageIntro}>
        <PageContainer className="max-w-3xl">
          <p className="mb-3 m-0 text-sm text-black/45">
            <a href={localePath(locale, "/")} className="hover:text-black">
              {copy.calculator.breadcrumbHome}
            </a>
            <span aria-hidden> / </span>
            <span>{copy.calculator.breadcrumbCurrent}</span>
          </p>
          <h1 className={pageIntroTitle}>{copy.calculator.title}</h1>
          <p className={sectionLead}>{copy.calculator.lead}</p>
          <div className={`${alertInfo} rounded-2xl`}>
            {copy.calculator.disclaimer}
          </div>
        </PageContainer>
      </section>

      <section className={sectionMuted}>
        <PageContainer className="max-w-4xl">
          <CalculatorForm
            locale={locale}
            content={copy}
            initialFromQuery={fromQuery}
            initialToQuery={toQuery}
          />
        </PageContainer>
      </section>
    </>
  );
}
