import { SiteLayout } from "@/components/templates/SiteLayout";
import { NotFoundView } from "@/views/NotFoundView";

/** Static 404 shell — default UZ; /ru 404 is fine until client lang script runs. */
export default function NotFound() {
  return (
    <SiteLayout locale="uz">
      <NotFoundView locale="uz" />
    </SiteLayout>
  );
}
