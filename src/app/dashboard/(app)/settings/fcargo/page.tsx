import { requireAccess, canMutate } from "@/lib/cms/auth";
import { DashDenied } from "@/components/dashboard/DashDenied";
import { DashBreadcrumbs } from "@/components/dashboard/ui";
import {
  getFcargoSettingsView,
  maybeImportFcargoFromEnv,
} from "@/lib/fcargo/settings";
import { dashPageLead, dashPageTitle } from "@/styles/dashboard";
import { cn } from "@/lib/cn";
import { FcargoSettingsClient } from "./FcargoSettingsClient";

export default async function DashboardFcargoSettingsPage() {
  const admin = await requireAccess("settings");
  if (!admin) return <DashDenied section="settings" />;

  await maybeImportFcargoFromEnv().catch(() => undefined);
  const settings = await getFcargoSettingsView();
  const canEdit = canMutate(admin.role, "fcargo_secrets");

  return (
    <div className="space-y-6">
      <div>
        <DashBreadcrumbs
          items={[
            { href: "/dashboard/settings/", label: "Настройки" },
            { label: "FCargo" },
          ]}
        />
        <h1 className={cn(dashPageTitle, "mt-1")}>FCargo API</h1>
        <p className={cn(dashPageLead, "max-w-2xl")}>
          Ключ и tenant для калькулятора и заказов. Браузер сайта не видит FCargo —
          только наши <code className="text-xs">/api/*</code>. Секрет в БД
          (MESSAGING_SECRETS_KEY). Ниже — отладка endpoint&apos;ов.
        </p>
      </div>

      <FcargoSettingsClient settings={settings} canEdit={canEdit} />
    </div>
  );
}
