import { SiteLayout } from "@/components/templates/SiteLayout";
import { PublicArticleSkeleton } from "@/components/skeleton/public";

export default function ZhNewsArticleLoading() {
  return (
    <SiteLayout locale="zh">
      <PublicArticleSkeleton />
    </SiteLayout>
  );
}
