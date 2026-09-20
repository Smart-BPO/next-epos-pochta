import { getDashT } from "@/i18n/dashboard/server";
import { DashBreadcrumbs } from "@/components/dashboard/ui";
import { dashPageLead, dashPageTitle } from "@/styles/dashboard";
import { cn } from "@/lib/cn";
import { FcargoSubnav } from "./FcargoSubnav";

export default async function FcargoSettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { t } = await getDashT();

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
      <FcargoSubnav />
      {children}
    </div>
  );
}
