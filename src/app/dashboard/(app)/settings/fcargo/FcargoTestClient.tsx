"use client";

import { useRef, useState, useTransition } from "react";
import { toast } from "react-toastify";
import { useDashT } from "@/components/dashboard/DashLocaleProvider";
import {
  dashBtnSecondary,
  dashCardPad,
  dashInput,
  dashSectionTitle,
} from "@/styles/dashboard";
import type { FcargoDebugProbeResult } from "@/lib/fcargo/probe";

function JsonBlock({ value }: { value: unknown }) {
  return (
    <pre className="m-0 max-h-80 overflow-auto rounded-lg bg-black/[0.04] p-3 text-[11px] leading-relaxed text-ink">
      {JSON.stringify(value, null, 2)}
    </pre>
  );
}

async function postProbe(
  formData: FormData,
): Promise<FcargoDebugProbeResult> {
  const res = await fetch("/api/dashboard/fcargo/probe/", {
    method: "POST",
    body: formData,
    credentials: "same-origin",
  });
  const json = (await res.json().catch(() => null)) as
    | FcargoDebugProbeResult
    | { error?: string; message?: string }
    | null;
  if (!json || typeof json !== "object") {
    throw new Error(
      res.status === 404 ? "probe_endpoint_missing" : "probe_failed",
    );
  }
  if ("ok" in json && typeof json.ok === "boolean") {
    return json;
  }
  throw new Error(
    ("message" in json && json.message) ||
      ("error" in json && json.error) ||
      `HTTP ${res.status}`,
  );
}

