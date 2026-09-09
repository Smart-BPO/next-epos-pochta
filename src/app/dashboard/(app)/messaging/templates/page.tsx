import { requireAccess, canMutate } from "@/lib/cms/auth";
import { DashDenied } from "@/components/dashboard/DashDenied";
import { MessagingTemplatesClient } from "@/components/dashboard/messaging/MessagingTemplatesClient";
import { listMessageTemplates } from "@/lib/messaging/store";

export default async function MessagingTemplatesPage() {
  const admin = await requireAccess("settings");
  if (!admin) return <DashDenied section="settings" />;
  void canMutate;
  const rows = await listMessageTemplates();
  return <MessagingTemplatesClient rows={rows} />;
}
