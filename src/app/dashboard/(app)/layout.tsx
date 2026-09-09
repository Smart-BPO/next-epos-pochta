import { requireAdmin } from "@/lib/cms/auth";
import { getDashNotifications } from "@/lib/cms/notifications";
import { DashboardChrome } from "@/components/dashboard/DashboardChrome";

export default async function DashboardAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await requireAdmin();
  const notifications = await getDashNotifications(admin);
  return (
    <DashboardChrome admin={admin} notifications={notifications}>
      {children}
    </DashboardChrome>
  );
}
