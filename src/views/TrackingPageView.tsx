"use client";

import { useState, useTransition } from "react";
import type { Locale } from "@/i18n/config";
import { getContent } from "@/i18n/get-content";
import { localePath } from "@/i18n/paths";
import { SITE_CONFIG } from "@/utils/consts";
import { Button } from "@/components/atoms/Button";
import { PageContainer } from "@/components/atoms/PageContainer";
import { trackEvent } from "@/lib/analytics/events";
import { lookupTracking } from "@/lib/tracking/client";

type UiState = "idle" | "invalid" | "unavailable" | "not_found";

export function TrackingPageView({
  locale,
  initialNumber = "",
}: {
  locale: Locale;
  initialNumber?: string;
}) {
  const copy = getContent(locale);
  const [number, setNumber] = useState(initialNumber);
  const [state, setState] = useState<UiState>(
    initialNumber ? "unavailable" : "idle",
  );
  const [pending, startTransition] = useTransition();

  return (
    <section className="page-intro">
      <PageContainer>
        <h1>{copy.tracking.title}</h1>
        <p className="section-lead">{copy.tracking.lead}</p>

        <div className="track-shell">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              startTransition(async () => {
                trackEvent("track_search_submit");
                const result = await lookupTracking(number);
                if (!result.ok && result.error === "invalid_format") {
                  setState("invalid");
                  trackEvent("track_search_error", { reason: "invalid_format" });
                  return;
                }
                if (!result.ok && result.error === "not_found") {
                  setState("not_found");
                  trackEvent("track_search_error", { reason: "not_found" });
                  return;
                }
                setState("unavailable");
                trackEvent("track_search_unavailable");
              });
            }}
          >
            <div className="field">
              <label htmlFor="track-number">{copy.tracking.placeholder}</label>
              <input
                id="track-number"
                value={number}
                onChange={(e) => {
                  setNumber(e.target.value);
                  if (state !== "idle") setState("idle");
                }}
                placeholder={copy.tracking.placeholder}
                autoComplete="off"
                inputMode="text"
              />
            </div>
            <Button type="submit" disabled={pending}>
              {copy.ui.track}
            </Button>
          </form>

          {state === "idle" ? (
            <div className="alert alert-info">{copy.tracking.emptyHint}</div>
          ) : null}

          {state === "invalid" ? (
            <div className="alert alert-warning" role="alert">
              <strong>{copy.tracking.formatErrorTitle}</strong>
              <p>{copy.tracking.formatErrorText}</p>
            </div>
          ) : null}

          {state === "not_found" ? (
            <div className="alert alert-warning" role="status">
              <strong>{copy.tracking.errorTitle}</strong>
              <p>{copy.tracking.errorText}</p>
            </div>
          ) : null}

          {state === "unavailable" ? (
            <div className="alert alert-warning" role="status">
              <strong>{copy.tracking.unavailableTitle}</strong>
              <p>{copy.tracking.unavailableText}</p>
              <div className="hero-actions" style={{ marginTop: "0.85rem" }}>
                <Button
                  href={`tel:${SITE_CONFIG.phone}`}
                  onClick={() => trackEvent("track_support_call_click")}
                >
                  {copy.tracking.supportCta}
                </Button>
                <Button
                  href={localePath(locale, "/contacts/")}
                  variant="secondary"
                >
                  {copy.ui.write}
                </Button>
              </div>
            </div>
          ) : null}

          <div>
            <h2 className="section-title">{copy.tracking.timelinePreviewTitle}</h2>
            <p className="section-lead">{copy.tracking.timelinePreviewNote}</p>
            <div className="track-timeline" aria-hidden="true">
              {copy.tracking.sampleStatuses.map((label) => (
                <div key={label} className="track-timeline__item">
                  <strong>{label}</strong>
                  <p className="hint">—</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </PageContainer>
    </section>
  );
}
