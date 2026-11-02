import type { Metadata } from "next";
import { isLocale, ogLocale, type Locale } from "@/i18n/config";
import { infoContactCopy } from "@/data/info-contact";
import { InfoContactPageView } from "@/views/InfoContactPageView";
import { createPageMetadata } from "@/utils/seo/metadata";

type PageProps = {
  searchParams: Promise<{ lang?: string }>;
};

function localeFromQuery(lang: string | undefined): Locale {
  return isLocale(lang) ? lang : "uz";
}

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const { lang } = await searchParams;
  const locale = localeFromQuery(lang);
  const copy = infoContactCopy(locale);
  return createPageMetadata(copy.metaTitle, copy.metaDescription, "/info/contact/", {
    locale,
    ogLocale: ogLocale[locale],
    noIndex: true,
  });
}

export default async function InfoContactPage({ searchParams }: PageProps) {
  const { lang } = await searchParams;
  return <InfoContactPageView locale={localeFromQuery(lang)} />;
}
