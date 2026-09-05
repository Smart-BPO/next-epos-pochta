"use client";

import { useSearchParams } from "next/navigation";
import type { Locale } from "@/i18n/config";
import { getContent } from "@/i18n/get-content";
import { PageContainer } from "@/components/atoms/PageContainer";
import { RequestPriceForm } from "@/components/organisms/RequestPriceForm";
import { SITE_CONFIG } from "@/utils/consts";
import {
  alertInfo,
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

  return (
    <>
      <section className={pageIntro}>
        <PageContainer className="max-w-3xl">
          <h1 className={pageIntroTitle}>{copy.requestPrice.title}</h1>
          <p className={sectionLead}>{copy.requestPrice.lead}</p>
          <div className={`${alertInfo} rounded-2xl`}>
            {copy.requestPrice.priceNote}
          </div>
        </PageContainer>
      </section>

      <section className={sectionMuted}>
        <PageContainer className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,20rem)] lg:items-start lg:gap-10">
          <RequestPriceForm
            locale={locale}
            content={copy}
            initialCategory={category}
            initialFromQuery={fromQuery}
            initialToQuery={toQuery}
          />

          <aside className="rounded-3xl border border-black/20 bg-white p-[var(--card-pad)]">
            <h2 className="m-0 font-display text-2xl font-semibold uppercase tracking-[-0.02em] text-black">
              {copy.requestPrice.trustTitle}
            </h2>
            <ul className="mt-4 m-0 list-none space-y-3 p-0">
              {copy.requestPrice.trustItems.map((item) => (
                <li
                  key={item}
                  className="border-b border-black/10 pb-3 text-base text-black/60 last:border-0 last:pb-0"
                >
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-6 space-y-2 text-sm text-black/60">
              <p className="m-0">
                <a
                  href={`tel:${SITE_CONFIG.phone}`}
                  className="font-medium text-black"
                >
                  {SITE_CONFIG.phoneDisplay}
                </a>
              </p>
              <p className="m-0">
                <a
                  href={SITE_CONFIG.telegramUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-primary"
                >
                  Telegram
                </a>
              </p>
            </div>
          </aside>
        </PageContainer>
      </section>
    </>
  );
}
