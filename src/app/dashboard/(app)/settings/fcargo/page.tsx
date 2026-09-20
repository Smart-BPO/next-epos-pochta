import { headers } from "next/headers";
import { requireAccess, canMutate } from "@/lib/cms/auth";
import { getDashT } from "@/i18n/dashboard/server";
import { DashDenied } from "@/components/dashboard/DashDenied";
import { DashBreadcrumbs } from "@/components/dashboard/ui";
import {
  getFcargoSettingsView,
  maybeImportFcargoFromEnv,
} from "@/lib/fcargo/settings";
import { listFcargoRequestLog } from "@/lib/fcargo/log";
import { getCanonicalSiteUrl } from "@/utils/seo/indexing";
import { dashPageLead, dashPageTitle } from "@/styles/dashboard";
import { cn } from "@/lib/cn";
import { FcargoSettingsClient } from "./FcargoSettingsClient";

async function resolveOrigin(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") || h.get("host");
  const proto = h.get("x-forwarded-proto") || "https";
  if (host && !host.includes("localhost") && !host.startsWith("127.")) {
    return `${proto}://${host}`;
  }
  return getCanonicalSiteUrl();
}

export default async function DashboardFcargoSettingsPage() {
  const admin = await requireAccess("settings");
  if (!admin) return <DashDenied section="settings" />;

  const { t } = await getDashT();
  await maybeImportFcargoFromEnv().catch(() => undefined);
  const [settings, recentLog] = await Promise.all([
    getFcargoSettingsView(),
    listFcargoRequestLog(30),
  ]);
  const canEdit = canMutate(admin.role, "fcargo_secrets");
  const origin = await resolveOrigin();
  const webhookUrl = `${origin.replace(/\/+$/, "")}/api/fcargo/webhook/`;

  return (
    <div className="space-y-6">
      <div>
        <DashBreadcrumbs
          items={[
            {
              href: "/dashboard/settings/",
              label: t.fcargo.breadcrumbsSettings,
            },
            { label: t.fcargo.title },
          ]}
        />
        <h1 className={cn(dashPageTitle, "mt-1")}>{t.fcargo.title}</h1>
        <p className={cn(dashPageLead, "max-w-2xl")}>{t.fcargo.lead}</p>
      </div>

      <FcargoSettingsClient
        settings={settings}
        canEdit={canEdit}
        webhookUrl={webhookUrl}
        recentLog={recentLog}
      />
    </div>
  );
}
