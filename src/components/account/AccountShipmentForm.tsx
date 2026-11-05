"use client";

import { useRef, useState } from "react";
import type { Locale } from "@/i18n/config";
import { accountCopy } from "@/data/account-copy";
import { Button } from "@/components/atoms/Button";
import { Input, Textarea } from "@/components/atoms/Input";
import { SettlementSelect } from "@/components/atoms/SettlementSelect";
import { getSettlementById, settlementLabel } from "@/data/settlements";
import { createRequestId, isValidUzPhone, normalizePhone } from "@/lib/form/utils";
import { fieldLabel } from "@/styles/ui";
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
  const [from, setFrom] = useState(prefill?.from ?? "");
  const [to, setTo] = useState(prefill?.to ?? "");
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
  const requestIdRef = useRef<string | null>(null);

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
      const fromMeta = getSettlementById(from);
      const toMeta = getSettlementById(to);
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
    <form onSubmit={onSubmit} className="space-y-3">
      <label className={fieldLabel}>
        {c.fromLabel}
        <div className="mt-1.5">
          <SettlementSelect
            instanceId="account-from"
            locale={locale}
            value={from}
            onChange={setFrom}
            placeholder={c.fromLabel}
          />
        </div>
      </label>
      <label className={fieldLabel}>
        {c.toLabel}
        <div className="mt-1.5">
          <SettlementSelect
            instanceId="account-to"
            locale={locale}
            value={to}
            onChange={setTo}
            placeholder={c.toLabel}
          />
        </div>
      </label>
      <label className={fieldLabel}>
        {c.receiverName}
        <Input
          className="mt-1.5"
          value={receiverName}
          onChange={(e) => setReceiverName(e.target.value)}
          autoComplete="name"
        />
      </label>
      <label className={fieldLabel}>
        {c.receiverPhone}
        <Input
          className="mt-1.5"
          value={receiverPhone}
          onChange={(e) => setReceiverPhone(e.target.value)}
          inputMode="tel"
          autoComplete="tel"
          placeholder="+998"
        />
      </label>
      <label className={fieldLabel}>
        {c.weightLabel}
        <Input
          className="mt-1.5"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          inputMode="decimal"
        />
      </label>
      <fieldset className="m-0 border-0 p-0">
        <legend className={fieldLabel}>{c.dimsLabel}</legend>
        <div className="mt-1.5 grid grid-cols-3 gap-2">
          <Input value={length} onChange={(e) => setLength(e.target.value)} inputMode="decimal" aria-label="L" />
          <Input value={width} onChange={(e) => setWidth(e.target.value)} inputMode="decimal" aria-label="W" />
          <Input value={height} onChange={(e) => setHeight(e.target.value)} inputMode="decimal" aria-label="H" />
        </div>
      </fieldset>
      <label className={fieldLabel}>
        {c.declaredValue}
        <Input
          className="mt-1.5"
          value={declaredValue}
          onChange={(e) => setDeclaredValue(e.target.value)}
          inputMode="decimal"
        />
      </label>
      <label className="flex items-center gap-2 text-sm text-ink">
        <input
          type="checkbox"
          checked={fragile}
          onChange={(e) => setFragile(e.target.checked)}
        />
        {c.fragile}
      </label>
      <fieldset className="m-0 border-0 p-0">
        <div className="flex flex-wrap gap-3 text-sm">
          <label className="inline-flex items-center gap-2">
            <input
              type="radio"
              name="payer"
              checked={payerType === "sender"}
              onChange={() => setPayerType("sender")}
            />
            {c.payerSender}
          </label>
          <label className="inline-flex items-center gap-2">
            <input
              type="radio"
              name="payer"
              checked={payerType === "receiver"}
              onChange={() => setPayerType("receiver")}
            />
            {c.payerReceiver}
          </label>
        </div>
      </fieldset>
      <label className={fieldLabel}>
        {c.commentLabel}
        <Textarea
          className="mt-1.5"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
        />
      </label>
      <p className="m-0 text-xs text-black/45">{c.disclaimer}</p>
      {error ? (
        <p className="m-0 text-sm text-primary" role="alert">
          {error}
        </p>
      ) : null}
      <Button type="submit" disabled={busy}>
        {c.submitShipment}
      </Button>
    </form>
  );
}
