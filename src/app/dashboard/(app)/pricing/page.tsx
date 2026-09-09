import { requireAccess, canMutate } from "@/lib/cms/auth";
import { DashDenied } from "@/components/dashboard/DashDenied";
import { PricingAdminClient } from "@/components/dashboard/PricingAdminClient";
import {
  listPricingRevisions,
  loadPricingConfig,
} from "@/lib/pricing/settings";
import { listPricingRoutes } from "@/lib/pricing/routes";
import { dashPageLead, dashPageTitle } from "@/styles/dashboard";

export default async function DashboardPricingPage() {
  const admin = await requireAccess("settings");
  if (!admin) {
    return <DashDenied section="settings" />;
  }

  const [loaded, routes, revisions] = await Promise.all([
    loadPricingConfig({ bypassCache: true }),
    listPricingRoutes({ activeOnly: false }),
    listPricingRevisions(40),
  ]);
  const canWrite = canMutate(admin.role, "settings");

  return (
    <div className="space-y-6">
      <div>
        <h1 className={dashPageTitle}>Калькулятор</h1>
        <p className={dashPageLead}>
          Ориентировочные ставки для сметы на сайте. Не оферта и не публичный
          тариф.
        </p>
      </div>
      <PricingAdminClient
        initialEnabled={loaded.enabled}
        initialConfig={loaded.config}
        formulaVersion={loaded.formulaVersion}
        canWrite={canWrite}
        initialRoutes={routes}
        revisions={revisions.map((r) => ({
          id: r.id as number,
          created_at: String(r.created_at),
          label: String(r.label ?? ""),
          kind: String(r.kind ?? "auto"),
          snapshot: r.snapshot as
            | { routes?: unknown[]; formulaVersion?: string }
            | undefined,
        }))}
      />
    </div>
  );
}
