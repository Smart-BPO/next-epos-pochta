"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
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
  alertWarning,
  fieldControl,
  fieldLabel,
  heroActions,
  pageIntro,
  pageIntroTitle,
  sectionLead,
  trackForm,
  trackFormRow,
  trackResultNumber,
  trackResultTitle,
  trackShell,
  trackTimeline,
  trackTimelineBody,
  trackTimelineDot,
  trackTimelineDotActive,
  trackTimelineItem,
  trackTimelineLabel,
  trackTimelineLine,
  trackTimelineMeta,
  trackTimelineNote,
  trackTimelineRail,
} from "@/styles/ui";

type UiState = "idle" | "loading" | "invalid" | "not_found" | "found";

function formatEventTime(iso: string) {
  // ru-RU numeric avoids broken uz-UZ short-month output (e.g. "2026 M09 4").
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function TrackingPageView({ locale }: { locale: Locale }) {
  const copy = getContent(locale);
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const queryNumber = params.get("number") ?? "";
  const [number, setNumber] = useState(queryNumber);
  const [state, setState] = useState<UiState>(queryNumber ? "loading" : "idle");
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
    setState("not_found");
    trackEvent("track_search_error", { reason: "not_found" });
  }

  function runLookup(raw: string, syncUrl: boolean) {
    const trimmed = raw.trim();
    setState("loading");
    startTransition(async () => {
      trackEvent("track_search_submit");
      const result = await lookupTracking(trimmed, locale);
      applyResult(result);
      if (syncUrl) {
        const qs = trimmed
          ? `?number=${encodeURIComponent(trimmed)}`
          : "";
        router.replace(`${pathname}${qs}`, { scroll: false });
      }
    });
  }

  useEffect(() => {
    setNumber(queryNumber);
    if (!queryNumber) {
      setState("idle");
      setShipment(null);
      return;
    }
    let cancelled = false;
    setState("loading");
    startTransition(async () => {
      const result = await lookupTracking(queryNumber, locale);
      if (!cancelled) applyResult(result);
    });
    return () => {
      cancelled = true;
    };
  }, [queryNumber, locale]);

  const events =
    state === "found" && shipment
      ? [...shipment.events].reverse()
      : [];

  return (
    <>
      <section className={pageIntro}>
        <PageContainer>
          <h1 className={pageIntroTitle}>{copy.tracking.title}</h1>
          <p className={sectionLead}>{copy.tracking.lead}</p>
        </PageContainer>
      </section>

      <section className="pb-[var(--section-y)]">
        <PageContainer>
          <div className={`${trackShell} max-w-2xl`}>
            <form
              className={trackForm}
              onSubmit={(e) => {
                e.preventDefault();
                runLookup(number, true);
              }}
            >
              <label htmlFor="track-number" className={fieldLabel}>
                {copy.tracking.placeholder}
              </label>
              <div className={trackFormRow}>
                <input
                  id="track-number"
                  value={number}
                  onChange={(e) => {
                    setNumber(e.target.value);
                    if (state !== "idle" && state !== "loading") setState("idle");
                    setShipment(null);
                  }}
                  placeholder={copy.tracking.placeholder}
                  autoComplete="off"
                  inputMode="text"
                  className={`${fieldControl} w-full`}
                />
                <Button type="submit" disabled={pending} width="mobile">
                  {copy.ui.track}
                </Button>
              </div>
            </form>

            {state === "loading" ? (
              <p className="m-0 text-base text-ink-muted" role="status">
                {copy.tracking.loadingText}
              </p>
            ) : null}

            {state === "invalid" ? (
              <div className={`${alertWarning} mb-0`} role="alert">
                <strong>{copy.tracking.formatErrorTitle}</strong>
                <p className="mb-0">{copy.tracking.formatErrorText}</p>
              </div>
            ) : null}

            {state === "not_found" ? (
              <div className={`${alertWarning} mb-0`} role="status">
                <strong>{copy.tracking.errorTitle}</strong>
                <p className="mb-0">{copy.tracking.errorText}</p>
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
              <div className="border-t border-black/10 pt-5">
                <h2 className={trackResultTitle}>{copy.tracking.resultTitle}</h2>
                <p className={trackResultNumber}>{shipment.number}</p>
                <ol className={trackTimeline}>
                  {events.map((event, index) => {
                    const isLast = index === events.length - 1;
                    return (
                      <li
                        key={`${event.code}-${event.occurredAt}`}
                        className={trackTimelineItem}
                      >
                        <div className={trackTimelineRail} aria-hidden>
                          <span
                            className={
                              index === 0
                                ? trackTimelineDotActive
                                : trackTimelineDot
                            }
                          />
                          {!isLast ? (
                            <span className={trackTimelineLine} />
                          ) : null}
                        </div>
                        <div className={trackTimelineBody}>
                          <p className={trackTimelineLabel}>{event.label}</p>
                          <p className={trackTimelineMeta}>
                            {formatEventTime(event.occurredAt)}
                            {event.location ? ` · ${event.location}` : ""}
                          </p>
                          {event.note ? (
                            <p className={trackTimelineNote}>{event.note}</p>
                          ) : null}
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </div>
            ) : null}
          </div>
        </PageContainer>
      </section>
    </>
  );
}
