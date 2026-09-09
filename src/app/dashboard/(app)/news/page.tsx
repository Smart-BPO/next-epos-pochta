import { requireAccess, canMutate } from "@/lib/cms/auth";
import { listNewsAdminRows } from "@/lib/cms/news";
import { DashDenied } from "@/components/dashboard/DashDenied";
import { NewsListClient } from "@/components/dashboard/NewsListClient";

export default async function DashboardNewsPage() {
  const admin = await requireAccess("news");
  if (!admin) {
    return <DashDenied section="news" />;
  }

  const rows = await listNewsAdminRows();
  const canWrite = canMutate(admin.role, "news");

  return <NewsListClient rows={rows} canWrite={canWrite} />;
}
