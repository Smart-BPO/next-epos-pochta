import { requireAccess, canMutate } from "@/lib/cms/auth";
import { getDashT } from "@/i18n/dashboard/server";
import { DashDenied } from "@/components/dashboard/DashDenied";
import { MessagingSubnav } from "@/components/dashboard/messaging/MessagingSubnav";
import { MessagingProvidersClient } from "@/components/dashboard/messaging/MessagingProvidersClient";
import {
  listMessagingProviders,
  maybeImportProvidersFromEnv,
} from "@/lib/messaging/providers";
import { DashPageHeader } from "@/components/dashboard/ui";

export default async function MessagingProvidersPage() {
  const admin = await requireAccess("settings");
  if (!admin) return <DashDenied section="settings" />;

  const { t } = await getDashT();
  await maybeImportProvidersFromEnv().catch(() => undefined);
  const providers = await listMessagingProviders();

  return (
    <div className="space-y-5">
      <DashPageHeader
        title={t.messaging.providersTitle}
        lead={t.messaging.providersLead}
      />
      <MessagingSubnav />
      <MessagingProvidersClient
        providers={providers}
        canEditSecrets={canMutate(admin.role, "messaging_secrets")}
      />
    </div>
  );
}
