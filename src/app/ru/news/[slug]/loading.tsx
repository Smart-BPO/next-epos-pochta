import { SiteLayout } from "@/components/templates/SiteLayout";
import { PublicArticleSkeleton } from "@/components/skeleton/public";

export default function RuNewsArticleLoading() {
  return (
    <SiteLayout locale="ru">
      <PublicArticleSkeleton />
    </SiteLayout>
  );
}
