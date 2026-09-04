"use client";

import { useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import type { Locale } from "@/i18n/config";
import { getContent } from "@/i18n/get-content";
import { localePath } from "@/i18n/paths";
import { SITE_CONFIG } from "@/utils/consts";
import { Button } from "@/components/atoms/Button";
import { PageContainer } from "@/components/atoms/PageContainer";
import { trackEvent } from "@/lib/analytics/events";
import { lookupTracking } from "@/lib/tracking/client";
import {
  alertInfo,
  alertWarning,
  field,
  fieldControl,
  fieldHint,
  fieldLabel,
  heroActions,
  pageIntro,
  pageIntroTitle,
  sectionLead,
  sectionTitle,
  trackShell,
  trackTimeline,
  trackTimelineItem,
} from "@/styles/ui";

type UiState = "idle" | "invalid" | "unavailable" | "not_found";

export function TrackingPageView({ locale }: { locale: Locale }) {
  const copy = getContent(locale);
  const params = useSearchParams();
  const queryNumber = params.get("number") ?? "";
  const [number, setNumber] = useState(queryNumber);
  const [edited, setEdited] = useState(false);
  const displayNumber = edited ? number : queryNumber;
  const [state, setState] = useState<UiState>(
    queryNumber ? "unavailable" : "idle",
  );
  const [pending, startTransition] = useTransition();

  return (
    <section className={pageIntro}>
      <PageContainer>
        <h1 className={pageIntroTitle}>{copy.tracking.title}</h1>
        <p className={sectionLead}>{copy.tracking.lead}</p>

        <div className={trackShell}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              startTransition(async () => {
                trackEvent("track_search_submit");
                const result = await lookupTracking(displayNumber);
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
            <div className={field}>
              <label htmlFor="track-number" className={fieldLabel}>
                {copy.tracking.placeholder}
              </label>
              <input
                id="track-number"
                value={displayNumber}
                onChange={(e) => {
                  setEdited(true);
                  setNumber(e.target.value);
                  if (state !== "idle") setState("idle");
                }}
                placeholder={copy.tracking.placeholder}
                autoComplete="off"
                inputMode="text"
                className={fieldControl}
              />
            </div>
            <Button type="submit" disabled={pending}>
              {copy.ui.track}
            </Button>
          </form>

          {state === "idle" ? (
            <div className={alertInfo}>{copy.tracking.emptyHint}</div>
          ) : null}

          {state === "invalid" ? (
            <div className={alertWarning} role="alert">
              <strong>{copy.tracking.formatErrorTitle}</strong>
              <p>{copy.tracking.formatErrorText}</p>
            </div>
          ) : null}

          {state === "not_found" ? (
            <div className={alertWarning} role="status">
              <strong>{copy.tracking.errorTitle}</strong>
              <p>{copy.tracking.errorText}</p>
            </div>
          ) : null}

          {state === "unavailable" ? (
            <div className={alertWarning} role="status">
              <strong>{copy.tracking.unavailableTitle}</strong>
              <p>{copy.tracking.unavailableText}</p>
              <div className={`${heroActions} mt-3.5`}>
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
            <h2 className={sectionTitle}>{copy.tracking.timelinePreviewTitle}</h2>
            <p className={sectionLead}>{copy.tracking.timelinePreviewNote}</p>
            <div className={trackTimeline} aria-hidden="true">
              {copy.tracking.sampleStatuses.map((label) => (
                <div key={label} className={trackTimelineItem}>
                  <strong>{label}</strong>
                  <p className={fieldHint}>—</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </PageContainer>
    </section>
  );
}
