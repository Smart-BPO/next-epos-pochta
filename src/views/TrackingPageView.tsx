"use client";

import { useEffect, useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import type { Locale } from "@/i18n/config";
import { getContent } from "@/i18n/get-content";
import { localePath } from "@/i18n/paths";
import { SITE_CONFIG } from "@/utils/consts";
import { Button } from "@/components/atoms/Button";
import { PageContainer } from "@/components/atoms/PageContainer";
import { trackEvent } from "@/lib/analytics/events";
import { lookupTracking } from "@/lib/tracking/client";
import type { TrackingShipment } from "@/lib/tracking/types";
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
  trackTimelineItemActive,
  trackTimelineMuted,
} from "@/styles/ui";

type UiState = "idle" | "invalid" | "unavailable" | "not_found" | "found";

function formatEventTime(iso: string, locale: Locale) {
  return new Intl.DateTimeFormat(locale === "uz" ? "uz-UZ" : "ru-RU", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function TrackingPageView({ locale }: { locale: Locale }) {
  const copy = getContent(locale);
  const params = useSearchParams();
  const queryNumber = params.get("number") ?? "";
  const [number, setNumber] = useState(queryNumber);
  const [edited, setEdited] = useState(false);
  const displayNumber = edited ? number : queryNumber;
  const [state, setState] = useState<UiState>("idle");
  const [shipment, setShipment] = useState<TrackingShipment | null>(null);
  const [pending, startTransition] = useTransition();

  function applyResult(
    result: Awaited<ReturnType<typeof lookupTracking>>,
  ) {
    if (result.ok && result.shipment) {
      setShipment(result.shipment);
      setState("found");
      return;
    }
    setShipment(null);
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
  }

  useEffect(() => {
    if (!queryNumber) return;
    let cancelled = false;
    startTransition(async () => {
      const result = await lookupTracking(queryNumber, locale);
      if (!cancelled) applyResult(result);
    });
    return () => {
      cancelled = true;
    };
  }, [queryNumber, locale]);

  return (
    <section className={pageIntro}>
      <PageContainer>
        <h1 className={pageIntroTitle}>{copy.tracking.title}</h1>
        <p className={sectionLead}>{copy.tracking.lead}</p>

        <div className={`${trackShell} max-w-2xl`}>
          <form
            className="flex flex-col gap-4 sm:flex-row sm:items-end"
            onSubmit={(e) => {
              e.preventDefault();
              startTransition(async () => {
                trackEvent("track_search_submit");
                const result = await lookupTracking(displayNumber, locale);
                applyResult(result);
              });
            }}
          >
            <div className={`${field} mb-0 min-w-0 flex-1`}>
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
                  setShipment(null);
                }}
                placeholder={copy.tracking.placeholder}
                autoComplete="off"
                inputMode="text"
                className={fieldControl}
              />
            </div>
            <Button type="submit" disabled={pending} className="shrink-0">
              {copy.ui.track}
            </Button>
          </form>

          {state === "idle" ? (
            <div className="grid gap-2">
              <div className={alertInfo}>{copy.tracking.emptyHint}</div>
              <p className="m-0 text-sm text-black/50">{copy.tracking.demoHint}</p>
            </div>
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
              <p className="mt-2 text-sm">{copy.tracking.demoHint}</p>
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

          {state === "found" && shipment ? (
            <div>
              <h2 className={sectionTitle}>{copy.tracking.resultTitle}</h2>
              <p className="mb-4 m-0 text-sm text-black/50">
                {shipment.number}
              </p>
              <div className={trackTimeline}>
                {[...shipment.events].reverse().map((event, index) => (
                  <div
                    key={`${event.code}-${event.occurredAt}`}
                    className={
                      index === 0
                        ? trackTimelineItemActive
                        : trackTimelineItem
                    }
                  >
                    <strong>{event.label}</strong>
                    <p className={fieldHint}>
                      {formatEventTime(event.occurredAt, locale)}
                      {event.location ? ` · ${event.location}` : ""}
                    </p>
                    {event.note ? (
                      <p className="mt-1 m-0 text-sm text-black/50">{event.note}</p>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <h2 className={sectionTitle}>
                {copy.tracking.timelinePreviewTitle}
              </h2>
              <p className={sectionLead}>{copy.tracking.timelinePreviewNote}</p>
              <div className={trackTimelineMuted} aria-hidden="true">
                {copy.tracking.sampleStatuses.map((label) => (
                  <div key={label} className={trackTimelineItem}>
                    <strong>{label}</strong>
                    <p className={fieldHint}>—</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </PageContainer>
    </section>
  );
}
