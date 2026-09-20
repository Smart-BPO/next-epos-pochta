"use client";

import { useState, useTransition } from "react";
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
  debugFcargoProbeAction,
  saveFcargoSettingsAction,
  syncFcargoOrdersAction,
  type FcargoDebugProbeResult,
} from "./actions";

export type FcargoLogRow = {
  id: string;
  direction: string;
  method: string;
  path: string;
  http_status: number | null;
  duration_ms: number | null;
  ok: boolean | null;
  lead_id: string | null;
  order_id: string | null;
  tracking_number: string | null;
  error_message: string | null;
  created_at: string;
};

function JsonBlock({ value }: { value: unknown }) {
  return (
    <pre className="m-0 max-h-80 overflow-auto rounded-lg bg-black/[0.04] p-3 text-[11px] leading-relaxed text-ink">
      {JSON.stringify(value, null, 2)}
    </pre>
  );
}

export function FcargoSettingsClient({
  settings,
  canEdit,
  webhookUrl,
  recentLog,
}: {
  settings: FcargoSettingsView;
  canEdit: boolean;
  webhookUrl: string;
  recentLog: FcargoLogRow[];
}) {
  const t = useDashT();
  const f = t.fcargo;
  const [pending, startTransition] = useTransition();
  const [probeResult, setProbeResult] = useState<FcargoDebugProbeResult | null>(
    null,
  );

  async function onSave(formData: FormData) {
    try {
      await saveFcargoSettingsAction(formData);
      toast.success(f.saved);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : f.saveFailed);
    }
  }

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

  function runProbe(formData: FormData) {
    startTransition(async () => {
      try {
        const result = await debugFcargoProbeAction(formData);
        setProbeResult(result);
        if (result.ok) {
          toast.success(`${f.probeOk} · ${result.elapsedMs}ms`);
        } else {
          toast.error(result.message || result.code || f.requestFailed);
        }
      } catch (err) {
        toast.error(err instanceof Error ? err.message : f.requestFailed);
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

      <form action={onSave} className={`${dashCardPad} grid gap-3`}>
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
              disabled={!settings.masterKeyOk || pending}
            >
              {f.save}
            </button>
            <button
              type="button"
              className={dashBtnSecondary}
              onClick={onClearKey}
              disabled={!settings.hasSecrets || pending}
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
            disabled={pending || settings.runtimeSource === "none"}
          >
            {f.syncRun}
          </button>
        </section>
      ) : null}

      <section className={`${dashCardPad} grid gap-3`}>
        <h2 className={dashSectionTitle}>{f.logTitle}</h2>
        {recentLog.length === 0 ? (
          <p className="m-0 text-sm text-black/45">{f.logEmpty}</p>
        ) : (
          <ul className="m-0 grid list-none gap-2 p-0 text-xs text-black/70">
            {recentLog.map((row) => (
              <li
                key={row.id}
                className="rounded-lg border border-black/[0.06] px-3 py-2"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-ink">
                    {row.direction === "in" ? f.logIn : f.logOut}
                  </span>
                  <span>
                    {row.method} {row.path}
                  </span>
                  {row.http_status != null ? (
                    <span className="text-black/40">{row.http_status}</span>
                  ) : null}
                  {row.ok === false ? (
                    <span className="text-primary">{row.error_message || "err"}</span>
                  ) : null}
                </div>
                <div className="mt-0.5 text-[11px] text-black/40">
                  {new Date(row.created_at).toLocaleString()}
                  {row.lead_id ? ` · ${row.lead_id}` : ""}
                  {row.order_id ? ` · #${row.order_id}` : ""}
                  {row.duration_ms != null ? ` · ${row.duration_ms}ms` : ""}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {canEdit ? (
        <section className={`${dashCardPad} grid gap-4`}>
          <h2 className={dashSectionTitle}>{f.debugTitle}</h2>

          <div className="flex flex-wrap gap-2">
            {(
              [
                ["health", f.probeCheck],
                ["statuses", f.probeStatuses],
                ["regions", f.probeRegions],
                ["orders", f.probeOrders],
                ["packages", f.probePackages],
              ] as const
            ).map(([probe, label]) => (
              <form key={probe} action={runProbe}>
                <input type="hidden" name="probe" value={probe} />
                <button
                  type="submit"
                  className={dashBtnSecondary}
                  disabled={pending}
                >
                  {label}
                </button>
              </form>
            ))}
          </div>

          <form
            action={runProbe}
            className="grid gap-2 rounded-xl border border-black/[0.06] p-3 sm:grid-cols-[1fr_1fr_6rem_auto]"
          >
            <input type="hidden" name="probe" value="pricing" />
            <label className="grid gap-1 text-[10px] font-semibold uppercase tracking-wide text-black/40">
              {f.pricingFrom}
              <input
                name="from_region_id"
                defaultValue="1726"
                className={dashInput}
                disabled={pending}
              />
            </label>
            <label className="grid gap-1 text-[10px] font-semibold uppercase tracking-wide text-black/40">
              {f.pricingTo}
              <input
                name="to_region_id"
                defaultValue="1718"
                className={dashInput}
                disabled={pending}
              />
            </label>
            <label className="grid gap-1 text-[10px] font-semibold uppercase tracking-wide text-black/40">
              {f.pricingKg}
              <input
                name="weight"
                defaultValue="1"
                className={dashInput}
                disabled={pending}
              />
            </label>
            <div className="flex items-end">
              <button type="submit" className={dashBtnSecondary} disabled={pending}>
                {f.pricingRun}
              </button>
            </div>
          </form>

          <form
            action={runProbe}
            className="grid gap-2 rounded-xl border border-black/[0.06] p-3 sm:grid-cols-[1fr_auto]"
          >
            <input type="hidden" name="probe" value="track" />
            <label className="grid gap-1 text-[10px] font-semibold uppercase tracking-wide text-black/40">
              {f.trackLabel}
              <input
                name="tracking"
                placeholder={f.trackLabel}
                className={dashInput}
                disabled={pending}
              />
            </label>
            <div className="flex items-end">
              <button type="submit" className={dashBtnSecondary} disabled={pending}>
                {f.trackRun}
              </button>
            </div>
          </form>

          <form
            action={runProbe}
            className="grid gap-2 rounded-xl border border-black/[0.06] p-3 sm:grid-cols-[1fr_auto]"
          >
            <input type="hidden" name="probe" value="order" />
            <label className="grid gap-1 text-[10px] font-semibold uppercase tracking-wide text-black/40">
              {f.orderId}
              <input
                name="order_id"
                placeholder={f.orderId}
                className={dashInput}
                disabled={pending}
              />
            </label>
            <div className="flex items-end">
              <button type="submit" className={dashBtnSecondary} disabled={pending}>
                {f.orderRun}
              </button>
            </div>
          </form>

          <form
            action={runProbe}
            className="grid gap-2 rounded-xl border border-black/[0.06] p-3 sm:grid-cols-[1fr_auto]"
          >
            <input type="hidden" name="probe" value="resolve" />
            <label className="grid gap-1 text-[10px] font-semibold uppercase tracking-wide text-black/40">
              {f.regionCode}
              <input
                name="soato"
                defaultValue="1726"
                className={dashInput}
                disabled={pending}
              />
            </label>
            <div className="flex items-end">
              <button type="submit" className={dashBtnSecondary} disabled={pending}>
                {f.regionRun}
              </button>
            </div>
          </form>

          {probeResult ? (
            <div className="grid gap-2">
              <p className="m-0 text-xs text-black/50">
                {probeResult.ok ? f.probeOk : f.probeFail}
                {` · ${probeResult.elapsedMs}ms`}
              </p>
              <JsonBlock
                value={
                  probeResult.ok
                    ? probeResult.data
                    : {
                        message: probeResult.message,
                        details: probeResult.data,
                      }
                }
              />
            </div>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
