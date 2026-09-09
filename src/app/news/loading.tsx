import { SiteLayout } from "@/components/templates/SiteLayout";
import { PublicCardGridSkeleton } from "@/components/skeleton/public";

export default function NewsListLoading() {
  return (
    <SiteLayout locale="uz">
      <PublicCardGridSkeleton />
    </SiteLayout>
  );
}
