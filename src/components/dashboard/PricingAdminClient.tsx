"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "react-toastify";
import { useDashT } from "@/components/dashboard/DashLocaleProvider";
import {
  uzbekistanHubSettlements,
  settlementLabel,
} from "@/data/settlements";
import { estimateQuote, formatUzs } from "@/lib/pricing/estimate";
import {
  DEFAULT_PRICING_CONFIG,
  type EstimateZone,
  type PricingConfig,
  type PricingDimLimit,
  type PricingRouteOverride,
} from "@/lib/pricing/types";
import {
  dashBtnPrimary,
  dashBtnSecondary,
  dashCardPad,
  dashInput,
} from "@/styles/dashboard";
import { resetPricingAction, savePricingAction } from "@/app/dashboard/(app)/pricing/actions";
import { PricingMatrixPanel } from "@/components/dashboard/PricingMatrixPanel";
import { PricingRevisionsPanel } from "@/components/dashboard/PricingRevisionsPanel";
import Link from "next/link";

const ZONES: EstimateZone[] = ["same_city", "same_region", "inter_region"];

function NumField({
  label,
  value,
  onChange,
  step = 1,
  disabled,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  step?: number;
  disabled?: boolean;
}) {
  return (
    <label className="grid gap-1.5 text-xs font-semibold uppercase tracking-wide text-black/40">
      {label}
      <input
        type="number"
        step={step}
        value={Number.isFinite(value) ? value : 0}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        className={`${dashInput} font-normal normal-case`}
      />
    </label>
  );
}

function LimitFields({
  title,
  value,
  onChange,
  disabled,
}: {
  title: string;
  value: PricingDimLimit;
  onChange: (next: PricingDimLimit) => void;
  disabled?: boolean;
}) {
  return (
    <div className="rounded-xl border border-black/8 bg-[#fafafa] p-3">
      <p className="m-0 mb-2 text-xs font-semibold text-ink">{title}</p>
      <div className="grid gap-2 sm:grid-cols-4">
        {(
          [
            ["min", value.min],
            ["max", value.max],
            ["step", value.step],
            ["default", value.default],
          ] as const
        ).map(([key, v]) => (
          <NumField
            key={key}
            label={key}
            value={v}
            step={key === "step" || title.includes("kg") ? 0.1 : 1}
            disabled={disabled}
            onChange={(n) => onChange({ ...value, [key]: n })}
          />
        ))}
      </div>
    </div>
  );
}

