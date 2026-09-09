import { SiteLayout } from "@/components/templates/SiteLayout";
import { PublicArticleSkeleton } from "@/components/skeleton/public";

export default function NewsArticleLoading() {
  return (
    <SiteLayout locale="uz">
      <PublicArticleSkeleton />
    </SiteLayout>
  );
}
