"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Locale } from "@/i18n/config";
import { localePath } from "@/i18n/paths";
import { accountCopy } from "@/data/account-copy";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { isValidUzPhone, normalizePhone } from "@/lib/form/utils";
import { fieldLabel } from "@/styles/ui";
import {
  accountAuthBody,
  type AccountAuthMode,
  type AccountLinked,
} from "@/components/account/types";

type Step = "loading" | "phone" | "code" | "linked";

export function AccountOtpLink({
  locale,
  auth,
  initialPhone = "",
  onLinkedChange,
  compact = false,
  probe = true,
  hideIntro = false,
  initialError = null,
}: {
  locale: Locale;
  auth: AccountAuthMode;
  initialPhone?: string;
  onLinkedChange?: (linked: AccountLinked | null) => void;
  compact?: boolean;
  /** When false, the parent already checked the session — start at the phone step. */
  probe?: boolean;
  hideIntro?: boolean;
  initialError?: string | null;
}) {
  const c = accountCopy(locale);
  const [step, setStep] = useState<Step>(probe ? "loading" : "phone");
  const [phone, setPhone] = useState(initialPhone);
  const [challenge, setChallenge] = useState("");
  const [code, setCode] = useState("");
  const [linked, setLinked] = useState<AccountLinked | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(initialError);
  const [contactUrl, setContactUrl] = useState<string | null>(null);

  const mapError = (codeName?: string) => {
    if (codeName === "no_customer_card") return c.noCustomer;
    if (codeName === "rate_limited" || codeName === "resend_cooldown") {
      return c.rateLimited;
    }
    if (
      codeName === "fcargo_unavailable" ||
      codeName === "secrets_unavailable" ||
      codeName === "link_store_failed"
    ) {
      return c.serviceUnavailable;
    }
    if (codeName === "relink_required") return c.relinkRequired;
    if (
      codeName === "invalid_input" ||
      codeName === "invalid_code" ||
      codeName === "invalid_challenge" ||
      codeName === "expired_challenge"
    ) {
      return c.invalidCode;
    }
    return c.genericError;
  };

  useEffect(() => {
    if (!probe) return;
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/account/me/", {
          method: auth.kind === "telegram" ? "POST" : "GET",
          headers:
            auth.kind === "telegram"
              ? { "Content-Type": "application/json" }
              : undefined,
          body:
            auth.kind === "telegram"
              ? JSON.stringify(accountAuthBody(auth))
              : undefined,
          cache: "no-store",
        });
        const json = (await res.json()) as {
          linked?: AccountLinked | null;
          error?: string;
        };
        if (cancelled) return;
        if (json.error === "relink_required" || res.status === 401) {
          setLinked(null);
          setStep("phone");
          setError(c.relinkRequired);
          onLinkedChange?.(null);
          return;
        }
        if (json.linked) {
          setLinked(json.linked);
          setStep("linked");
          onLinkedChange?.(json.linked);
        } else {
          setLinked(null);
          setStep("phone");
          onLinkedChange?.(null);
        }
      } catch {
        if (!cancelled) {
          setStep("phone");
          onLinkedChange?.(null);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [probe, auth.kind, auth.kind === "telegram" ? auth.initData : "cookie"]);

  const startOtp = async () => {
    if (!isValidUzPhone(phone)) {
      setError(c.invalidPhone);
      return;
    }
    setBusy(true);
    setError(null);
    setContactUrl(null);
    try {
      const res = await fetch("/api/account/otp/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          accountAuthBody(auth, { phone: normalizePhone(phone) }),
        ),
      });
      const json = (await res.json()) as {
        challenge?: string;
        error?: string;
        contactUrl?: string;
      };
      if (!res.ok) {
        setError(mapError(json.error));
        if (json.contactUrl) setContactUrl(json.contactUrl);
        return;
      }
      setChallenge(json.challenge ?? "");
      setStep("code");
    } catch {
      setError(c.genericError);
    } finally {
      setBusy(false);
    }
  };

  const verify = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/account/otp/verify/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          accountAuthBody(auth, {
            phone: normalizePhone(phone),
            challenge,
            code: code.trim(),
          }),
        ),
      });
      const json = (await res.json()) as {
        linked?: AccountLinked;
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
      setError(c.genericError);
    } finally {
      setBusy(false);
    }
  };

  const resend = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/account/otp/resend/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          accountAuthBody(auth, {
            phone: normalizePhone(phone),
            challenge,
          }),
        ),
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
      setError(c.genericError);
    } finally {
      setBusy(false);
    }
  };

  const logout = async () => {
    setBusy(true);
    try {
      await fetch("/api/account/logout/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(accountAuthBody(auth)),
      });
    } catch {
      // ignore
    } finally {
      setLinked(null);
      setStep("phone");
      setCode("");
      setChallenge("");
      onLinkedChange?.(null);
      setBusy(false);
    }
  };

  if (step === "loading") {
    return <p className="m-0 text-sm text-black/45">{c.refresh}…</p>;
  }

  if (step === "linked" && linked) {
    return (
      <div className={compact ? "space-y-2" : "space-y-3"}>
        <p className="m-0 text-sm text-black/55">{c.linkedAs}</p>
        <p className="m-0 font-display text-lg font-semibold text-ink">
          {linked.displayName || linked.phone}
        </p>
        <p className="m-0 text-sm text-black/55">{linked.phone}</p>
        <Button type="button" variant="ghost" disabled={busy} onClick={logout}>
          {c.logout}
        </Button>
      </div>
    );
  }

  const steps = [
    { id: "phone", label: c.stepPhone },
    { id: "code", label: c.stepCode },
  ] as const;

  return (
    <div className="space-y-4">
      {hideIntro ? null : !compact ? (
        <div>
          <h2 className="m-0 font-display text-xl font-bold text-ink">
            {c.linkTitle}
          </h2>
          <p className="mt-1 text-sm text-black/55">{c.linkLead}</p>
        </div>
      ) : (
        <p className="m-0 text-sm text-black/55">{c.linkHint}</p>
      )}

      <ol className="m-0 flex list-none items-center gap-2 p-0 text-xs font-semibold">
        {steps.map((s, i) => {
          const active = step === s.id;
          const done = s.id === "phone" && step === "code";
          return (
            <li key={s.id} className="flex items-center gap-2">
              {i > 0 ? (
                <span className="h-px w-6 bg-black/15" aria-hidden />
              ) : null}
              <span
                className={
                  active || done
                    ? "inline-flex size-5 items-center justify-center rounded-full bg-primary text-[10px] text-white"
                    : "inline-flex size-5 items-center justify-center rounded-full bg-black/[0.07] text-[10px] text-black/45"
                }
              >
                {done ? "✓" : i + 1}
              </span>
              <span className={active ? "text-ink" : "text-black/45"}>
                {s.label}
              </span>
            </li>
          );
        })}
      </ol>

      {step === "phone" ? (
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            void startOtp();
          }}
        >
          <label className={`${fieldLabel} block`}>
            {c.phoneLabel}
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              inputMode="tel"
              autoComplete="tel"
              placeholder="+998 XX XXX XX XX"
              className="mt-1.5"
            />
          </label>
          <Button type="submit" disabled={busy} className="w-full sm:w-auto">
            {c.sendCode}
          </Button>
        </form>
      ) : (
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (code.length === 6) void verify();
          }}
        >
          <p className="m-0 text-sm text-black/55">
            {c.codeSentTo}{" "}
            <span className="font-semibold text-ink">{phone}</span>
          </p>
          <label className={`${fieldLabel} block`}>
            {c.codeLabel}
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              inputMode="numeric"
              autoComplete="one-time-code"
              autoFocus
              placeholder="••••••"
              className="mt-1.5 font-mono tracking-[0.4em]"
            />
          </label>
          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={busy || code.length !== 6}>
              {c.verify}
            </Button>
            <Button type="button" variant="ghost" disabled={busy} onClick={resend}>
              {c.resendCode}
            </Button>
          </div>
          <button
            type="button"
            disabled={busy}
            className="text-sm font-semibold text-black/50 underline-offset-2 hover:text-ink hover:underline"
            onClick={() => {
              setStep("phone");
              setCode("");
              setChallenge("");
            }}
          >
            ← {c.changePhone}
          </button>
        </form>
      )}

      {error ? (
        <p className="m-0 rounded-xl bg-primary-soft px-3 py-2 text-sm text-primary" role="alert">
          {error}
          {contactUrl || error === c.noCustomer ? (
            <>
              {" "}
              <Link
                href={contactUrl || localePath(locale, "/contacts/")}
                className="font-semibold underline-offset-2 hover:underline"
              >
                {c.contactCta}
              </Link>
            </>
          ) : null}
        </p>
      ) : null}
    </div>
  );
}
