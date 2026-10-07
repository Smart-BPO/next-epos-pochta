"use client";

import { useRef, useState } from "react";
import { SettlementSelect } from "@/components/atoms/SettlementSelect";
import { Button } from "@/components/atoms/Button";
import { getWebAppCopy } from "@/data/webapp-copy";
import { getSettlementById, settlementLabel } from "@/data/settlements";
import type { WebAppContactSession } from "@/lib/webapp/session";
import type { ShipmentDraft } from "@/components/webapp/WebAppNav";
import { useTelegram } from "@/components/webapp/TelegramProvider";
import { Input, Textarea } from "@/components/atoms/Input";
import { isValidUzPhone, normalizePhone } from "@/lib/form/utils";
import { fieldLabel } from "@/styles/ui";

type ShipmentFormProps = {
  contact: WebAppContactSession;
  initialDraft?: ShipmentDraft | null;
  onSuccess: (shipmentId: string) => void;
  onChangeContact: () => void;
};

export function ShipmentForm({
  contact,
  initialDraft,
  onSuccess,
  onChangeContact,
}: ShipmentFormProps) {
  const { locale, user, webApp, initData } = useTelegram();
  const copy = getWebAppCopy(locale);
  const [from, setFrom] = useState(initialDraft?.from ?? "");
  const [to, setTo] = useState(initialDraft?.to ?? "");
  const [weight, setWeight] = useState(initialDraft?.weight ?? "");
  const [length, setLength] = useState(initialDraft?.length ?? "");
  const [width, setWidth] = useState(initialDraft?.width ?? "");
  const [height, setHeight] = useState(initialDraft?.height ?? "");
  const [comment, setComment] = useState("");
  const [receiverName, setReceiverName] = useState("");
  const [receiverPhone, setReceiverPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  /** Stable across retries of the same form submit. */
  const requestIdRef = useRef<string | null>(null);

  const [appliedDraft, setAppliedDraft] = useState(initialDraft);
  if (appliedDraft !== initialDraft) {
    setAppliedDraft(initialDraft);
    if (initialDraft) {
      setFrom(initialDraft.from);
      setTo(initialDraft.to);
      setWeight(initialDraft.weight);
      setLength(initialDraft.length);
      setWidth(initialDraft.width);
      setHeight(initialDraft.height);
    }
  }

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!from || !to || from === to || !receiverName.trim()) {
      setError(copy.required);
      return;
    }
    if (!isValidUzPhone(receiverPhone)) {
      setError(copy.invalidPhone);
      return;
    }

    setBusy(true);
    setError("");
    try {
      if (!requestIdRef.current) {
        requestIdRef.current =
          typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : `wa-${performance.now().toString(36)}`;
      }
      const fromMeta = getSettlementById(from);
      const toMeta = getSettlementById(to);
      const res = await fetch("/api/webapp/shipment/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: contact.sessionId,
          locale,
          phone: contact.phone,
          telegramUserId: contact.telegramUserId ?? user?.id,
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
          initData,
        }),
      });
      const json = (await res.json()) as {
        ok?: boolean;
        id?: string;
        trackingNumber?: string;
        error?: string;
      };
      if (!res.ok || !json.id) {
        throw new Error(json.error || "submit_failed");
      }
      webApp?.HapticFeedback?.notificationOccurred("success");
      onSuccess(json.trackingNumber || json.id);
    } catch {
      setError(copy.submitError);
      webApp?.HapticFeedback?.notificationOccurred("error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="m-0 text-xs font-medium uppercase tracking-wide text-primary">
              {copy.contactSaved}
            </p>
            <p className="m-0 mt-1 text-sm text-black">
              {contact.firstName}
              {contact.lastName ? ` ${contact.lastName}` : ""} · {contact.phone}
            </p>
          </div>
          <button
            type="button"
            onClick={onChangeContact}
            className="shrink-0 text-xs font-semibold text-primary underline-offset-2 hover:underline"
          >
            {copy.changeContact}
          </button>
        </div>
        <h1 className="m-0 font-display text-2xl font-semibold uppercase tracking-[-0.03em] text-black">
          {copy.shipmentTitle}
        </h1>
        <p className="m-0 text-sm leading-relaxed text-black/60">
          {copy.shipmentLead}
        </p>
      </div>

      <form className="flex flex-col gap-3" onSubmit={onSubmit}>
        <label className="grid gap-1.5">
          <span className={fieldLabel}>{copy.fromLabel}</span>
          <SettlementSelect
            instanceId="webapp-from"
            locale={locale}
            value={from}
            onChange={setFrom}
            placeholder={copy.fromLabel}
            variant="compact"
          />
        </label>
        <label className="grid gap-1.5">
          <span className={fieldLabel}>{copy.toLabel}</span>
          <SettlementSelect
            instanceId="webapp-to"
            locale={locale}
            value={to}
            onChange={setTo}
            placeholder={copy.toLabel}
            variant="compact"
          />
        </label>

        <label className="grid gap-1.5">
          <span className={fieldLabel}>{copy.receiverNameLabel}</span>
          <Input
            value={receiverName}
            onChange={(e) => setReceiverName(e.target.value)}
            placeholder={copy.namePlaceholder}
            autoComplete="name"
          />
        </label>
        <label className="grid gap-1.5">
          <span className={fieldLabel}>{copy.receiverPhoneLabel}</span>
          <Input
            value={receiverPhone}
            onChange={(e) => setReceiverPhone(e.target.value)}
            placeholder={copy.phonePlaceholder}
            inputMode="tel"
            autoComplete="tel"
          />
        </label>

        <label className="grid gap-1.5">
          <span className={fieldLabel}>{copy.weightLabel}</span>
          <Input
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            inputMode="decimal"
            placeholder="1.5"
          />
        </label>

        <fieldset className="m-0 grid gap-2 border-0 p-0">
          <legend className={fieldLabel}>{copy.dimsLabel}</legend>
          <div className="grid grid-cols-3 gap-2">
            <Input
              value={length}
              onChange={(e) => setLength(e.target.value)}
              inputMode="numeric"
              placeholder={copy.lengthLabel}
              aria-label={copy.lengthLabel}
            />
            <Input
              value={width}
              onChange={(e) => setWidth(e.target.value)}
              inputMode="numeric"
              placeholder={copy.widthLabel}
              aria-label={copy.widthLabel}
            />
            <Input
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              inputMode="numeric"
              placeholder={copy.heightLabel}
              aria-label={copy.heightLabel}
            />
          </div>
        </fieldset>

        <label className="grid gap-1.5">
          <span className={fieldLabel}>{copy.commentLabel}</span>
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={copy.commentPlaceholder}
            rows={3}
          />
        </label>

        <p className="m-0 text-xs leading-snug text-black/50">{copy.disclaimer}</p>

        {error ? (
          <p className="m-0 text-sm text-primary" role="alert">
            {error}
          </p>
        ) : null}

        <Button type="submit" variant="primary" width="full" disabled={busy}>
          {copy.submitShipment}
        </Button>
      </form>
    </section>
  );
}
