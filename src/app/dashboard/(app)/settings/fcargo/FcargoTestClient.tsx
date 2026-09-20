"use client";

import { useState, useTransition } from "react";
import { toast } from "react-toastify";
import { useDashT } from "@/components/dashboard/DashLocaleProvider";
import {
  dashBtnSecondary,
  dashCardPad,
  dashInput,
  dashSectionTitle,
} from "@/styles/dashboard";
import {
  debugFcargoProbeAction,
  type FcargoDebugProbeResult,
} from "./actions";

function JsonBlock({ value }: { value: unknown }) {
  return (
    <pre className="m-0 max-h-80 overflow-auto rounded-lg bg-black/[0.04] p-3 text-[11px] leading-relaxed text-ink">
      {JSON.stringify(value, null, 2)}
    </pre>
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

  function submitProbe(form: HTMLFormElement) {
    const formData = new FormData(form);
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
            <form
              key={probe}
              onSubmit={(e) => {
                e.preventDefault();
                submitProbe(e.currentTarget);
              }}
            >
              <input type="hidden" name="probe" value={probe} />
              <button type="submit" className={dashBtnSecondary} disabled={busy}>
                {label}
              </button>
            </form>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            submitProbe(e.currentTarget);
          }}
          className="grid gap-2 rounded-xl border border-black/[0.06] p-3 sm:grid-cols-[1fr_1fr_6rem_auto]"
        >
          <input type="hidden" name="probe" value="pricing" />
          <label className="grid gap-1 text-[10px] font-semibold uppercase tracking-wide text-black/40">
            {f.pricingFrom}
            <input
              name="from_region_id"
              defaultValue="1726"
              className={dashInput}
              disabled={busy}
            />
          </label>
          <label className="grid gap-1 text-[10px] font-semibold uppercase tracking-wide text-black/40">
            {f.pricingTo}
            <input
              name="to_region_id"
              defaultValue="1718"
              className={dashInput}
              disabled={busy}
            />
          </label>
          <label className="grid gap-1 text-[10px] font-semibold uppercase tracking-wide text-black/40">
            {f.pricingKg}
            <input
              name="weight"
              defaultValue="1"
              className={dashInput}
              disabled={busy}
            />
          </label>
          <div className="flex items-end">
            <button type="submit" className={dashBtnSecondary} disabled={busy}>
              {f.pricingRun}
            </button>
          </div>
        </form>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            submitProbe(e.currentTarget);
          }}
          className="grid gap-2 rounded-xl border border-black/[0.06] p-3 sm:grid-cols-[1fr_auto]"
        >
          <input type="hidden" name="probe" value="track" />
          <label className="grid gap-1 text-[10px] font-semibold uppercase tracking-wide text-black/40">
            {f.trackLabel}
            <input
              name="tracking"
              placeholder={f.trackLabel}
              className={dashInput}
              disabled={busy}
            />
          </label>
          <div className="flex items-end">
            <button type="submit" className={dashBtnSecondary} disabled={busy}>
              {f.trackRun}
            </button>
          </div>
        </form>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            submitProbe(e.currentTarget);
          }}
          className="grid gap-2 rounded-xl border border-black/[0.06] p-3 sm:grid-cols-[1fr_auto]"
        >
          <input type="hidden" name="probe" value="order" />
          <label className="grid gap-1 text-[10px] font-semibold uppercase tracking-wide text-black/40">
            {f.orderId}
            <input
              name="order_id"
              placeholder={f.orderId}
              className={dashInput}
              disabled={busy}
            />
          </label>
          <div className="flex items-end">
            <button type="submit" className={dashBtnSecondary} disabled={busy}>
              {f.orderRun}
            </button>
          </div>
        </form>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            submitProbe(e.currentTarget);
          }}
          className="grid gap-2 rounded-xl border border-black/[0.06] p-3 sm:grid-cols-[1fr_auto]"
        >
          <input type="hidden" name="probe" value="resolve" />
          <label className="grid gap-1 text-[10px] font-semibold uppercase tracking-wide text-black/40">
            {f.regionCode}
            <input
              name="soato"
              defaultValue="1726"
              className={dashInput}
              disabled={busy}
            />
          </label>
          <div className="flex items-end">
            <button type="submit" className={dashBtnSecondary} disabled={busy}>
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
    </div>
  );
}