export function PricingAdminClient({
  initialEnabled,
  initialConfig,
  formulaVersion,
  canWrite,
  initialRoutes = [],
  revisions = [],
}: {
  initialEnabled: boolean;
  initialConfig: PricingConfig;
  formulaVersion: string;
  canWrite: boolean;
  initialRoutes?: PricingRouteOverride[];
  revisions?: Array<{
    id: number;
    created_at: string;
    label: string;
    kind: string;
    snapshot?: { routes?: unknown[]; formulaVersion?: string };
  }>;
}) {
  const t = useDashT();
  const p = t.pricing;
  const [tab, setTab] = useState<"zones" | "matrix" | "history">("zones");
  const [enabled, setEnabled] = useState(initialEnabled);
  const [config, setConfig] = useState<PricingConfig>(() =>
    structuredClone(initialConfig),
  );
  const [previewWeight, setPreviewWeight] = useState(1);
  const [previewFrom, setPreviewFrom] = useState("samarkand_city");
  const [previewTo, setPreviewTo] = useState("tashkent_city");
  const [pending, startTransition] = useTransition();

  const zoneLabel = (z: EstimateZone) => {
    if (z === "same_city") return p.zoneSameCity;
    if (z === "same_region") return p.zoneSameRegion;
    return p.zoneInterRegion;
  };

  const preview = useMemo(() => {
    const from = uzbekistanHubSettlements.find((s) => s.id === previewFrom);
    const to = uzbekistanHubSettlements.find((s) => s.id === previewTo);
    if (!from || !to) return null;
    return estimateQuote(
      {
        fromRegionId: from.regionId,
        fromCityId: from.id,
        toRegionId: to.regionId,
        toCityId: to.id,
        weightKg: previewWeight > 0 ? previewWeight : 1,
        lengthCm: 20,
        widthCm: 15,
        heightCm: 10,
        unknownDims: false,
        pickup: false,
        doorDelivery: false,
        places: 1,
        urgent: false,
        category: "parcel",
      },
      config,
      formulaVersion,
    );
  }, [config, formulaVersion, previewFrom, previewTo, previewWeight]);

  const save = () => {
    startTransition(async () => {
      try {
        await savePricingAction({ enabled, config });
        toast.success(p.saved);
      } catch {
        toast.error(t.errors.saveFailed);
      }
    });
  };

  const reset = () => {
    if (!confirm(p.resetDefaults + "?")) return;
    startTransition(async () => {
      try {
        await resetPricingAction();
        setEnabled(true);
        setConfig(structuredClone(DEFAULT_PRICING_CONFIG));
        toast.success(p.saved);
      } catch {
        toast.error(t.errors.saveFailed);
      }
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        {(
          [
            ["zones", "Зоны"],
            ["matrix", "Матрица хабов"],
            ["history", "История"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={
              tab === id
                ? dashBtnPrimary
                : `${dashBtnSecondary} !bg-white`
            }
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
        <Link href="/dashboard/pricing/book/" className={`${dashBtnSecondary} !bg-white`}>
          Справочник →
        </Link>
      </div>

      {tab === "matrix" ? (
        <PricingMatrixPanel
          initialRoutes={initialRoutes}
          config={config}
          formulaVersion={formulaVersion}
          canWrite={canWrite}
        />
      ) : null}

      {tab === "history" ? (
        <PricingRevisionsPanel
          revisions={revisions}
          draftEnabled={enabled}
          draftConfig={config}
          canWrite={canWrite}
        />
      ) : null}

      {tab === "zones" ? (
    <div className="space-y-5">
      <div className={`${dashCardPad} space-y-3`}>
        <p className="m-0 text-sm text-black/55">{p.disclaimer}</p>
        <label className="flex items-center gap-2 text-sm font-medium text-ink">
          <input
            type="checkbox"
            checked={enabled}
            disabled={!canWrite}
            onChange={(e) => setEnabled(e.target.checked)}
          />
          {p.enabled}
        </label>
        <p className="m-0 text-xs text-black/40">
          {p.formulaVersion}: <code>{formulaVersion}</code>
        </p>
      </div>

      <section className={`${dashCardPad} space-y-4`}>
        <h2 className="m-0 text-[0.95rem] font-semibold text-ink">
          {p.zonesTitle}
        </h2>
        {ZONES.map((zone) => (
          <div
            key={zone}
            className="grid gap-2 rounded-xl border border-black/8 p-3 sm:grid-cols-5"
          >
            <p className="m-0 text-sm font-semibold text-ink sm:col-span-5">
              {zoneLabel(zone)}
            </p>
            <NumField
              label={p.base}
              value={config.zones[zone].base}
              disabled={!canWrite}
              onChange={(n) =>
                setConfig((c) => ({
                  ...c,
                  zones: {
                    ...c.zones,
                    [zone]: { ...c.zones[zone], base: n },
                  },
                }))
              }
            />
            <NumField
              label={p.perKg}
              value={config.zones[zone].perKg}
              disabled={!canWrite}
              onChange={(n) =>
                setConfig((c) => ({
                  ...c,
                  zones: {
                    ...c.zones,
                    [zone]: { ...c.zones[zone], perKg: n },
                  },
                }))
              }
            />
            <NumField
              label={p.etaMin}
              value={config.zones[zone].etaMin}
              disabled={!canWrite}
              onChange={(n) =>
                setConfig((c) => ({
                  ...c,
                  zones: {
                    ...c.zones,
                    [zone]: { ...c.zones[zone], etaMin: n },
                  },
                }))
              }
            />
            <NumField
              label={p.etaMax}
              value={config.zones[zone].etaMax}
              disabled={!canWrite}
              onChange={(n) =>
                setConfig((c) => ({
                  ...c,
                  zones: {
                    ...c.zones,
                    [zone]: { ...c.zones[zone], etaMax: n },
                  },
                }))
              }
            />
          </div>
        ))}
      </section>

      <section className={`${dashCardPad} space-y-3`}>
        <h2 className="m-0 text-[0.95rem] font-semibold text-ink">
          {p.surchargesTitle}
        </h2>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <NumField
            label={p.pickup}
            value={config.surcharges.pickup}
            disabled={!canWrite}
            onChange={(n) =>
              setConfig((c) => ({
                ...c,
                surcharges: { ...c.surcharges, pickup: n },
              }))
            }
          />
          <NumField
            label={p.door}
            value={config.surcharges.door}
            disabled={!canWrite}
            onChange={(n) =>
              setConfig((c) => ({
                ...c,
                surcharges: { ...c.surcharges, door: n },
              }))
            }
          />
          <NumField
            label={p.place}
            value={config.surcharges.place}
            disabled={!canWrite}
            onChange={(n) =>
              setConfig((c) => ({
                ...c,
                surcharges: { ...c.surcharges, place: n },
              }))
            }
          />
          <NumField
            label={p.urgentMultiplier}
            value={config.surcharges.urgentMultiplier}
            step={0.01}
            disabled={!canWrite}
            onChange={(n) =>
              setConfig((c) => ({
                ...c,
                surcharges: { ...c.surcharges, urgentMultiplier: n },
              }))
            }
          />
        </div>
      </section>

      <section className={`${dashCardPad} space-y-3`}>
        <h2 className="m-0 text-[0.95rem] font-semibold text-ink">
          {p.categoriesTitle}
        </h2>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {(["documents", "parcel", "goods", "other"] as const).map((key) => (
            <NumField
              key={key}
              label={key}
              value={config.categories[key] ?? 1}
              step={0.01}
              disabled={!canWrite}
              onChange={(n) =>
                setConfig((c) => ({
                  ...c,
                  categories: { ...c.categories, [key]: n },
                }))
              }
            />
          ))}
        </div>
      </section>

      <section className={`${dashCardPad} space-y-3`}>
        <h2 className="m-0 text-[0.95rem] font-semibold text-ink">
          {p.volumetricTitle}
        </h2>
        <label className="flex items-center gap-2 text-sm font-medium text-ink">
          <input
            type="checkbox"
            checked={config.volumetric.enabled}
            disabled={!canWrite}
            onChange={(e) =>
              setConfig((c) => ({
                ...c,
                volumetric: { ...c.volumetric, enabled: e.target.checked },
              }))
            }
          />
          {p.volumetricEnabled}
        </label>
        <div className="max-w-xs">
          <NumField
            label={p.volumetricDivisor}
            value={config.volumetric.divisor}
            disabled={!canWrite}
            onChange={(n) =>
              setConfig((c) => ({
                ...c,
                volumetric: { ...c.volumetric, divisor: n },
              }))
            }
          />
        </div>
      </section>

      <section className={`${dashCardPad} space-y-3`}>
        <h2 className="m-0 text-[0.95rem] font-semibold text-ink">
          {p.limitsTitle}
        </h2>
        <LimitFields
          title="weightKg"
          value={config.limits.weightKg}
          disabled={!canWrite}
          onChange={(next) =>
            setConfig((c) => ({
              ...c,
              limits: { ...c.limits, weightKg: next },
            }))
          }
        />
        <LimitFields
          title="lengthCm"
          value={config.limits.lengthCm}
          disabled={!canWrite}
          onChange={(next) =>
            setConfig((c) => ({
              ...c,
              limits: { ...c.limits, lengthCm: next },
            }))
          }
        />
        <LimitFields
          title="widthCm"
          value={config.limits.widthCm}
          disabled={!canWrite}
          onChange={(next) =>
            setConfig((c) => ({
              ...c,
              limits: { ...c.limits, widthCm: next },
            }))
          }
        />
        <LimitFields
          title="heightCm"
          value={config.limits.heightCm}
          disabled={!canWrite}
          onChange={(next) =>
            setConfig((c) => ({
              ...c,
              limits: { ...c.limits, heightCm: next },
            }))
          }
        />
      </section>

      <section className={`${dashCardPad} space-y-3`}>
        <h2 className="m-0 text-[0.95rem] font-semibold text-ink">
          {p.quickCitiesTitle}
        </h2>
        <div className="flex flex-wrap gap-2">
          {uzbekistanHubSettlements.map((s) => {
            const checked = config.quickCityIds.includes(s.id);
            return (
              <label
                key={s.id}
                className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-white px-2.5 py-1 text-xs font-medium text-ink"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={!canWrite}
                  onChange={(e) => {
                    setConfig((c) => {
                      const set = new Set(c.quickCityIds);
                      if (e.target.checked) set.add(s.id);
                      else set.delete(s.id);
                      return { ...c, quickCityIds: [...set] };
                    });
                  }}
                />
                {settlementLabel(s, "ru")}
              </label>
            );
          })}
        </div>
      </section>

      <section className={`${dashCardPad} space-y-3`}>
        <h2 className="m-0 text-[0.95rem] font-semibold text-ink">
          {p.previewTitle}
        </h2>
        <div className="grid gap-2 sm:grid-cols-3">
          <label className="grid gap-1.5 text-xs font-semibold uppercase tracking-wide text-black/40">
            From
            <select
              value={previewFrom}
              onChange={(e) => setPreviewFrom(e.target.value)}
              className={`${dashInput} font-normal normal-case`}
            >
              {uzbekistanHubSettlements.map((s) => (
                <option key={s.id} value={s.id}>
                  {settlementLabel(s, "ru")}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1.5 text-xs font-semibold uppercase tracking-wide text-black/40">
            To
            <select
              value={previewTo}
              onChange={(e) => setPreviewTo(e.target.value)}
              className={`${dashInput} font-normal normal-case`}
            >
              {uzbekistanHubSettlements.map((s) => (
                <option key={s.id} value={s.id}>
                  {settlementLabel(s, "ru")}
                </option>
              ))}
            </select>
          </label>
          <NumField
            label={p.previewWeight}
            value={previewWeight}
            step={0.5}
            onChange={setPreviewWeight}
          />
        </div>
        {preview ? (
          <p className="m-0 text-sm text-ink">
            {p.previewResult}:{" "}
            <strong>
              {formatUzs(preview.amount, "ru")} {preview.currency}
            </strong>
            {" · "}
            {preview.etaDays} дн. · {preview.zone} · {preview.formulaVersion}
          </p>
        ) : null}
      </section>

      {canWrite ? (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={dashBtnPrimary}
            disabled={pending}
            onClick={save}
          >
            {pending ? t.common.saving : t.common.save}
          </button>
          <button
            type="button"
            className={dashBtnSecondary}
            disabled={pending}
            onClick={reset}
          >
            {p.resetDefaults}
          </button>
        </div>
      ) : null}
    </div>
      ) : null}
    </div>
  );
}
