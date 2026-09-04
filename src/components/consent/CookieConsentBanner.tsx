"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { SITE_CONFIG } from "@/utils/consts";

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
    <div className="cookie-banner" role="dialog" aria-live="polite">
      <p style={{ marginTop: 0 }}>{text}</p>
      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            window.localStorage.setItem(STORAGE_KEY, "accepted");
            setLocalChoice("accepted");
          }}
        >
          {acceptLabel}
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => {
            window.localStorage.setItem(STORAGE_KEY, "declined");
            setLocalChoice("declined");
          }}
        >
          {declineLabel}
        </button>
      </div>
    </div>
  );
}
