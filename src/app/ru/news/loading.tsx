import { SiteLayout } from "@/components/templates/SiteLayout";
import { PublicCardGridSkeleton } from "@/components/skeleton/public";

export default function RuNewsListLoading() {
  return (
    <SiteLayout locale="ru">
      <PublicCardGridSkeleton />
    </SiteLayout>
  );
}
