"use client";

import { useEffect, useTransition, useActionState } from "react";
import { toast } from "react-toastify";
import { useDashT } from "@/components/dashboard/DashLocaleProvider";
import { dashFormat } from "@/i18n/dashboard";
import type { FcargoSettingsView } from "@/lib/fcargo/types";
import {
  dashBtnPrimary,
  dashBtnSecondary,
  dashCardPad,
  dashInput,
  dashSectionTitle,
} from "@/styles/dashboard";
import {
  clearFcargoApiKeyAction,
  saveFcargoSettingsAction,
  syncFcargoOrdersAction,
} from "./actions";

export function FcargoConfigClient({
  settings,
  canEdit,
  webhookUrl,
}: {
  settings: FcargoSettingsView;
  canEdit: boolean;
  webhookUrl: string;
}) {
  const t = useDashT();
  const f = t.fcargo;
  const [pending, startTransition] = useTransition();
  const [saveState, saveAction, savePending] = useActionState(
    saveFcargoSettingsAction,
    null,
  );

  useEffect(() => {
    if (!saveState) return;
    if (saveState.ok) toast.success(f.saved);
    else if (saveState.error) toast.error(saveState.error);
  }, [saveState, f.saved]);

  function onClearKey() {
    if (!confirm(f.clearConfirm)) return;
    startTransition(async () => {
      try {
        await clearFcargoApiKeyAction();
        toast.success(f.keyCleared);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : f.saveFailed);
      }
    });
  }

  function onSync() {
    startTransition(async () => {
      try {
        const result = await syncFcargoOrdersAction();
        toast.success(
          dashFormat(f.syncDone, {
            checked: result.checked,
            updated: result.updated,
            errors: result.errors,
          }),
        );
      } catch (err) {
        toast.error(err instanceof Error ? err.message : f.requestFailed);
      }
    });
  }

  const busy = pending || savePending;

  const statusLabel =
    settings.runtimeSource === "none"
      ? f.statusOff
      : settings.enabled
        ? f.statusOn
        : f.statusDisabled;

  const modeLabel = settings.mode === "test" ? f.modeTest : f.modeLive;

  return (
    <div className="grid max-w-3xl gap-5">
      <p className={`${dashCardPad} m-0 text-sm text-black/60`}>
        {f.status}: <strong className="text-ink">{statusLabel}</strong>
        {settings.hasSecrets ? ` · ${f.keyHint} ${settings.secretsHint}` : ""}
        {settings.mode ? ` · ${modeLabel}` : ""}
      </p>

      {!settings.masterKeyOk ? (
        <p className={`${dashCardPad} m-0 text-sm text-primary`}>
          {f.masterKeyMissing}
        </p>
      ) : null}

      <p className="m-0 text-sm text-black/50">{f.configLead}</p>

      <form action={saveAction} className={`${dashCardPad} grid gap-3`}>
        <h2 className={dashSectionTitle}>{f.sectionConnect}</h2>

        <label className="flex items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            name="enabled"
            defaultChecked={settings.enabled}
            disabled={!canEdit || !settings.masterKeyOk}
            className="size-4 rounded border-black/20"
          />
          {f.enabled}
        </label>

        <label className="grid gap-1 text-xs font-semibold uppercase tracking-wide text-black/40">
          {f.domain}
          <input
            name="tenant_domain"
            defaultValue={settings.tenantDomain}
            disabled={!canEdit}
            className={`${dashInput} font-normal normal-case`}
            placeholder="epos-pochta.uz"
            required
          />
        </label>

        <label className="grid gap-1 text-xs font-semibold uppercase tracking-wide text-black/40">
          {f.serverUrl}
          <input
            name="base_url"
            defaultValue={settings.baseUrl}
            disabled={!canEdit}
            className={`${dashInput} font-normal normal-case`}
            placeholder="https://api.fcargo.uz"
          />
        </label>

        <fieldset className="grid gap-2">
          <legend className="text-xs font-semibold uppercase tracking-wide text-black/40">
            {f.mode}
          </legend>
          <div className="flex gap-4 text-sm font-medium">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="mode"
                value="live"
                defaultChecked={settings.mode === "live"}
                disabled={!canEdit}
              />
              {f.modeLiveLabel}
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="mode"
                value="test"
                defaultChecked={settings.mode === "test"}
                disabled={!canEdit}
              />
              {f.modeTestLabel}
            </label>
          </div>
        </fieldset>

        <label className="grid gap-1 text-xs font-semibold uppercase tracking-wide text-black/40">
          {f.apiKey}
          <input
            name="api_key"
            type="password"
            disabled={!canEdit || !settings.masterKeyOk}
            className={`${dashInput} font-normal normal-case`}
            placeholder={
              settings.hasSecrets
                ? dashFormat(f.apiKeyPlaceholderKeep, {
                    hint: settings.secretsHint,
                  })
                : f.apiKeyPlaceholderNew
            }
            autoComplete="new-password"
          />
        </label>

        <div className="mt-2 border-t border-black/[0.06] pt-3">
          <h3 className="m-0 mb-1 text-sm font-semibold text-ink">
            {f.sectionWebhook}
          </h3>
          <p className="m-0 mb-3 text-xs text-black/50">{f.webhookLead}</p>

          <label className="grid gap-1 text-xs font-semibold uppercase tracking-wide text-black/40">
            {f.webhookUrl}
            <input
              readOnly
              value={webhookUrl}
              className={`${dashInput} font-normal normal-case`}
              onFocus={(e) => e.currentTarget.select()}
            />
          </label>

          <label className="mt-3 grid gap-1 text-xs font-semibold uppercase tracking-wide text-black/40">
            {f.webhookSecret}
            <input
              name="webhook_secret"
              type="password"
              disabled={!canEdit || !settings.masterKeyOk}
              className={`${dashInput} font-normal normal-case`}
              placeholder={
                settings.hasWebhookSecret
                  ? dashFormat(f.webhookSecretPlaceholderKeep, {
                      hint: settings.webhookSecretHint,
                    })
                  : f.webhookSecretPlaceholderNew
              }
              autoComplete="new-password"
            />
          </label>
          <p className="m-0 mt-1 text-[11px] text-black/40">
            {f.webhookHeaderHint}
          </p>
        </div>

        {settings.lastTestAt ? (
          <p className="m-0 text-xs text-black/50">
            {f.lastCheck}:{" "}
            {settings.lastTestOk
              ? f.lastCheckOk
              : `${f.lastCheckFail} — ${settings.lastError ?? "?"}`}{" "}
            · {new Date(settings.lastTestAt).toLocaleString()}
          </p>
        ) : null}

        {canEdit ? (
          <div className="mt-1 flex flex-wrap gap-2">
            <button
              type="submit"
              className={dashBtnPrimary}
              disabled={!settings.masterKeyOk || busy}
            >
              {f.save}
            </button>
            <button
              type="button"
              className={dashBtnSecondary}
              onClick={onClearKey}
              disabled={!settings.hasSecrets || busy}
            >
              {f.clearKey}
            </button>
          </div>
        ) : (
          <p className="m-0 text-sm text-black/50">{f.roleDenied}</p>
        )}
      </form>

      {canEdit ? (
        <section className={`${dashCardPad} grid gap-3`}>
          <h2 className={dashSectionTitle}>{f.syncTitle}</h2>
          <p className="m-0 text-sm text-black/55">{f.syncLead}</p>
          <button
            type="button"
            className={dashBtnSecondary}
            onClick={onSync}
            disabled={busy || settings.runtimeSource === "none"}
          >
            {f.syncRun}
          </button>
        </section>
      ) : null}
    </div>
  );
}
