import { requireAccess } from "@/lib/cms/auth";
import { DashDenied } from "@/components/dashboard/DashDenied";
import { MessagingLogClient } from "@/components/dashboard/messaging/MessagingLogClient";
import { listMessageLog } from "@/lib/messaging/store";

export default async function MessagingLogPage() {
  const admin = await requireAccess("settings");
  if (!admin) return <DashDenied section="settings" />;
  const rows = await listMessageLog(200);
  return <MessagingLogClient rows={rows} />;
}
