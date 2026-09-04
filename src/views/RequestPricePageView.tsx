"use client";

import { useSearchParams } from "next/navigation";
import type { Locale } from "@/i18n/config";
import { getContent } from "@/i18n/get-content";
import { PageContainer } from "@/components/atoms/PageContainer";
import { RequestPriceForm } from "@/components/organisms/RequestPriceForm";
import {
  formShell,
  pageIntro,
  pageIntroTitle,
  sectionLead,
} from "@/styles/ui";

export function RequestPricePageView({ locale }: { locale: Locale }) {
  const copy = getContent(locale);
  const params = useSearchParams();
  const category = params.get("category") || params.get("service") || "";
  const pickup = params.get("pickup") === "1";

  return (
    <section className={pageIntro}>
      <PageContainer>
        <h1 className={pageIntroTitle}>{copy.requestPrice.title}</h1>
        <p className={sectionLead}>{copy.requestPrice.lead}</p>
        <div className={formShell}>
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
        </div>
      </PageContainer>
    </section>
  );
}