export function FcargoTestClient({
  canEdit,
  configured,
}: {
  canEdit: boolean;
  configured: boolean;
}) {
  const t = useDashT();
  const f = t.fcargo;
  const [pending, startTransition] = useTransition();
  const [probeResult, setProbeResult] = useState<FcargoDebugProbeResult | null>(
    null,
  );

  const fromRef = useRef<HTMLInputElement>(null);
  const toRef = useRef<HTMLInputElement>(null);
  const weightRef = useRef<HTMLInputElement>(null);
  const lengthRef = useRef<HTMLInputElement>(null);
  const widthRef = useRef<HTMLInputElement>(null);
  const heightRef = useRef<HTMLInputElement>(null);
  const trackingRef = useRef<HTMLInputElement>(null);
  const orderRef = useRef<HTMLInputElement>(null);
  const soatoRef = useRef<HTMLInputElement>(null);

  function runProbe(formData: FormData) {
    startTransition(async () => {
      try {
        const result = await postProbe(formData);
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

  function onQuickProbe(probe: string) {
    const fd = new FormData();
    fd.set("probe", probe);
    runProbe(fd);
  }

  function onPricing(mode: "both" | "weight" | "dims") {
    const fd = new FormData();
    fd.set("probe", "pricing");
    fd.set("pricing_mode", mode);
    fd.set("from_region_id", fromRef.current?.value ?? "");
    fd.set("to_region_id", toRef.current?.value ?? "");
    fd.set("weight", weightRef.current?.value ?? "");
    fd.set("length", lengthRef.current?.value ?? "");
    fd.set("width", widthRef.current?.value ?? "");
    fd.set("height", heightRef.current?.value ?? "");
    runProbe(fd);
  }

  if (!canEdit) {
    return (
      <p className={`${dashCardPad} m-0 max-w-3xl text-sm text-black/50`}>
        {f.roleDenied}
      </p>
    );
  }

  const busy = pending || !configured;

  return (
    <div className="grid max-w-3xl gap-5">
      <section className={`${dashCardPad} grid gap-4`}>
        <h2 className={dashSectionTitle}>{f.testTitle}</h2>
        <p className="m-0 text-sm text-black/55">{f.testLead}</p>

        {!configured ? (
          <p className="m-0 text-sm text-primary">{f.statusOff}</p>
        ) : null}

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
            <button
              key={probe}
              type="button"
              className={dashBtnSecondary}
              disabled={busy}
              onClick={() => onQuickProbe(probe)}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="grid gap-2 rounded-xl border border-black/[0.06] p-3 sm:grid-cols-2">
          <p className="m-0 sm:col-span-2 text-xs font-semibold uppercase tracking-wide text-black/40">
            {f.pricingSection}
          </p>
          <label className="grid gap-1 text-[10px] font-semibold uppercase tracking-wide text-black/40">
            {f.pricingFrom}
            <input
              ref={fromRef}
              defaultValue="1703"
              className={dashInput}
              disabled={busy}
              title="Region SOATO as integer (Andijon)"
            />
          </label>
          <label className="grid gap-1 text-[10px] font-semibold uppercase tracking-wide text-black/40">
            {f.pricingTo}
            <input
              ref={toRef}
              defaultValue="1706"
              className={dashInput}
              disabled={busy}
              title="Region SOATO as integer (Buxoro)"
            />
          </label>
          <label className="grid gap-1 text-[10px] font-semibold uppercase tracking-wide text-black/40">
            {f.pricingKg}
            <input
              ref={weightRef}
              defaultValue="2.5"
              className={dashInput}
              disabled={busy}
            />
          </label>
          <label className="grid gap-1 text-[10px] font-semibold uppercase tracking-wide text-black/40">
            {f.pricingDims}
            <div className="grid grid-cols-3 gap-1">
              <input
                ref={lengthRef}
                defaultValue="30"
                className={dashInput}
                disabled={busy}
                aria-label="L"
              />
              <input
                ref={widthRef}
                defaultValue="20"
                className={dashInput}
                disabled={busy}
                aria-label="W"
              />
              <input
                ref={heightRef}
                defaultValue="15"
                className={dashInput}
                disabled={busy}
                aria-label="H"
              />
            </div>
          </label>
          <div className="flex flex-wrap gap-2 sm:col-span-2">
            <button
              type="button"
              className={dashBtnSecondary}
              disabled={busy}
              onClick={() => onPricing("both")}
            >
              {f.pricingRunBoth}
            </button>
            <button
              type="button"
              className={dashBtnSecondary}
              disabled={busy}
              onClick={() => onPricing("weight")}
            >
              {f.pricingRunWeight}
            </button>
            <button
              type="button"
              className={dashBtnSecondary}
              disabled={busy}
              onClick={() => onPricing("dims")}
            >
              {f.pricingRunDims}
            </button>
          </div>
        </div>

        <div className="grid gap-2 rounded-xl border border-black/[0.06] p-3 sm:grid-cols-[1fr_auto]">
          <label className="grid gap-1 text-[10px] font-semibold uppercase tracking-wide text-black/40">
            {f.trackLabel}
            <input
              ref={trackingRef}
              placeholder={f.trackLabel}
              className={dashInput}
              disabled={busy}
            />
          </label>
          <div className="flex items-end">
            <button
              type="button"
              className={dashBtnSecondary}
              disabled={busy}
              onClick={() => {
                const fd = new FormData();
                fd.set("probe", "track");
                fd.set("tracking", trackingRef.current?.value ?? "");
                runProbe(fd);
              }}
            >
              {f.trackRun}
            </button>
          </div>
        </div>

        <div className="grid gap-2 rounded-xl border border-black/[0.06] p-3 sm:grid-cols-[1fr_auto]">
          <label className="grid gap-1 text-[10px] font-semibold uppercase tracking-wide text-black/40">
            {f.orderId}
            <input
              ref={orderRef}
              placeholder={f.orderId}
              className={dashInput}
              disabled={busy}
            />
          </label>
          <div className="flex items-end">
            <button
              type="button"
              className={dashBtnSecondary}
              disabled={busy}
              onClick={() => {
                const fd = new FormData();
                fd.set("probe", "order");
                fd.set("order_id", orderRef.current?.value ?? "");
                runProbe(fd);
              }}
            >
              {f.orderRun}
            </button>
          </div>
        </div>

        <div className="grid gap-2 rounded-xl border border-black/[0.06] p-3 sm:grid-cols-[1fr_auto]">
          <label className="grid gap-1 text-[10px] font-semibold uppercase tracking-wide text-black/40">
            {f.regionCode}
            <input
              ref={soatoRef}
              defaultValue="1726"
              className={dashInput}
              disabled={busy}
            />
          </label>
          <div className="flex items-end">
            <button
              type="button"
              className={dashBtnSecondary}
              disabled={busy}
              onClick={() => {
                const fd = new FormData();
                fd.set("probe", "resolve");
                fd.set("soato", soatoRef.current?.value ?? "");
                runProbe(fd);
              }}
            >
              {f.regionRun}
            </button>
          </div>
        </div>

        {probeResult ? (
          <div className="grid gap-2">
            <p className="m-0 text-xs text-black/50">
              {probeResult.ok ? f.probeOk : f.probeFail}
              {` · ${probeResult.probe} · ${probeResult.elapsedMs}ms`}
            </p>
            <JsonBlock
              value={
                probeResult.ok
                  ? { meta: probeResult.meta, data: probeResult.data }
                  : {
                      message: probeResult.message,
                      code: probeResult.code,
                      details: probeResult.data,
                      meta: probeResult.meta,
                    }
              }
            />
          </div>
        ) : null}
      </section>
    </div>
  );
}
