"use client";

import { useSearchParams } from "next/navigation";
import type { Locale } from "@/i18n/config";
import { getContent } from "@/i18n/get-content";
import { PageContainer } from "@/components/atoms/PageContainer";
import { RequestPriceForm } from "@/components/forms/RequestPriceForm";

export function RequestPricePageView({ locale }: { locale: Locale }) {
  const copy = getContent(locale);
  const params = useSearchParams();
  const category = params.get("category") || params.get("service") || "";
  const pickup = params.get("pickup") === "1";

  return (
    <section className="section">
      <PageContainer>
        <h1 className="section-title">{copy.requestPrice.title}</h1>
        <p className="section-lead">{copy.requestPrice.lead}</p>
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
      </PageContainer>
    </section>
  );
}
