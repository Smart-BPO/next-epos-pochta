import Link from "next/link";
import { requireAccess } from "@/lib/cms/auth";
import { getDashT } from "@/i18n/dashboard/server";
import { DashDenied } from "@/components/dashboard/DashDenied";
import { MessagingSubnav } from "@/components/dashboard/messaging/MessagingSubnav";
import {
  listMessagingProviders,
  maybeImportProvidersFromEnv,
} from "@/lib/messaging/providers";
import { listMessageLog } from "@/lib/messaging/store";
import { DashPageHeader } from "@/components/dashboard/ui";
import { dashBtnSecondary, dashCardPad } from "@/styles/dashboard";
import { hasMessagingSecretsKey } from "@/lib/crypto/secrets";

export default async function MessagingOverviewPage() {
  const admin = await requireAccess("settings");
  if (!admin) return <DashDenied section="settings" />;

  const { t } = await getDashT();
  await maybeImportProvidersFromEnv().catch(() => undefined);
  const providers = await listMessagingProviders();
  const log = await listMessageLog(5);
  const masterOk = hasMessagingSecretsKey();

  return (
    <div className="space-y-5">
      <DashPageHeader title={t.messaging.title} lead={t.messaging.lead} />
      <MessagingSubnav />
      {!masterOk ? (
        <p className="m-0 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {t.messaging.masterKeyMissing}
        </p>
      ) : null}
      <div className="grid gap-3 sm:grid-cols-3">
        {providers.map((p) => (
          <div key={p.id} className={dashCardPad}>
            <p className="m-0 text-sm font-semibold text-ink">
              {p.id === "playmobile"
                ? t.messaging.playmobile
                : p.id === "eskiz"
                  ? t.messaging.eskiz
                  : t.messaging.resend}
            </p>
            <p className="m-0 mt-1 text-xs text-black/45">
              {p.enabled ? t.messaging.enabled : t.list.inactive}
              {p.hasSecrets ? ` · ${t.messaging.secretsHint}` : ""}
              {p.isPrimarySms ? ` · ${t.messaging.primarySms}` : ""}
            </p>
            {p.lastError ? (
              <p className="m-0 mt-2 text-xs text-primary">{p.lastError}</p>
            ) : null}
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        <Link
          href="/dashboard/messaging/providers/"
          className={dashBtnSecondary}
        >
          {t.messaging.navProviders}
        </Link>
        <Link
          href="/dashboard/messaging/templates/"
          className={dashBtnSecondary}
        >
          {t.messaging.navTemplates}
        </Link>
        <Link href="/dashboard/messaging/rules/" className={dashBtnSecondary}>
          {t.messaging.navRules}
        </Link>
      </div>
      {log.length ? (
        <div className={dashCardPad}>
          <p className="m-0 mb-2 text-sm font-semibold">{t.messaging.logTitle}</p>
          <ul className="m-0 list-none space-y-2 p-0">
            {log.map((row) => (
              <li key={row.id} className="text-xs text-black/55">
                {row.created_at.slice(0, 19)} · {row.channel} · {row.status} ·{" "}
                {row.to_masked || "—"}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
