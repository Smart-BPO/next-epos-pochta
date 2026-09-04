"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { SITE_CONFIG } from "@/utils/consts";
import { Button } from "@/components/atoms/Button";

const STORAGE_KEY = "epos_cookie_consent";

function subscribe(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  return () => window.removeEventListener("storage", onStoreChange);
}

function getConsentSnapshot() {
  return window.localStorage.getItem(STORAGE_KEY);
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
      className="fixed inset-x-4 bottom-[calc(1rem+var(--sticky-cta-height))] z-50 mx-auto max-w-lg rounded-lg border border-border bg-white p-4 shadow-md md:bottom-4"
      role="dialog"
      aria-live="polite"
    >
      <p className="mt-0">{text}</p>
      <div className="flex flex-wrap gap-3">
        <Button
          type="button"
          onClick={() => {
            window.localStorage.setItem(STORAGE_KEY, "accepted");
            setLocalChoice("accepted");
          }}
        >
          {acceptLabel}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => {
            window.localStorage.setItem(STORAGE_KEY, "declined");
            setLocalChoice("declined");
          }}
        >
          {declineLabel}
        </Button>
      </div>
    </div>
  );
}
