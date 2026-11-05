"use client";

import { useEffect, useRef, useState } from "react";
import {
  FileText,
  MapPinned,
  Package,
} from "lucide-react";
import type { Locale } from "@/i18n/config";
import { accountCopy } from "@/data/account-copy";
import { etaHoursLabel } from "@/data/delivery-routes";
import { Button } from "@/components/atoms/Button";
import { Input, Textarea } from "@/components/atoms/Input";
import { SettlementSelect } from "@/components/atoms/SettlementSelect";
import { getSettlementById, settlementLabel } from "@/data/settlements";
import { createRequestId, isValidUzPhone, normalizePhone } from "@/lib/form/utils";
import { fetchEstimate } from "@/lib/pricing/client";
import {
  formatUzs,
  type QuoteEstimate,
} from "@/lib/pricing/estimate";
import { cn } from "@/lib/cn";
import { controlCheckbox, fieldLabel } from "@/styles/ui";
import {
  accountAuthBody,
  type AccountAuthMode,
} from "@/components/account/types";

export type AccountShipmentPrefill = {
  from?: string;
  to?: string;
  weight?: string;
  length?: string;
  width?: string;
  height?: string;
};

const card =
  "rounded-[var(--dash-radius,1rem)] border border-[var(--dash-border,rgb(0_0_0/0.08))] bg-[var(--dash-surface,#fff)] shadow-[var(--dash-shadow,0_1px_2px_rgb(0_0_0/0.04))]";

