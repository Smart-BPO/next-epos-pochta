"use client";

import Image from "next/image";
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
  const pickup = params.get("pickup") === "1";

  return (
    <>
      <section className={pageIntro}>
        <PageContainer className="flex flex-col gap-6">
          <div>
            <h1 className={pageIntroTitle}>{copy.requestPrice.title}</h1>
            <p className={sectionLead}>{copy.requestPrice.lead}</p>
            <div className={`${alertInfo} rounded-2xl`}>
              {copy.requestPrice.priceNote}
            </div>
          </div>

          <div className="flex flex-col items-center gap-4 md:gap-6 lg:flex-row lg:items-center lg:justify-between lg:gap-0">
            {copy.requestPrice.steps.map((stepLabel, index) => (
              <div
                key={stepLabel}
                className="flex w-full flex-col items-center gap-4 md:gap-6 lg:w-auto lg:min-w-0 lg:flex-1 lg:flex-row lg:gap-0"
              >
                <article className="flex aspect-square w-full max-w-[min(100%,14rem)] flex-col items-center justify-center gap-2 overflow-hidden rounded-full border border-black/20 bg-white px-5 py-4 text-center lg:mx-auto">
                  <p className="m-0 font-display text-4xl font-semibold uppercase text-black/30 md:text-5xl">
                    {index + 1}
                  </p>
                  <h2 className="m-0 text-lg font-medium text-black sm:text-xl">
                    {stepLabel}
                  </h2>
                </article>
                {index < copy.requestPrice.steps.length - 1 ? (
                  <div className="z-10 shrink-0 rounded-full bg-gradient-to-b from-primary to-primary-hover px-3 py-2 lg:-mx-2">
                    <Image
                      src="/images/home/steps/arrow.svg"
                      alt=""
                      width={28}
                      height={28}
                      className="rotate-90 lg:rotate-0"
                      unoptimized
                    />
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </PageContainer>
      </section>

      <section className={sectionMuted}>
        <PageContainer className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,20rem)] lg:items-start lg:gap-10">
          <RequestPriceForm
            locale={locale}
            content={copy}
            initialCategory={
              category === "regular"
                ? "goods"
                : category === "parcels"
                  ? "parcel"
                  : category === "documents" ||
                      category === "parcel" ||
                      category === "goods" ||
                      category === "other"
                    ? category
                    : ""
            }
            initialPickup={pickup}
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
                <a href={`tel:${SITE_CONFIG.phone}`} className="font-medium text-black">
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
