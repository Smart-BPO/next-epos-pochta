"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { getWebAppCopy } from "@/data/webapp-copy";
import { useTelegram } from "@/components/webapp/TelegramProvider";
import type { WebAppContactSession } from "@/lib/webapp/session";
import { isValidUzPhone, normalizePhone } from "@/lib/form/utils";
import { fieldLabel } from "@/styles/ui";

type Linked = {
  id: string;
  phone: string;
  displayName: string | null;
};

type Step = "loading" | "idle" | "code" | "linked";

export function FcargoLinkCard({
  contact,
  onLinkedChange,
}: {
  contact: WebAppContactSession | null;
  onLinkedChange?: (linked: Linked | null) => void;
}) {
  const { locale, initData } = useTelegram();
  const copy = getWebAppCopy(locale);
  const [step, setStep] = useState<Step>("loading");
  const [linked, setLinked] = useState<Linked | null>(null);
  const [phone, setPhone] = useState(contact?.phone ?? "");
  const [challenge, setChallenge] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [seedPhone, setSeedPhone] = useState(contact?.phone ?? "");
  if ((contact?.phone ?? "") !== seedPhone) {
    setSeedPhone(contact?.phone ?? "");
    if (contact?.phone && !phone) setPhone(contact.phone);
  }

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!initData) {
        setStep("idle");
        return;
      }
      try {
        const res = await fetch("/api/account/me/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ initData }),
        });
        const json = (await res.json()) as { linked?: Linked | null };
        if (cancelled) return;
        if (json.linked) {
          setLinked(json.linked);
          setStep("linked");
          onLinkedChange?.(json.linked);
        } else {
          setLinked(null);
          setStep("idle");
          onLinkedChange?.(null);
        }
      } catch {
        if (!cancelled) {
          setStep("idle");
          onLinkedChange?.(null);
        }
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
    // Intentionally omit onLinkedChange — parent may pass unstable callback.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initData]);

  const mapError = (codeName?: string) => {
    if (codeName === "no_customer_card") return copy.fcargoNoCustomer;
    if (codeName === "rate_limited") return copy.fcargoRateLimited;
    if (codeName === "invalid_input" || codeName === "invalid_code") {
      return copy.fcargoInvalidCode;
    }
    return copy.fcargoError;
  };

  const startOtp = async () => {
    if (!isValidUzPhone(phone)) {
      setError(copy.invalidPhone);
      return;
    }
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/account/otp/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: normalizePhone(phone),
          initData,
        }),
      });
      const json = (await res.json()) as {
        challenge?: string;
        error?: string;
      };
      if (!res.ok || !json.challenge) {
        setError(mapError(json.error));
        return;
      }
      setChallenge(json.challenge);
      setCode("");
      setStep("code");
    } catch {
      setError(copy.fcargoError);
    } finally {
      setBusy(false);
    }
  };

  const verifyOtp = async () => {
    if (!/^\d{6}$/.test(code.trim())) {
      setError(copy.fcargoInvalidCode);
      return;
    }
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/account/otp/verify/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: normalizePhone(phone),
          challenge,
          code: code.trim(),
          initData,
        }),
      });
      const json = (await res.json()) as {
        linked?: Linked;
        error?: string;
      };
      if (!res.ok || !json.linked) {
        setError(mapError(json.error));
        return;
      }
      setLinked(json.linked);
      setStep("linked");
      onLinkedChange?.(json.linked);
    } catch {
      setError(copy.fcargoError);
    } finally {
      setBusy(false);
    }
  };

  const resend = async () => {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/account/otp/resend/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: normalizePhone(phone),
          challenge,
          initData,
        }),
      });
      const json = (await res.json()) as {
        challenge?: string;
        error?: string;
      };
      if (!res.ok) {
        setError(mapError(json.error));
        return;
      }
      if (json.challenge) setChallenge(json.challenge);
    } catch {
      setError(copy.fcargoError);
    } finally {
      setBusy(false);
    }
  };

  const unlink = async () => {
    setBusy(true);
    setError("");
    try {
      await fetch("/api/account/logout/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ initData }),
      });
      setLinked(null);
      setStep("idle");
      setChallenge("");
      setCode("");
      onLinkedChange?.(null);
    } catch {
      setError(copy.fcargoError);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-3xl border border-black/10 bg-white p-4 shadow-[0_8px_28px_rgb(15_18_24/0.05)]">
      <h2 className="m-0 text-sm font-semibold uppercase tracking-wide text-ink">
        {copy.fcargoLinkTitle}
      </h2>
      <p className="m-0 mt-1 text-sm text-black/55">{copy.fcargoLinkLead}</p>

      {step === "loading" ? (
        <p className="m-0 mt-3 text-sm text-black/40">{copy.loading}</p>
      ) : null}

      {step === "linked" && linked ? (
        <div className="mt-3 grid gap-2">
          <p className="m-0 text-sm font-medium text-ink">
            {linked.displayName || linked.phone}
          </p>
          <p className="m-0 text-sm text-black/55">{linked.phone}</p>
          <p className="m-0 text-xs text-emerald-700">{copy.fcargoLinked}</p>
          <Button
            type="button"
            variant="secondary"
            width="full"
            disabled={busy}
            onClick={() => void unlink()}
          >
            {copy.fcargoUnlink}
          </Button>
        </div>
      ) : null}

      {step === "idle" ? (
        <div className="mt-3 grid gap-3">
          <label className="grid gap-1">
            <span className={fieldLabel}>{copy.phoneLabel}</span>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={copy.phonePlaceholder}
              inputMode="tel"
              autoComplete="tel"
            />
          </label>
          <Button
            type="button"
            width="full"
            disabled={busy || !contact}
            onClick={() => void startOtp()}
          >
            {copy.fcargoSendCode}
          </Button>
          {!contact ? (
            <p className="m-0 text-xs text-black/45">{copy.contactRequired}</p>
          ) : null}
        </div>
      ) : null}

      {step === "code" ? (
        <div className="mt-3 grid gap-3">
          <label className="grid gap-1">
            <span className={fieldLabel}>{copy.fcargoCodeLabel}</span>
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="______"
            />
          </label>
          <Button
            type="button"
            width="full"
            disabled={busy}
            onClick={() => void verifyOtp()}
          >
            {copy.fcargoVerify}
          </Button>
          <Button
            type="button"
            variant="secondary"
            width="full"
            disabled={busy}
            onClick={() => void resend()}
          >
            {copy.fcargoResend}
          </Button>
        </div>
      ) : null}

      {error ? (
        <p className="m-0 mt-3 text-sm text-primary" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
