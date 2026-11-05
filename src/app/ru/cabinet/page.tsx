import { Suspense } from "react";
import type { Metadata } from "next";
import { SiteLayout } from "@/components/templates/SiteLayout";
import { CabinetPageView } from "@/views/CabinetPageView";
import { cabinetCopy } from "@/data/cabinet";
import { createPageMetadata } from "@/utils/seo/metadata";
import { getLocalizedAlternates, localePath } from "@/i18n/paths";
import { ogLocale } from "@/i18n/config";

export function generateMetadata(): Metadata {
  const copy = cabinetCopy("ru");
  return createPageMetadata(
    copy.metaTitle,
    copy.metaDescription,
    localePath("ru", "/cabinet/"),
    {
      alternates: getLocalizedAlternates("/cabinet/"),
      ogLocale: ogLocale.ru,
      noIndex: true,
    },
  );
}

export default function CabinetPageRu() {
  return (
    <SiteLayout locale="ru">
      <Suspense fallback={null}>
        <CabinetPageView locale="ru" />
      </Suspense>
    </SiteLayout>
  );
}
