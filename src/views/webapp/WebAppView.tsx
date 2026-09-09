"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ContactGate } from "@/components/webapp/ContactGate";
import { ShipmentForm } from "@/components/webapp/ShipmentForm";
import { useTelegram } from "@/components/webapp/TelegramProvider";
import { getWebAppCopy } from "@/data/webapp-copy";
import {
  clearContactSession,
  readContactSession,
  writeContactSession,
  type WebAppContactSession,
} from "@/lib/webapp/session";
import { Button } from "@/components/atoms/Button";
import { SITE_CONFIG } from "@/utils/consts";

type Step = "boot" | "contact" | "shipment" | "success";

export function WebAppView() {
  const { ready, locale, setLocale, isTelegram, initData } = useTelegram();
  const copy = getWebAppCopy(locale);
  const [step, setStep] = useState<Step>("boot");
  const [contact, setContact] = useState<WebAppContactSession | null>(null);
  const [shipmentId, setShipmentId] = useState<string | null>(null);

  useEffect(() => {
    if (!ready) return;
    let cancelled = false;

    const boot = async () => {
      const existing = readContactSession();
      if (existing) {
        if (cancelled) return;
        setContact(existing);
        setStep("shipment");
        return;
      }

      if (initData) {
        try {
          const res = await fetch("/api/webapp/session/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ initData }),
          });
          const json = (await res.json()) as {
            found?: boolean;
            session?: WebAppContactSession & { locale?: string };
          };
          if (json.found && json.session?.sessionId && json.session.phone) {
            const session: WebAppContactSession = {
              sessionId: json.session.sessionId,
              phone: json.session.phone,
              firstName: json.session.firstName,
              lastName: json.session.lastName,
              telegramUserId: json.session.telegramUserId,
              telegramUsername: json.session.telegramUsername,
              linkedAt: json.session.linkedAt,
              source: json.session.source,
            };
            writeContactSession(session);
            if (json.session.locale === "ru" || json.session.locale === "uz") {
              setLocale(json.session.locale);
            }
            if (cancelled) return;
            setContact(session);
            setStep("shipment");
            return;
          }
        } catch {
          // fall through to contact gate
        }
      }

      if (!cancelled) setStep("contact");
    };

    void boot();
    return () => {
      cancelled = true;
    };
  }, [ready, initData, setLocale]);

  if (!ready || step === "boot") {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-white px-4">
        <p className="m-0 text-sm text-black/45">…</p>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-[linear-gradient(180deg,#fff5f5_0%,#ffffff_28%,#ffffff_100%)]">
      <header className="sticky top-0 z-10 border-b border-black/8 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-md items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-2.5">
            <Image
              src="/images/brand/logo.svg"
              alt={SITE_CONFIG.name}
              width={72}
              height={28}
              unoptimized
              priority
            />
            {!isTelegram ? (
              <span className="rounded-full bg-surface-muted px-2 py-0.5 text-[0.65rem] font-medium uppercase tracking-wide text-black/45">
                web
              </span>
            ) : null}
          </div>
          <div className="flex overflow-hidden rounded-full border border-black/10 text-xs font-semibold">
            <button
              type="button"
              className={`px-2.5 py-1 ${locale === "uz" ? "bg-primary text-white" : "bg-white text-black/55"}`}
              onClick={() => setLocale("uz")}
            >
              UZ
            </button>
            <button
              type="button"
              className={`px-2.5 py-1 ${locale === "ru" ? "bg-primary text-white" : "bg-white text-black/55"}`}
              onClick={() => setLocale("ru")}
            >
              RU
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-md px-4 py-6 pb-10">
        {step === "contact" ? (
          <div className="rounded-3xl border border-black/10 bg-white p-4 shadow-[0_8px_28px_rgb(15_18_24/0.06)] sm:p-5">
            <p className="m-0 mb-4 text-xs font-semibold uppercase tracking-wide text-primary">
              {copy.brand}
            </p>
            <p className="m-0 mb-5 text-sm text-black/55">{copy.lead}</p>
            <ContactGate
              onLinked={(session) => {
                setContact(session);
                setStep("shipment");
              }}
            />
          </div>
        ) : null}

        {step === "shipment" && contact ? (
          <div className="rounded-3xl border border-black/10 bg-white p-4 shadow-[0_8px_28px_rgb(15_18_24/0.06)] sm:p-5">
            <ShipmentForm
              contact={contact}
              onSuccess={(id) => {
                setShipmentId(id);
                setStep("success");
              }}
              onChangeContact={() => {
                clearContactSession();
                setContact(null);
                setStep("contact");
              }}
            />
          </div>
        ) : null}

        {step === "success" && shipmentId ? (
          <div className="rounded-3xl border border-black/10 bg-white p-5 text-center shadow-[0_8px_28px_rgb(15_18_24/0.06)]">
            <p className="m-0 font-display text-2xl font-semibold uppercase tracking-[-0.03em] text-black">
              {copy.successTitle}
            </p>
            <p className="m-0 mt-3 text-sm leading-relaxed text-black/60">
              {copy.successText}{" "}
              <strong className="text-black">{shipmentId}</strong>
            </p>
            <p className="m-0 mt-2 text-xs text-black/45">{copy.disclaimer}</p>
            <Button
              type="button"
              variant="primary"
              width="full"
              className="mt-6"
              onClick={() => {
                setShipmentId(null);
                setStep("shipment");
              }}
            >
              {copy.newShipment}
            </Button>
          </div>
        ) : null}
      </main>
    </div>
  );
}
