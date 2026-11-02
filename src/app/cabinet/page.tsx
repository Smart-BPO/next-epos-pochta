import type { Metadata } from "next";
import { SiteLayout } from "@/components/templates/SiteLayout";
import { CabinetPageView } from "@/views/CabinetPageView";
import { cabinetCopy } from "@/data/cabinet";
import { createPageMetadata } from "@/utils/seo/metadata";
import { getLocalizedAlternates, localePath } from "@/i18n/paths";
import { ogLocale } from "@/i18n/config";

export function generateMetadata(): Metadata {
  const copy = cabinetCopy("uz");
  return createPageMetadata(
    copy.metaTitle,
    copy.metaDescription,
    localePath("uz", "/cabinet/"),
    {
      alternates: getLocalizedAlternates("/cabinet/"),
      ogLocale: ogLocale.uz,
      noIndex: true,
    },
  );
}

export default function CabinetPage() {
  return (
    <SiteLayout locale="uz">
      <CabinetPageView locale="uz" />
    </SiteLayout>
  );
}