function SectionTitle({
  icon: Icon,
  children,
}: {
  icon: typeof MapPinned;
  children: React.ReactNode;
}) {
  return (
    <h2 className="m-0 mb-4 flex items-center gap-2 text-sm font-semibold text-ink">
      <Icon className="size-4 text-primary" strokeWidth={1.75} aria-hidden />
      {children}
    </h2>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn(fieldLabel, "block", className)}>
      {label}
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

function parsePositive(raw: string): number | null {
  const n = Number(String(raw).replace(",", "."));
  return Number.isFinite(n) && n > 0 ? n : null;
}

export function AccountShipmentForm({
  locale,
  auth,
  prefill,
  onSuccess,
}: {
  locale: Locale;
  auth: AccountAuthMode;
  prefill?: AccountShipmentPrefill | null;
  onSuccess: (trackingNumber: string) => void;
}) {
  const c = accountCopy(locale);
  const [from, setFrom] = useState(() => {
    const raw = prefill?.from ?? "";
    return raw ? (getSettlementById(raw)?.id ?? raw) : "";
  });
  const [to, setTo] = useState(() => {
    const raw = prefill?.to ?? "";
    return raw ? (getSettlementById(raw)?.id ?? raw) : "";
  });
  const [receiverName, setReceiverName] = useState("");
  const [receiverPhone, setReceiverPhone] = useState("");
  const [weight, setWeight] = useState(prefill?.weight ?? "1");
  const [length, setLength] = useState(prefill?.length ?? "20");
  const [width, setWidth] = useState(prefill?.width ?? "15");
  const [height, setHeight] = useState(prefill?.height ?? "10");
  const [comment, setComment] = useState("");
  const [declaredValue, setDeclaredValue] = useState("");
  const [fragile, setFragile] = useState(false);
  const [payerType, setPayerType] = useState<"sender" | "receiver">("sender");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [estimate, setEstimate] = useState<QuoteEstimate | null>(null);
  const [estimating, setEstimating] = useState(false);
  const [estimateError, setEstimateError] = useState(false);
  const requestIdRef = useRef<string | null>(null);
  const quoteSeq = useRef(0);

  const weightKg = parsePositive(weight);
  const lengthCm = parsePositive(length);
  const widthCm = parsePositive(width);
  const heightCm = parsePositive(height);
  const fromMeta = from ? getSettlementById(from) : undefined;
  const toMeta = to ? getSettlementById(to) : undefined;
  const canEstimate = Boolean(
    fromMeta && toMeta && fromMeta.id !== toMeta.id && weightKg,
  );

  useEffect(() => {
    if (!canEstimate || !fromMeta || !toMeta || !weightKg) {
      quoteSeq.current += 1;
      setEstimate(null);
      setEstimating(false);
      setEstimateError(false);
      return;
    }

    const fromRegionId = fromMeta.regionId;
    const fromCityId = fromMeta.id;
    const toRegionId = toMeta.regionId;
    const toCityId = toMeta.id;
    const seq = ++quoteSeq.current;
    setEstimating(true);
    setEstimateError(false);
    const timer = window.setTimeout(() => {
      void (async () => {
        const next = await fetchEstimate({
          fromRegionId,
          fromCityId,
          toRegionId,
          toCityId,
          weightKg,
          lengthCm,
          widthCm,
          heightCm,
          unknownDims: !(lengthCm && widthCm && heightCm),
          pickup: false,
          doorDelivery: false,
          places: 1,
          urgent: false,
        });
        if (seq !== quoteSeq.current) return;
        setEstimating(false);
        if (!next) {
          setEstimate(null);
          setEstimateError(true);
          return;
        }
        setEstimate(next);
        setEstimateError(false);
      })();
    }, 350);

    return () => {
      window.clearTimeout(timer);
    };
  }, [canEstimate, from, to, weightKg, lengthCm, widthCm, heightCm, fromMeta, toMeta]);

  const etaLabel = estimate
    ? estimate.etaHours
      ? etaHoursLabel(locale, estimate.etaHours)
      : `${estimate.etaDays} ${locale === "ru" ? "дн." : locale === "zh" ? "天" : "kun"}`
    : null;

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!from || !to) {
      setError(c.required);
      return;
    }
    if (from === to) {
      setError(c.sameRoute);
      return;
    }
    if (!receiverName.trim()) {
      setError(c.required);
      return;
    }
    if (!isValidUzPhone(receiverPhone)) {
      setError(c.invalidPhone);
      return;
    }

    setBusy(true);
    setError(null);
    try {
      if (!requestIdRef.current) {
        requestIdRef.current = createRequestId("acct");
      }
      const res = await fetch("/api/account/shipment/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          accountAuthBody(auth, {
            locale,
            fromSettlementId: from,
            toSettlementId: to,
            fromLabel: fromMeta ? settlementLabel(fromMeta, locale) : "",
            toLabel: toMeta ? settlementLabel(toMeta, locale) : "",
            weightKg: weight,
            lengthCm: length,
            widthCm: width,
            heightCm: height,
            comment,
            receiverName: receiverName.trim(),
            receiverPhone: normalizePhone(receiverPhone),
            requestId: requestIdRef.current,
            declaredValue: declaredValue || undefined,
            isFragile: fragile,
            payerType,
          }),
        ),
      });
      const json = (await res.json()) as {
        trackingNumber?: string;
        error?: string;
      };
      if (!res.ok || !json.trackingNumber) {
        setError(
          json.error === "receiver_required" || json.error === "route_required"
            ? c.required
            : json.error === "same_route"
              ? c.sameRoute
              : c.genericError,
        );
        return;
      }
      requestIdRef.current = null;
      onSuccess(json.trackingNumber);
    } catch {
      setError(c.genericError);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="flex w-full flex-col gap-4 sm:gap-5">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-5">
        <section className={`${card} p-4 sm:p-5`}>
          <SectionTitle icon={MapPinned}>{c.sectionRoute}</SectionTitle>
          <div className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={c.fromLabel}>
                <SettlementSelect
                  instanceId="account-from"
                  locale={locale}
                  value={from}
                  onChange={setFrom}
                  placeholder={c.settlementPlaceholder}
                />
              </Field>
              <Field label={c.toLabel}>
                <SettlementSelect
                  instanceId="account-to"
                  locale={locale}
                  value={to}
                  onChange={setTo}
                  placeholder={c.settlementPlaceholder}
                />
              </Field>
            </div>
            <Field label={c.receiverName}>
              <Input
                value={receiverName}
                onChange={(e) => setReceiverName(e.target.value)}
                autoComplete="name"
                placeholder={c.receiverNamePlaceholder}
              />
            </Field>
            <Field label={c.receiverPhone}>
              <Input
                value={receiverPhone}
                onChange={(e) => setReceiverPhone(e.target.value)}
                inputMode="tel"
                autoComplete="tel"
                placeholder={c.receiverPhonePlaceholder}
              />
            </Field>
          </div>
        </section>

        <section className={`${card} p-4 sm:p-5`}>
          <SectionTitle icon={Package}>{c.sectionParcel}</SectionTitle>
          <div className="grid gap-4">
            <Field label={c.weightLabel}>
              <Input
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                inputMode="decimal"
              />
            </Field>
            <fieldset className="m-0 border-0 p-0">
              <legend className={fieldLabel}>{c.dimsLabel}</legend>
              <div className="mt-1.5 grid grid-cols-3 gap-2">
                {(
                  [
                    [length, setLength, c.dimLength],
                    [width, setWidth, c.dimWidth],
                    [height, setHeight, c.dimHeight],
                  ] as const
                ).map(([value, setValue, label]) => (
                  <label key={label} className="block text-[0.7rem] text-black/45">
                    {label}
                    <Input
                      className="mt-1"
                      value={value}
                      onChange={(e) => setValue(e.target.value)}
                      inputMode="decimal"
                      aria-label={label}
                    />
                  </label>
                ))}
              </div>
            </fieldset>
            <Field label={c.declaredValue}>
              <div className="relative">
                <Input
                  value={declaredValue}
                  onChange={(e) => setDeclaredValue(e.target.value)}
                  inputMode="decimal"
                  className="pr-14"
                />
                <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-black/40">
                  {c.currencySuffix}
                </span>
              </div>
            </Field>
            <label className="inline-flex items-center gap-2.5 text-sm text-ink">
              <input
                type="checkbox"
                checked={fragile}
                onChange={(e) => setFragile(e.target.checked)}
                className={controlCheckbox}
              />
              {c.fragile}
            </label>
          </div>
        </section>
      </div>

      <section className={`${card} p-4 sm:p-5`}>
        <SectionTitle icon={FileText}>{c.sectionPayment}</SectionTitle>
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,22rem)] lg:items-start">
          <div className="grid gap-4">
            <fieldset className="m-0 border-0 p-0">
              <legend className={fieldLabel}>{c.payerQuestion}</legend>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {(
                  [
                    ["sender", c.payerSender],
                    ["receiver", c.payerReceiver],
                  ] as const
                ).map(([value, label]) => {
                  const active = payerType === value;
                  return (
                    <label
                      key={value}
                      className={cn(
                        "flex cursor-pointer items-center gap-2.5 rounded-xl border px-3.5 py-3 text-sm transition",
                        active
                          ? "border-primary/40 bg-primary-soft/50 text-ink"
                          : "border-black/10 bg-white text-black/70 hover:border-black/20",
                      )}
                    >
                      <input
                        type="radio"
                        name="payer"
                        className="accent-[var(--color-primary)]"
                        checked={active}
                        onChange={() => setPayerType(value)}
                      />
                      {label}
                    </label>
                  );
                })}
              </div>
            </fieldset>
            <Field label={c.commentLabel}>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                placeholder={c.commentPlaceholder}
              />
            </Field>
          </div>

          <div className="rounded-xl border border-black/[0.08] bg-black/[0.02] px-4 py-3.5">
            <p className="m-0 text-[0.7rem] font-semibold uppercase tracking-wide text-black/45">
              {c.estimateLabel}
            </p>
            {!canEstimate ? (
              <p className="mt-2 mb-0 text-sm text-black/50">{c.estimateHint}</p>
            ) : estimating ? (
              <p className="mt-2 mb-0 text-sm text-black/50">{c.estimateLoading}</p>
            ) : estimateError ? (
              <p className="mt-2 mb-0 text-sm text-primary">{c.estimateFailed}</p>
            ) : estimate ? (
              <div className="mt-2">
                <p className="m-0 font-display text-2xl font-semibold tabular-nums text-ink">
                  {formatUzs(estimate.amount, locale)}{" "}
                  <span className="text-base font-medium text-black/50">
                    {c.currencySuffix}
                  </span>
                </p>
                {etaLabel ? (
                  <p className="mt-1 mb-0 text-sm text-black/55">
                    {c.estimateEta}: {etaLabel}
                  </p>
                ) : null}
              </div>
            ) : (
              <p className="mt-2 mb-0 text-sm text-black/50">{c.estimateHint}</p>
            )}
          </div>
        </div>
      </section>

      {error ? (
        <p className="m-0 text-sm text-primary" role="alert">
          {error}
        </p>
      ) : null}

      <div className="flex justify-end">
        <Button type="submit" disabled={busy} className="w-full sm:w-auto">
          {c.submitShipment}
        </Button>
      </div>
    </form>
  );
}
