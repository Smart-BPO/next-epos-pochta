"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Locale } from "@/i18n/config";
import { getContent } from "@/i18n/get-content";
import { localePath } from "@/i18n/paths";
import { SITE_CONFIG } from "@/utils/consts";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { PageContainer } from "@/components/atoms/PageContainer";
import { trackEvent } from "@/lib/analytics/events";
import { lookupTracking } from "@/lib/tracking/client";
import type { TrackingShipment } from "@/lib/tracking/types";
import {
  alertWarning,
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

type UiState =
  | "idle"
  | "loading"
  | "invalid"
  | "not_found"
  | "unavailable"
  | "rate_limited"
  | "found";

function formatDay(iso: string) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(iso));
}

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
      trackEvent("track_search_success", { status: result.shipment.status });
      return;
    }
    setShipment(null);
    const reason = result.error ?? "not_found";
    setState(
      reason === "invalid_format"
        ? "invalid"
        : reason === "unavailable" || reason === "rate_limited"
          ? reason
          : "not_found",
    );
    trackEvent("track_search_error", { reason });
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
                <Input
                  id="track-number"
                  name="track_number"
                  value={number}
                  onChange={(e) => {
                    setNumber(e.target.value);
                    if (state !== "idle" && state !== "loading") setState("idle");
                    setShipment(null);
                  }}
                  placeholder={copy.tracking.placeholder}
                  autoComplete="off"
                  inputMode="text"
                  className="w-full"
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

            {state === "rate_limited" ? (
              <div className={`${alertWarning} mb-0`} role="status">
                <p className="mb-0">{copy.tracking.rateLimitedText}</p>
              </div>
            ) : null}

            {state === "not_found" || state === "unavailable" ? (
              <div className={`${alertWarning} mb-0`} role="status">
                <strong>
                  {state === "unavailable"
                    ? copy.tracking.unavailableTitle
                    : copy.tracking.errorTitle}
                </strong>
                <p className="mb-0">
                  {state === "unavailable"
                    ? copy.tracking.unavailableText
                    : copy.tracking.errorText}
                </p>
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
                <p className="m-0 mt-3 text-lg font-semibold text-ink">
                  {shipment.statusLabel}
                </p>
                <dl className="m-0 mt-3 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
                  {shipment.currentLocation &&
                  shipment.status !== "delivered" &&
                  shipment.status !== "cancelled" ? (
                    <div>
                      <dt className="text-ink-muted">
                        {copy.tracking.currentLocation}
                      </dt>
                      <dd className="m-0 font-medium text-ink">
                        {shipment.currentLocation}
                      </dd>
                    </div>
                  ) : null}
                  {shipment.deliveredAt ? (
                    <div>
                      <dt className="text-ink-muted">
                        {copy.tracking.deliveredAt}
                      </dt>
                      <dd className="m-0 font-medium text-ink">
                        {formatEventTime(shipment.deliveredAt)}
                      </dd>
                    </div>
                  ) : shipment.estimatedDeliveryAt ? (
                    <div>
                      <dt className="text-ink-muted">
                        {copy.tracking.estimatedDelivery}
                      </dt>
                      <dd className="m-0 font-medium text-ink">
                        {formatDay(shipment.estimatedDeliveryAt)}
                      </dd>
                    </div>
                  ) : null}
                </dl>
                <h3 className="m-0 mt-5 text-xs font-semibold uppercase tracking-wide text-ink-muted">
                  {copy.tracking.historyTitle}
                </h3>
                <ol className={trackTimeline}>
                  {events.map((event, index) => {
                    const isLast = index === events.length - 1;
                    return (
                      <li
                        key={`${event.code}-${event.occurredAt ?? index}`}
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
                          {event.occurredAt || event.location ? (
                            <p className={trackTimelineMeta}>
                              {[
                                event.occurredAt
                                  ? formatEventTime(event.occurredAt)
                                  : null,
                                event.location ?? null,
                              ]
                                .filter(Boolean)
                                .join(" · ")}
                            </p>
                          ) : null}
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
