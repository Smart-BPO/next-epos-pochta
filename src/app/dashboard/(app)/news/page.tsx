import { requireAccess, canMutate } from "@/lib/cms/auth";
import { listNewsAdminRows } from "@/lib/cms/news";
import { DashAccessDenied } from "@/components/dashboard/DashAccessDenied";
import { NewsListClient } from "@/components/dashboard/NewsListClient";

export default async function DashboardNewsPage() {
  const admin = await requireAccess("news");
  if (!admin) {
    return <DashAccessDenied title="Новости" lead="Нет доступа к разделу." />;
  }

  const rows = await listNewsAdminRows();
  const canWrite = canMutate(admin.role, "news");

  return <NewsListClient rows={rows} canWrite={canWrite} />;
}
