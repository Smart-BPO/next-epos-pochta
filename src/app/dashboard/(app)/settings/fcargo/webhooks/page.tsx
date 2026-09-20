import { requireAccess } from "@/lib/cms/auth";
import { getDashT } from "@/i18n/dashboard/server";
import { DashDenied } from "@/components/dashboard/DashDenied";
import {
  listFcargoRequestLog,
  type FcargoLogSource,
} from "@/lib/fcargo/log";
import { dashCardPad, dashInput } from "@/styles/dashboard";
import { FcargoLogList } from "../FcargoLogList";
import { fcargoWebhookUrl, resolveFcargoSiteOrigin } from "../origin";

const WEBHOOK_SOURCES: FcargoLogSource[] = ["in_webhook", "inbox_worker"];

function parseSource(
  raw: string | string[] | undefined,
): FcargoLogSource {
  const v = Array.isArray(raw) ? raw[0] : raw;
  if (v && (WEBHOOK_SOURCES as string[]).includes(v)) {
    return v as FcargoLogSource;
  }
  return "in_webhook";
}

export default async function DashboardFcargoWebhooksPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const admin = await requireAccess("settings");
  if (!admin) return <DashDenied section="settings" />;

  const sp = (await searchParams) ?? {};
  const source = parseSource(sp.source);

  const { t } = await getDashT();
  const [rows, origin] = await Promise.all([
    listFcargoRequestLog({
      limit: 50,
      source,
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
        sourceFilter={source}
        filterHrefBase="/dashboard/settings/fcargo/webhooks"
      />
    </div>
  );
}
