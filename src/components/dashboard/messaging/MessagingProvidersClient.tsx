"use client";

import { useDashT } from "@/components/dashboard/DashLocaleProvider";
import type { ProviderPublicView } from "@/lib/messaging/providers";
import { dashBtnPrimary, dashBtnSecondary, dashCardPad, dashInput } from "@/styles/dashboard";
import {
  saveProviderAction,
  testProviderAction,
} from "@/app/dashboard/(app)/messaging/actions";
import { toast } from "react-toastify";

export function MessagingProvidersClient({
  providers,
  canEditSecrets,
}: {
  providers: ProviderPublicView[];
  canEditSecrets: boolean;
}) {
  const t = useDashT();

  async function onSave(formData: FormData) {
    try {
      await saveProviderAction(formData);
      toast.success(t.messaging.saved);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t.errors.saveFailed);
    }
  }

  async function onTest(formData: FormData) {
    try {
      await testProviderAction(formData);
      toast.success(t.messaging.testSent);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t.messaging.testFailed);
    }
  }

  return (
    <div className="grid gap-4">
      {providers.map((p) => (
        <div key={p.id} className={`${dashCardPad} space-y-3`}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="m-0 text-base font-semibold text-ink">
              {p.id === "playmobile"
                ? t.messaging.playmobile
                : p.id === "eskiz"
                  ? t.messaging.eskiz
                  : t.messaging.resend}
            </p>
            <p className="m-0 text-xs text-black/45">
              {p.hasSecrets ? `${t.messaging.secretsHint} ${p.secretsHint}` : "—"}
            </p>
          </div>

          {!p.masterKeyOk ? (
            <p className="m-0 text-xs text-primary">
              {t.messaging.masterKeyMissing}
            </p>
          ) : null}

          <form action={onSave} className="grid gap-3">
            <input type="hidden" name="id" value={p.id} />
            <label className="flex items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                name="enabled"
                defaultChecked={p.enabled}
                disabled={!canEditSecrets}
                className="size-4 rounded border-black/20"
              />
              {t.messaging.enabled}
            </label>
            {p.id !== "resend" ? (
              <label className="flex items-center gap-2 text-sm font-medium">
                <input
                  type="checkbox"
                  name="is_primary_sms"
                  defaultChecked={p.isPrimarySms}
                  disabled={!canEditSecrets}
                  className="size-4 rounded border-black/20"
                />
                {t.messaging.primarySms}
              </label>
            ) : null}

            {p.id === "playmobile" ? (
              <>
                <label className="grid gap-1 text-xs font-semibold uppercase tracking-wide text-black/40">
                  Base URL
                  <input
                    name="base_url"
                    defaultValue={p.config.base_url ?? ""}
                    disabled={!canEditSecrets}
                    className={dashInput}
                    placeholder="https://send.smsxabar.uz/broker-api"
                  />
                </label>
                <label className="grid gap-1 text-xs font-semibold uppercase tracking-wide text-black/40">
                  Originator
                  <input
                    name="originator"
                    defaultValue={p.config.originator ?? ""}
                    disabled={!canEditSecrets}
                    className={dashInput}
                  />
                </label>
                <label className="grid gap-1 text-xs font-semibold uppercase tracking-wide text-black/40">
                  Login
                  <input
                    name="login"
                    disabled={!canEditSecrets}
                    className={dashInput}
                    placeholder={t.messaging.leaveBlank}
                    autoComplete="off"
                  />
                </label>
                <label className="grid gap-1 text-xs font-semibold uppercase tracking-wide text-black/40">
                  Password
                  <input
                    name="password"
                    type="password"
                    disabled={!canEditSecrets}
                    className={dashInput}
                    placeholder={t.messaging.leaveBlank}
                    autoComplete="new-password"
                  />
                </label>
              </>
            ) : null}

            {p.id === "eskiz" ? (
              <>
                <label className="grid gap-1 text-xs font-semibold uppercase tracking-wide text-black/40">
                  From
                  <input
                    name="from"
                    defaultValue={p.config.from ?? "4546"}
                    disabled={!canEditSecrets}
                    className={dashInput}
                  />
                </label>
                <label className="grid gap-1 text-xs font-semibold uppercase tracking-wide text-black/40">
                  Email
                  <input
                    name="email"
                    disabled={!canEditSecrets}
                    className={dashInput}
                    placeholder={t.messaging.leaveBlank}
                    autoComplete="off"
                  />
                </label>
                <label className="grid gap-1 text-xs font-semibold uppercase tracking-wide text-black/40">
                  Password
                  <input
                    name="password"
                    type="password"
                    disabled={!canEditSecrets}
                    className={dashInput}
                    placeholder={t.messaging.leaveBlank}
                    autoComplete="new-password"
                  />
                </label>
              </>
            ) : null}

            {p.id === "resend" ? (
              <>
                <label className="grid gap-1 text-xs font-semibold uppercase tracking-wide text-black/40">
                  From name
                  <input
                    name="from_name"
                    defaultValue={p.config.from_name ?? ""}
                    disabled={!canEditSecrets}
                    className={dashInput}
                  />
                </label>
                <label className="grid gap-1 text-xs font-semibold uppercase tracking-wide text-black/40">
                  From email
                  <input
                    name="from_email"
                    defaultValue={p.config.from_email ?? ""}
                    disabled={!canEditSecrets}
                    className={dashInput}
                  />
                </label>
                <label className="grid gap-1 text-xs font-semibold uppercase tracking-wide text-black/40">
                  Staff notify emails
                  <input
                    name="notify_to"
                    defaultValue={p.config.notify_to ?? ""}
                    disabled={!canEditSecrets}
                    className={dashInput}
                  />
                </label>
                <label className="grid gap-1 text-xs font-semibold uppercase tracking-wide text-black/40">
                  API key
                  <input
                    name="api_key"
                    type="password"
                    disabled={!canEditSecrets}
                    className={dashInput}
                    placeholder={t.messaging.leaveBlank}
                    autoComplete="new-password"
                  />
                </label>
              </>
            ) : null}

            {canEditSecrets ? (
              <button type="submit" className={`${dashBtnPrimary} w-fit`}>
                {t.common.save}
              </button>
            ) : null}
          </form>

          {canEditSecrets ? (
            <form action={onTest} className="flex flex-wrap items-end gap-2 border-t border-black/[0.06] pt-3">
              <input type="hidden" name="id" value={p.id} />
              <label className="grid min-w-[12rem] flex-1 gap-1 text-xs font-semibold uppercase tracking-wide text-black/40">
                {p.id === "resend" ? t.messaging.testEmail : t.messaging.testPhone}
                <input name="to" required className={dashInput} />
              </label>
              <button type="submit" className={dashBtnSecondary}>
                {t.messaging.sendTest}
              </button>
            </form>
          ) : null}
        </div>
      ))}
    </div>
  );
}
