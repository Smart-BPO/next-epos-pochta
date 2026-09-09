"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { SITE_CONFIG } from "@/utils/consts";
import { Button } from "@/components/atoms/Button";
import {
  COOKIE_CONSENT_EVENT,
  COOKIE_CONSENT_STORAGE_KEY,
} from "@/lib/analytics/consent";

function setConsent(value: "accepted" | "declined") {
  window.localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, value);
  window.dispatchEvent(new Event(COOKIE_CONSENT_EVENT));
}

function subscribe(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(COOKIE_CONSENT_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(COOKIE_CONSENT_EVENT, onStoreChange);
  };
}

function getConsentSnapshot() {
  return window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY);
}

function getServerSnapshot() {
  return null;
}

export function CookieConsentBanner({
  text,
  acceptLabel,
  declineLabel,
}: {
  text: string;
  acceptLabel: string;
  declineLabel: string;
}) {
  const analyticsConfigured = useMemo(
    () =>
      Boolean(
        SITE_CONFIG.analytics.googleAnalyticsId ||
          SITE_CONFIG.analytics.yandexMetrikaId ||
          SITE_CONFIG.analytics.googleTagManagerId,
      ),
    [],
  );
  const stored = useSyncExternalStore(
    subscribe,
    getConsentSnapshot,
    getServerSnapshot,
  );
  const [localChoice, setLocalChoice] = useState<string | null>(null);
  const consent = localChoice ?? stored;
  const visible = analyticsConfigured && !consent;

  if (!visible) return null;

  return (
    <div
      className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-lg rounded-lg border border-border bg-white p-4 shadow-md"
      role="dialog"
      aria-live="polite"
    >
      <p className="mt-0">{text}</p>
      <div className="flex flex-wrap gap-3">
        <Button
          type="button"
          onClick={() => {
            setConsent("accepted");
            setLocalChoice("accepted");
          }}
        >
          {acceptLabel}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => {
            setConsent("declined");
            setLocalChoice("declined");
          }}
        >
          {declineLabel}
        </Button>
      </div>
    </div>
  );
}
