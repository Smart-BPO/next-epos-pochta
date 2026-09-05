"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { Locale } from "@/i18n/config";
import { getContent } from "@/i18n/get-content";
import { localePath } from "@/i18n/paths";
import { PageContainer } from "@/components/atoms/PageContainer";
import { CalculatorForm } from "@/components/organisms/CalculatorForm";
import { JsonLd } from "@/components/seo/JsonLd";
import { getBreadcrumbSchema } from "@/utils/seo/json-ld";
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
  const category = params.get("category") || "";
  const homePath = localePath(locale, "/");
  const calcPath = localePath(locale, "/calculator/");

  return (
    <>
      <JsonLd
        data={getBreadcrumbSchema([
          {
            name: copy.calculator.breadcrumbHome,
            path: homePath,
          },
          {
            name: copy.calculator.breadcrumbCurrent,
            path: calcPath,
          },
        ])}
      />
      <section className={pageIntro}>
        <PageContainer>
          <nav
            className="mb-4 text-sm text-ink-muted"
            aria-label="Breadcrumb"
          >
            <ol className="m-0 flex list-none flex-wrap items-center gap-1.5 p-0">
              <li>
                <Link
                  href={homePath}
                  className="text-ink-muted underline-offset-2 hover:text-primary hover:underline"
                >
                  {copy.calculator.breadcrumbHome}
                </Link>
              </li>
              <li aria-hidden className="text-black/30">
                /
              </li>
              <li className="text-black" aria-current="page">
                {copy.calculator.breadcrumbCurrent}
              </li>
            </ol>
          </nav>
          <h1 className={pageIntroTitle}>{copy.calculator.title}</h1>
          <p className={sectionLead}>{copy.calculator.lead}</p>
        </PageContainer>
      </section>

      <section className={sectionMuted}>
        <PageContainer className="max-w-4xl">
          <div className={`${alertInfo} mb-6 rounded-2xl`}>
            {copy.calculator.disclaimer}
          </div>
          <CalculatorForm
            locale={locale}
            content={copy}
            initialFromQuery={fromQuery}
            initialToQuery={toQuery}
            initialCategory={category}
          />
        </PageContainer>
      </section>
    </>
  );
}
