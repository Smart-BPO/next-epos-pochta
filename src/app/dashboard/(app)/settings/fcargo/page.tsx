import { requireAccess, canMutate } from "@/lib/cms/auth";
import { DashDenied } from "@/components/dashboard/DashDenied";
import {
  countLinkedAccounts,
  listRecentOtpErrors,
} from "@/lib/fcargo/epos-account";
import {
  getFcargoSettingsView,
  maybeImportFcargoFromEnv,
} from "@/lib/fcargo/settings";
import { FcargoConfigClient } from "./FcargoConfigClient";
import { fcargoWebhookUrl, resolveFcargoSiteOrigin } from "./origin";

export default async function DashboardFcargoSettingsPage() {
  const admin = await requireAccess("settings");
  if (!admin) return <DashDenied section="settings" />;

  await maybeImportFcargoFromEnv().catch(() => undefined);
  const settings = await getFcargoSettingsView();
  const canEdit = canMutate(admin.role, "fcargo_secrets");
  const origin = await resolveFcargoSiteOrigin();
  const webhookUrl = fcargoWebhookUrl(origin);
  const [linkedCount, otpErrors] = await Promise.all([
    countLinkedAccounts(),
    listRecentOtpErrors(10),
  ]);

  return (
    <FcargoConfigClient
      settings={settings}
      canEdit={canEdit}
      webhookUrl={webhookUrl}
      linkedCount={linkedCount}
      otpErrors={otpErrors}
    />
  );
}
