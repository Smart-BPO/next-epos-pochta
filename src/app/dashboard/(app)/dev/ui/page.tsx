import { notFound } from "next/navigation";
import { getAdminSession } from "@/lib/cms/auth";
import { DashUiShowcase } from "@/components/dashboard/DashUiShowcase";

export default async function DashboardDevUiPage() {
  const admin = await getAdminSession();
  const allowDev =
    process.env.NODE_ENV === "development" ||
    process.env.DASHBOARD_UI_SHOWCASE === "1";

  if (!admin || admin.role !== "owner" || !allowDev) {
    notFound();
  }

  return <DashUiShowcase />;
}
