import { requireAccess, canMutate } from "@/lib/cms/auth";
import { DashDenied } from "@/components/dashboard/DashDenied";
import {
  getFcargoSettingsView,
  maybeImportFcargoFromEnv,
} from "@/lib/fcargo/settings";
import { FcargoTestClient } from "../FcargoTestClient";

export default async function DashboardFcargoTestPage() {
  const admin = await requireAccess("settings");
  if (!admin) return <DashDenied section="settings" />;

  await maybeImportFcargoFromEnv().catch(() => undefined);
  const settings = await getFcargoSettingsView();
  const canEdit = canMutate(admin.role, "fcargo_secrets");

  return (
    <FcargoTestClient
      canEdit={canEdit}
      configured={settings.runtimeSource !== "none"}
    />
  );
}
