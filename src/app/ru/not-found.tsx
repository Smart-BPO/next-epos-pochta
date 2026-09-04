import type { Metadata } from "next";
import { SiteLayout } from "@/components/templates/SiteLayout";
import { NotFoundView } from "@/views/NotFoundView";
import { getContent } from "@/i18n/get-content";

export const metadata: Metadata = {
  title: getContent("ru").meta.notFoundTitle,
  robots: { index: false, follow: false },
};

/** Segment 404 when notFound() runs under /ru/* */
export default function RuNotFound() {
  return (
    <SiteLayout locale="ru">
      <NotFoundView locale="ru" />
    </SiteLayout>
  );
}
