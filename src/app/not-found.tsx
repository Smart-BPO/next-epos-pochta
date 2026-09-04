import { headers } from "next/headers";
import { SiteLayout } from "@/components/templates/SiteLayout";
import { NotFoundView } from "@/views/NotFoundView";
import type { Locale } from "@/i18n/config";

export default async function NotFound() {
  const lang = (await headers()).get("x-html-lang");
  const locale: Locale = lang === "ru" ? "ru" : "uz";
  return (
    <SiteLayout locale={locale}>
      <NotFoundView locale={locale} />
    </SiteLayout>
  );
}
