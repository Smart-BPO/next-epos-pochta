import { SiteLayout } from "@/components/templates/SiteLayout";
import { PublicCardGridSkeleton } from "@/components/skeleton/public";

export default function ZhNewsListLoading() {
  return (
    <SiteLayout locale="zh">
      <PublicCardGridSkeleton />
    </SiteLayout>
  );
}
