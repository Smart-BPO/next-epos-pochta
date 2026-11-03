"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Locale } from "@/i18n/config";
import { localePath } from "@/i18n/paths";
import { cabinetCopy } from "@/data/cabinet";
import { PageContainer } from "@/components/atoms/PageContainer";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { SettlementSelect } from "@/components/atoms/SettlementSelect";
import { createRequestId, isValidUzPhone, normalizePhone } from "@/lib/form/utils";
import { fieldLabel, pageIntro, pageIntroTitle, sectionLead, sectionMuted } from "@/styles/ui";

type Linked = {
  id: string;
  phone: string;
  displayName: string | null;
};

type PackageRow = {
  id: string | number;
  trackingNumber: string | null;
  statusLabel: string;
  fromLabel: string | null;
  toLabel: string | null;
  createdAt: string | null;
};

type Step = "loading" | "phone" | "code" | "linked";

export function CabinetPageView({ locale }: { locale: Locale }) {
  const c = cabinetCopy(locale);
  const [step, setStep] = useState<Step>("loading");
  const [phone, setPhone] = useState("");
  const [challenge, setChallenge] = useState("");
  const [code, setCode] = useState("");
  const [linked, setLinked] = useState<Linked | null>(null);
  const [packages, setPackages] = useState<PackageRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [contactUrl, setContactUrl] = useState<string | null>(null);

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [receiverName, setReceiverName] = useState("");
  const [receiverPhone, setReceiverPhone] = useState("");
  const [weight, setWeight] = useState("1");
  const [length, setLength] = useState("20");
  const [width, setWidth] = useState("15");
  const [height, setHeight] = useState("10");
  const [comment, setComment] = useState("");
  const [tracking, setTracking] = useState<string | null>(null);

  const loadPackages = async () => {
    try {
      const res = await fetch(`/api/account/packages/?locale=${locale}`, {
        cache: "no-store",
      });
      if (res.status === 401) {
        setLinked(null);
        setStep("phone");
        setError(cabinetCopy(locale).relinkRequired);
        return;
      }
      const json = (await res.json()) as { packages?: PackageRow[] };
      setPackages(json.packages ?? []);
    } catch {
      setPackages([]);
    }
  };

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/account/me/", { cache: "no-store" });
        const json = (await res.json()) as {
          linked?: Linked | null;
          error?: string;
        };
        if (cancelled) return;
        if (json.linked) {
          setLinked(json.linked);
          setStep("linked");
          try {
            const pkgRes = await fetch(
              `/api/account/packages/?locale=${locale}`,
              { cache: "no-store" },
            );
            if (cancelled) return;
            if (pkgRes.status === 401) {
              setLinked(null);
              setStep("phone");
              setError(cabinetCopy(locale).relinkRequired);
              return;
            }
            const pkgJson = (await pkgRes.json()) as {
              packages?: PackageRow[];
            };
            setPackages(pkgJson.packages ?? []);
          } catch {
            if (!cancelled) setPackages([]);
          }
        } else {
          setStep("phone");
        }
      } catch {
        if (!cancelled) setStep("phone");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [locale]);

  const mapError = (err?: string) => {
    if (err === "no_customer_card") return c.noCustomer;
    if (err === "rate_limited" || err === "resend_cooldown") return c.rateLimited;
    if (
      err === "fcargo_unavailable" ||
      err === "secrets_unavailable" ||
      err === "link_store_failed"
    ) {
      return c.serviceUnavailable;
    }
    if (err === "relink_required") return c.relinkRequired;
    if (err === "invalid_input" || err === "invalid_phone") return c.invalidCode;
    return c.genericError;
  };

  const startOtp = async () => {
    setError(null);
    setContactUrl(null);
    if (!isValidUzPhone(phone)) {
      setError(c.invalidCode);
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/account/otp/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: normalizePhone(phone).replace(/\s/g, "") }),
      });
      const json = (await res.json()) as {
        challenge?: string;
        error?: string;
        contactUrl?: string;
      };
      if (!res.ok || !json.challenge) {
        setError(mapError(json.error));
        if (json.contactUrl) setContactUrl(json.contactUrl);
        return;
      }
      setChallenge(json.challenge);
      setStep("code");
    } catch {
      setError(c.genericError);
    } finally {
      setBusy(false);
    }
  };

  const verifyOtp = async () => {
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/account/otp/verify/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: normalizePhone(phone).replace(/\s/g, ""),
          challenge,
          code: code.trim(),
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
      setCode("");
      await loadPackages();
    } catch {
      setError(c.genericError);
    } finally {
      setBusy(false);
    }
  };

  const resend = async () => {
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/account/otp/resend/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: normalizePhone(phone).replace(/\s/g, ""),
          challenge,
        }),
      });
      const json = (await res.json()) as { challenge?: string; error?: string };
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
        body: "{}",
      });
    } finally {
      setLinked(null);
      setPackages([]);
      setTracking(null);
      setStep("phone");
      setBusy(false);
    }
  };

  const createShipment = async () => {
    setError(null);
    setTracking(null);
    if (!from || !to || from === to) {
      setError(c.genericError);
      return;
    }
    if (!receiverName.trim() || !isValidUzPhone(receiverPhone)) {
      setError(c.genericError);
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/account/shipment/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locale,
          fromSettlementId: from,
          toSettlementId: to,
          receiverName: receiverName.trim(),
          receiverPhone: normalizePhone(receiverPhone).replace(/\s/g, ""),
          weightKg: Number(weight) || null,
          lengthCm: Number(length) || null,
          widthCm: Number(width) || null,
          heightCm: Number(height) || null,
          comment: comment.trim(),
          requestId: createRequestId("cab"),
        }),
      });
      const json = (await res.json()) as {
        trackingNumber?: string;
        error?: string;
      };
      if (!res.ok || !json.trackingNumber) {
        setError(mapError(json.error));
        return;
      }
      setTracking(json.trackingNumber);
      await loadPackages();
    } catch {
      setError(c.genericError);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <section className={pageIntro}>
        <PageContainer>
          <h1 className={pageIntroTitle}>{c.title}</h1>
          <p className={sectionLead}>{c.lead}</p>
        </PageContainer>
      </section>

      <section className={sectionMuted}>
        <PageContainer className="max-w-2xl">
          <div className="grid gap-4 rounded-3xl border border-black/10 bg-white p-4 sm:p-6">
            {step === "loading" ? (
              <p className="m-0 text-sm text-black/55">…</p>
            ) : null}

            {step === "phone" || step === "code" ? (
              <div className="grid gap-3">
                <div className="grid gap-1.5">
                  <label htmlFor="cab-phone" className={fieldLabel}>
                    {c.phoneLabel}
                  </label>
                  <Input
                    id="cab-phone"
                    type="tel"
                    inputMode="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+998 XX XXX XX XX"
                    disabled={step === "code" || busy}
                  />
                </div>
                {step === "code" ? (
                  <div className="grid gap-1.5">
                    <label htmlFor="cab-code" className={fieldLabel}>
                      {c.codeLabel}
                    </label>
                    <Input
                      id="cab-code"
                      inputMode="numeric"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="000000"
                      disabled={busy}
                    />
                  </div>
                ) : null}
                {error ? (
                  <p className="m-0 text-sm text-danger">
                    {error}
                    {contactUrl ? (
                      <>
                        {" "}
                        <Link
                          href={localePath(locale, "/contacts/")}
                          className="underline underline-offset-2"
                        >
                          {c.contactCta}
                        </Link>
                      </>
                    ) : null}
                  </p>
                ) : null}
                <div className="flex flex-wrap gap-2">
                  {step === "phone" ? (
                    <Button
                      type="button"
                      variant="primary"
                      disabled={busy}
                      onClick={() => void startOtp()}
                    >
                      {c.sendCode}
                    </Button>
                  ) : (
                    <>
                      <Button
                        type="button"
                        variant="primary"
                        disabled={busy}
                        onClick={() => void verifyOtp()}
                      >
                        {c.verify}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        disabled={busy}
                        onClick={() => void resend()}
                      >
                        {c.resendCode}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        disabled={busy}
                        onClick={() => {
                          setStep("phone");
                          setCode("");
                          setChallenge("");
                          setError(null);
                        }}
                      >
                        ←
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ) : null}

            {step === "linked" && linked ? (
              <div className="grid gap-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="m-0 text-xs font-semibold uppercase tracking-wide text-black/45">
                      {c.linkedAs}
                    </p>
                    <p className="m-0 mt-1 font-semibold text-black">
                      {linked.displayName || linked.phone}
                    </p>
                    <p className="m-0 text-sm text-black/55">{linked.phone}</p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={busy}
                    onClick={() => void logout()}
                  >
                    {c.logout}
                  </Button>
                </div>

                <div className="grid gap-3">
                  <h2 className="m-0 font-display text-lg font-semibold uppercase tracking-wide">
                    {c.packagesTitle}
                  </h2>
                  {packages.length === 0 ? (
                    <p className="m-0 text-sm text-black/55">{c.emptyPackages}</p>
                  ) : (
                    <ul className="m-0 grid list-none gap-2 p-0">
                      {packages.map((pkg) => (
                        <li
                          key={String(pkg.id)}
                          className="rounded-2xl border border-black/10 px-3 py-2.5"
                        >
                          <div className="flex flex-wrap items-baseline justify-between gap-2">
                            <Link
                              href={`${localePath(locale, "/tracking/")}?number=${encodeURIComponent(pkg.trackingNumber || "")}`}
                              className="font-mono text-sm font-semibold text-primary underline-offset-2 hover:underline"
                            >
                              {pkg.trackingNumber || pkg.id}
                            </Link>
                            <span className="text-xs text-black/55">
                              {pkg.statusLabel}
                            </span>
                          </div>
                          {(pkg.fromLabel || pkg.toLabel) && (
                            <p className="m-0 mt-1 text-xs text-black/45">
                              {[pkg.fromLabel, pkg.toLabel]
                                .filter(Boolean)
                                .join(" → ")}
                            </p>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="grid gap-3 border-t border-black/[0.06] pt-4">
                  <h2 className="m-0 font-display text-lg font-semibold uppercase tracking-wide">
                    {c.newShipment}
                  </h2>
                  <p className="m-0 text-xs text-black/55">{c.disclaimer}</p>
                  {tracking ? (
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 px-3 py-2 text-sm text-emerald-900">
                      <strong>{c.successTitle}</strong>
                      <p className="mb-0 mt-1">
                        {c.trackLabel}:{" "}
                        <Link
                          href={`${localePath(locale, "/tracking/")}?number=${encodeURIComponent(tracking)}`}
                          className="font-mono font-semibold underline underline-offset-2"
                        >
                          {tracking}
                        </Link>
                      </p>
                    </div>
                  ) : null}
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="grid gap-1.5">
                      <span className={fieldLabel}>{c.fromLabel}</span>
                      <SettlementSelect
                        instanceId="cab-from"
                        locale={locale}
                        value={from}
                        onChange={setFrom}
                        placeholder={c.fromLabel}
                        variant="compact"
                      />
                    </label>
                    <label className="grid gap-1.5">
                      <span className={fieldLabel}>{c.toLabel}</span>
                      <SettlementSelect
                        instanceId="cab-to"
                        locale={locale}
                        value={to}
                        onChange={setTo}
                        placeholder={c.toLabel}
                        variant="compact"
                      />
                    </label>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="grid gap-1.5">
                      <span className={fieldLabel}>{c.receiverName}</span>
                      <Input
                        value={receiverName}
                        onChange={(e) => setReceiverName(e.target.value)}
                      />
                    </label>
                    <label className="grid gap-1.5">
                      <span className={fieldLabel}>{c.receiverPhone}</span>
                      <Input
                        type="tel"
                        value={receiverPhone}
                        onChange={(e) => setReceiverPhone(e.target.value)}
                        placeholder="+998 XX XXX XX XX"
                      />
                    </label>
                  </div>
                  <label className="grid gap-1.5">
                    <span className={fieldLabel}>{c.weightLabel}</span>
                    <Input
                      inputMode="decimal"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                    />
                  </label>
                  <fieldset className="m-0 grid gap-2 border-0 p-0">
                    <legend className={fieldLabel}>{c.dimsLabel}</legend>
                    <div className="grid grid-cols-3 gap-2">
                      <Input
                        inputMode="numeric"
                        value={length}
                        onChange={(e) => setLength(e.target.value)}
                        placeholder="L"
                      />
                      <Input
                        inputMode="numeric"
                        value={width}
                        onChange={(e) => setWidth(e.target.value)}
                        placeholder="W"
                      />
                      <Input
                        inputMode="numeric"
                        value={height}
                        onChange={(e) => setHeight(e.target.value)}
                        placeholder="H"
                      />
                    </div>
                  </fieldset>
                  <label className="grid gap-1.5">
                    <span className={fieldLabel}>{c.commentLabel}</span>
                    <Input
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                    />
                  </label>
                  {error ? (
                    <p className="m-0 text-sm text-danger">{error}</p>
                  ) : null}
                  <div>
                    <Button
                      type="button"
                      variant="primary"
                      disabled={busy}
                      onClick={() => void createShipment()}
                    >
                      {c.submitShipment}
                    </Button>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </PageContainer>
      </section>
    </>
  );
}
