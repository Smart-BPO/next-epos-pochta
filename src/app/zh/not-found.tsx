import type { Metadata } from "next";
import { SiteLayout } from "@/components/templates/SiteLayout";
import { NotFoundView } from "@/views/NotFoundView";
import { getContent } from "@/i18n/get-content";

export const metadata: Metadata = {
  title: getContent("zh").meta.notFoundTitle,
  robots: { index: false, follow: false },
};

/** Segment 404 when notFound() runs under /zh/* */
export default function ZhNotFound() {
  return (
    <SiteLayout locale="zh">
      <NotFoundView locale="zh" />
    </SiteLayout>
  );
}
