import { requireAccess } from "@/lib/cms/auth";
import { getDashT } from "@/i18n/dashboard/server";
import { DashDenied } from "@/components/dashboard/DashDenied";
import { listFcargoRequestLog } from "@/lib/fcargo/log";
import { dashCardPad, dashInput } from "@/styles/dashboard";
import { FcargoLogList } from "../FcargoLogList";
import { fcargoWebhookUrl, resolveFcargoSiteOrigin } from "../origin";

export default async function DashboardFcargoWebhooksPage() {
  const admin = await requireAccess("settings");
  if (!admin) return <DashDenied section="settings" />;

  const { t } = await getDashT();
  const [rows, origin] = await Promise.all([
    listFcargoRequestLog({
      limit: 50,
      direction: "in",
      includeBodies: true,
    }),
    resolveFcargoSiteOrigin(),
  ]);
  const webhookUrl = fcargoWebhookUrl(origin);

  return (
    <div className="grid max-w-3xl gap-5">
      <div className={`${dashCardPad} grid gap-2`}>
        <p className="m-0 text-sm text-black/55">{t.fcargo.webhooksLead}</p>
        <label className="grid gap-1 text-xs font-semibold uppercase tracking-wide text-black/40">
          {t.fcargo.webhookUrl}
          <input
            readOnly
            value={webhookUrl}
            className={`${dashInput} font-normal normal-case`}
          />
        </label>
      </div>

      <FcargoLogList
        rows={rows}
        variant="webhook"
        title={t.fcargo.webhooksTitle}
        lead=""
      />
    </div>
  );
}
