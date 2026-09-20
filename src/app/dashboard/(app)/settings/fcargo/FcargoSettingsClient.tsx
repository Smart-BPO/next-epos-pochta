"use client";

import { useState, useTransition } from "react";
import { toast } from "react-toastify";
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
  type FcargoDebugProbeResult,
} from "./actions";

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
}: {
  settings: FcargoSettingsView;
  canEdit: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [probeResult, setProbeResult] = useState<FcargoDebugProbeResult | null>(
    null,
  );

  async function onSave(formData: FormData) {
    try {
      await saveFcargoSettingsAction(formData);
      toast.success("Сохранено");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Ошибка сохранения");
    }
  }

  function onClearKey() {
    if (!confirm("Удалить API-ключ из CMS и выключить FCargo?")) return;
    startTransition(async () => {
      try {
        await clearFcargoApiKeyAction();
        toast.success("Ключ удалён");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Ошибка");
      }
    });
  }

  function runProbe(formData: FormData) {
    startTransition(async () => {
      try {
        const result = await debugFcargoProbeAction(formData);
        setProbeResult(result);
        if (result.ok) toast.success(`${result.probe} · ${result.elapsedMs}ms`);
        else toast.error(result.message || result.code || "Ошибка");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Ошибка запроса");
      }
    });
  }

  const sourceLabel =
    settings.runtimeSource === "cms"
      ? "CMS (шифрованный ключ)"
      : settings.runtimeSource === "env"
        ? "legacy env FCARGO_*"
        : "не настроено";

  return (
    <div className="grid max-w-3xl gap-5">
      <section className={`${dashCardPad} text-sm text-black/65`}>
        <p className="m-0 font-semibold text-ink">Server-to-server</p>
        <p className="mt-2 m-0">
          Браузер сайта ходит только в{" "}
          <code className="text-xs">/api/estimate</code> и{" "}
          <code className="text-xs">/api/leads</code>. Ключ FCargo и вызовы{" "}
          <code className="text-xs">api.fcargo.uz</code> остаются на сервере
          Next.js — во фронт не попадают.
        </p>
        <p className="mt-2 m-0 text-xs">
          Runtime сейчас: <strong className="text-ink">{sourceLabel}</strong>
          {settings.mode ? ` · mode=${settings.mode}` : ""}
          {settings.hasSecrets ? ` · key ${settings.secretsHint}` : ""}
        </p>
      </section>

      {!settings.masterKeyOk ? (
        <p className={`${dashCardPad} m-0 text-sm text-primary`}>
          На сервере нет{" "}
          <code className="text-xs">MESSAGING_SECRETS_KEY</code> — API-ключ
          зашифровать и сохранить нельзя.
        </p>
      ) : null}

      <form action={onSave} className={`${dashCardPad} grid gap-3`}>
        <h2 className={dashSectionTitle}>Подключение</h2>

        <label className="flex items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            name="enabled"
            defaultChecked={settings.enabled}
            disabled={!canEdit || !settings.masterKeyOk}
            className="size-4 rounded border-black/20"
          />
          Включить FCargo (калькулятор + заказы)
        </label>

        <label className="grid gap-1 text-xs font-semibold uppercase tracking-wide text-black/40">
          Tenant domain
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
          Base URL
          <input
            name="base_url"
            defaultValue={settings.baseUrl}
            disabled={!canEdit}
            className={`${dashInput} font-normal normal-case`}
            placeholder="https://api.fcargo.uz/api/client/v1"
          />
        </label>

        <fieldset className="grid gap-2">
          <legend className="text-xs font-semibold uppercase tracking-wide text-black/40">
            Режим ключа (test / live)
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
              live
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="mode"
                value="test"
                defaultChecked={settings.mode === "test"}
                disabled={!canEdit}
              />
              test
            </label>
          </div>
          <p className="m-0 text-xs text-black/45">
            Должен совпадать с режимом ключа в кабинете FCargo.
          </p>
        </fieldset>

        <label className="grid gap-1 text-xs font-semibold uppercase tracking-wide text-black/40">
          API key
          <input
            name="api_key"
            type="password"
            disabled={!canEdit || !settings.masterKeyOk}
            className={`${dashInput} font-normal normal-case`}
            placeholder={
              settings.hasSecrets
                ? `Пусто = не менять (${settings.secretsHint})`
                : "Вставьте ключ из FCargo"
            }
            autoComplete="new-password"
          />
        </label>

        {settings.lastTestAt ? (
          <p className="m-0 text-xs text-black/50">
            Последний health:{" "}
            {settings.lastTestOk ? "OK" : `ошибка — ${settings.lastError ?? "?"}`}{" "}
            · {new Date(settings.lastTestAt).toLocaleString("ru-RU")}
          </p>
        ) : null}

        {canEdit ? (
          <div className="mt-1 flex flex-wrap gap-2">
            <button
              type="submit"
              className={dashBtnPrimary}
              disabled={!settings.masterKeyOk || pending}
            >
              Сохранить
            </button>
            <button
              type="button"
              className={dashBtnSecondary}
              onClick={onClearKey}
              disabled={!settings.hasSecrets || pending}
            >
              Удалить ключ
            </button>
          </div>
        ) : (
          <p className="m-0 text-sm text-black/50">
            Редактирование — только owner.
          </p>
        )}
      </form>

      {canEdit ? (
        <section className={`${dashCardPad} grid gap-4`}>
          <div>
            <h2 className={dashSectionTitle}>Отладка API</h2>
            <p className="mt-1 m-0 text-sm text-black/55">
              Запросы уходят с сервера Next.js с сохранённым ключом. Ответ
              показывается здесь без секретов.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {(
              [
                ["health", "GET /health"],
                ["statuses", "GET /statuses"],
                ["regions", "GET /locations/regions"],
                ["orders", "GET /orders"],
                ["packages", "GET /packages"],
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
              from_region_id (SOATO)
              <input
                name="from_region_id"
                defaultValue="1726"
                className={dashInput}
                disabled={pending}
              />
            </label>
            <label className="grid gap-1 text-[10px] font-semibold uppercase tracking-wide text-black/40">
              to_region_id
              <input
                name="to_region_id"
                defaultValue="1718"
                className={dashInput}
                disabled={pending}
              />
            </label>
            <label className="grid gap-1 text-[10px] font-semibold uppercase tracking-wide text-black/40">
              kg
              <input
                name="weight"
                defaultValue="1"
                className={dashInput}
                disabled={pending}
              />
            </label>
            <div className="flex items-end">
              <button type="submit" className={dashBtnSecondary} disabled={pending}>
                Pricing
              </button>
            </div>
          </form>

          <form
            action={runProbe}
            className="grid gap-2 rounded-xl border border-black/[0.06] p-3 sm:grid-cols-[1fr_auto]"
          >
            <input type="hidden" name="probe" value="track" />
            <label className="grid gap-1 text-[10px] font-semibold uppercase tracking-wide text-black/40">
              Tracking
              <input
                name="tracking"
                placeholder="трек-номер"
                className={dashInput}
                disabled={pending}
              />
            </label>
            <div className="flex items-end">
              <button type="submit" className={dashBtnSecondary} disabled={pending}>
                Track
              </button>
            </div>
          </form>

          <form
            action={runProbe}
            className="grid gap-2 rounded-xl border border-black/[0.06] p-3 sm:grid-cols-[1fr_auto]"
          >
            <input type="hidden" name="probe" value="order" />
            <label className="grid gap-1 text-[10px] font-semibold uppercase tracking-wide text-black/40">
              Order ID
              <input
                name="order_id"
                placeholder="id заказа"
                className={dashInput}
                disabled={pending}
              />
            </label>
            <div className="flex items-end">
              <button type="submit" className={dashBtnSecondary} disabled={pending}>
                Get order
              </button>
            </div>
          </form>

          <form
            action={runProbe}
            className="grid gap-2 rounded-xl border border-black/[0.06] p-3 sm:grid-cols-[1fr_auto]"
          >
            <input type="hidden" name="probe" value="resolve" />
            <label className="grid gap-1 text-[10px] font-semibold uppercase tracking-wide text-black/40">
              SOATO resolve
              <input
                name="soato"
                defaultValue="1726"
                className={dashInput}
                disabled={pending}
              />
            </label>
            <div className="flex items-end">
              <button type="submit" className={dashBtnSecondary} disabled={pending}>
                Resolve
              </button>
            </div>
          </form>

          {probeResult ? (
            <div className="grid gap-2">
              <p className="m-0 text-xs text-black/50">
                {probeResult.probe}
                {probeResult.ok ? " · OK" : " · FAIL"}
                {` · ${probeResult.elapsedMs}ms`}
                {probeResult.requestId
                  ? ` · req ${probeResult.requestId}`
                  : ""}
                {probeResult.meta
                  ? ` · ${probeResult.meta.source} · ${probeResult.meta.tenantDomain}`
                  : ""}
              </p>
              <JsonBlock
                value={
                  probeResult.ok
                    ? probeResult.data
                    : {
                        code: probeResult.code,
                        message: probeResult.message,
                        status: probeResult.status,
                        details: probeResult.data,
                      }
                }
              />
            </div>
          ) : null}
        </section>
      ) : null}

      <section className={`${dashCardPad} text-sm text-black/60`}>
        <p className="m-0 font-semibold text-ink">Права ключа в FCargo</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            <code className="text-xs">pricing:read</code>,{" "}
            <code className="text-xs">orders:create</code>
          </li>
          <li>
            <code className="text-xs">orders:read</code>,{" "}
            <code className="text-xs">packages:read</code>,{" "}
            <code className="text-xs">packages:track</code>
          </li>
          <li>
            желательно <code className="text-xs">locations:read</code>,{" "}
            <code className="text-xs">statuses:read</code>
          </li>
        </ul>
      </section>
    </div>
  );
}
