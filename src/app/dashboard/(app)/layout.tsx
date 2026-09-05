import { requireAdmin } from "@/lib/cms/auth";
import { DashboardChrome } from "@/components/dashboard/DashboardChrome";

export default async function DashboardAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await requireAdmin();
  return <DashboardChrome admin={admin}>{children}</DashboardChrome>;
}
