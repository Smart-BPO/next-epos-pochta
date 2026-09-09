import { requireAccess, canMutate } from "@/lib/cms/auth";
import { DashDenied } from "@/components/dashboard/DashDenied";
import { MessagingRulesClient } from "@/components/dashboard/messaging/MessagingRulesClient";
import { listNotifyRules } from "@/lib/messaging/store";

export default async function MessagingRulesPage() {
  const admin = await requireAccess("settings");
  if (!admin) return <DashDenied section="settings" />;
  const rules = await listNotifyRules();
  return (
    <MessagingRulesClient
      rules={rules}
      canWrite={canMutate(admin.role, "settings")}
    />
  );
}
