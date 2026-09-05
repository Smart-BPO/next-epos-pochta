"use client";

import { useState } from "react";
import { getWebAppCopy } from "@/data/webapp-copy";
import { isValidUzPhone, normalizePhone } from "@/lib/form/utils";
import {
  normalizeTelegramPhone,
  requestTelegramContact,
} from "@/lib/webapp/telegram";
import {
  writeContactSession,
  type WebAppContactSession,
} from "@/lib/webapp/session";
import { useTelegram } from "@/components/webapp/TelegramProvider";
import { Button } from "@/components/atoms/Button";
import { fieldControl, fieldLabel } from "@/styles/ui";

type ContactGateProps = {
  onLinked: (session: WebAppContactSession) => void;
};

export function ContactGate({ onLinked }: ContactGateProps) {
  const { locale, isTelegram, user, userSnapshot, initData, webApp } =
    useTelegram();
  const copy = getWebAppCopy(locale);
  const [phone, setPhone] = useState("");
  const [name, setName] = useState(
    [user?.first_name, user?.last_name].filter(Boolean).join(" "),
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const persistContact = async (payload: {
    phone: string;
    firstName: string;
    lastName?: string;
    source: "telegram_contact" | "manual";
  }) => {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/webapp/contact/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: payload.phone,
          firstName: payload.firstName,
          lastName: payload.lastName ?? "",
          locale,
          source: payload.source,
          telegramUser: userSnapshot,
          initData,
        }),
      });
      const json = (await res.json()) as {
        ok?: boolean;
        sessionId?: string;
        phone?: string;
        firstName?: string;
        lastName?: string;
        error?: string;
      };
      if (!res.ok || !json.sessionId || !json.phone) {
        throw new Error(json.error || "submit_failed");
      }

      const session: WebAppContactSession = {
        sessionId: json.sessionId,
        phone: json.phone,
        firstName: json.firstName || payload.firstName,
        lastName: json.lastName || payload.lastName || "",
        telegramUserId: user?.id,
        telegramUsername: user?.username,
        linkedAt: new Date().toISOString(),
        source: payload.source,
      };
      writeContactSession(session);
      webApp?.HapticFeedback?.notificationOccurred("success");
      onLinked(session);
    } catch {
      setError(copy.submitError);
      webApp?.HapticFeedback?.notificationOccurred("error");
    } finally {
      setBusy(false);
    }
  };

  const onShareTelegram = async () => {
    setBusy(true);
    setError("");
    const contact = await requestTelegramContact();
    if (!contact?.phone_number) {
      setBusy(false);
      setError(copy.shareHint);
      return;
    }
    const phoneNorm = normalizeTelegramPhone(contact.phone_number);
    await persistContact({
      phone: phoneNorm,
      firstName: contact.first_name || name || "Telegram",
      lastName: contact.last_name,
      source: "telegram_contact",
    });
  };

  const onManualSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) {
      setError(copy.required);
      return;
    }
    if (!isValidUzPhone(phone)) {
      setError(copy.invalidPhone);
      return;
    }
    await persistContact({
      phone: normalizePhone(phone),
      firstName: name.trim(),
      source: "manual",
    });
  };

  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <h1 className="m-0 font-display text-2xl font-semibold uppercase tracking-[-0.03em] text-black">
          {copy.contactTitle}
        </h1>
        <p className="m-0 text-sm leading-relaxed text-black/60">
          {copy.contactLead}
        </p>
        {!isTelegram ? (
          <p className="m-0 rounded-2xl bg-surface-muted px-3 py-2.5 text-xs leading-snug text-black/55">
            {copy.outsideTelegram}
          </p>
        ) : null}
      </div>

      {isTelegram ? (
        <Button type="button" variant="primary" width="full" disabled={busy} onClick={onShareTelegram}>
          {copy.shareContact}
        </Button>
      ) : null}

      <div className="flex items-center gap-3 text-xs uppercase tracking-wide text-black/35">
        <span className="h-px flex-1 bg-black/10" />
        {copy.orManual}
        <span className="h-px flex-1 bg-black/10" />
      </div>

      <form className="flex flex-col gap-3" onSubmit={onManualSubmit}>
        <label className="grid gap-1.5">
          <span className={fieldLabel}>{copy.nameLabel}</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={copy.namePlaceholder}
            className={fieldControl}
            autoComplete="name"
            required
          />
        </label>
        <label className="grid gap-1.5">
          <span className={fieldLabel}>{copy.phoneLabel}</span>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder={copy.phonePlaceholder}
            className={fieldControl}
            inputMode="tel"
            autoComplete="tel"
            required
          />
        </label>
        {error ? (
          <p className="m-0 text-sm text-primary" role="alert">
            {error}
          </p>
        ) : null}
        <Button
          type="submit"
          variant={isTelegram ? "secondary" : "primary"}
          width="full"
          disabled={busy}
        >
          {copy.saveContact}
        </Button>
      </form>
    </section>
  );
}
