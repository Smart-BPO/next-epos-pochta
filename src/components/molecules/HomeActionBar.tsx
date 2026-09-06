"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/i18n/config";
import { localePath } from "@/i18n/paths";
import type { SiteCopy } from "@/data/types";
import { getSettlementById, settlementLabel } from "@/data/settlements";
import { Button } from "@/components/atoms/Button";
import { PageContainer } from "@/components/atoms/PageContainer";
import { SettlementSelect } from "@/components/atoms/SettlementSelect";
import { trackEvent } from "@/lib/analytics/events";
import {
  homeActionBar,
  homeActionBridge,
  homeActionControls,
  homeActionDivider,
  homeActionField,
  homeActionIsland,
  homeActionLabel,
  homeActionPane,
  homeActionRow,
  homeActionSwap,
} from "@/styles/ui";

function SwapIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      xmlns="http://www.w3.org/2000/svg"
      className="sm:h-5 sm:w-5"
    >
      <path
        d="M5 8h11.5M14 5.5 16.5 8 14 10.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M19 16H7.5M10 13.5 7.5 16 10 18.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** White Figma island: track + calculator entry under the hero. */
export function HomeActionBar({
  locale,
  copy,
}: {
  locale: Locale;
  copy: SiteCopy;
}) {
  const router = useRouter();
  const [trackNumber, setTrackNumber] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const submitTrack = () => {
    const number = trackNumber.trim();
    trackEvent("track_search_start");
    router.push(
      `${localePath(locale, "/tracking/")}?number=${encodeURIComponent(number)}`,
    );
  };

  const submitQuote = () => {
    trackEvent("request_price_start", { source: "home_quote" });
    const params = new URLSearchParams();
    const fromMeta = getSettlementById(from);
    const toMeta = getSettlementById(to);
    if (fromMeta) params.set("from", settlementLabel(fromMeta, locale));
    if (toMeta) params.set("to", settlementLabel(toMeta, locale));
    const qs = params.toString();
    router.push(
      `${localePath(locale, "/calculator/")}${qs ? `?${qs}` : ""}`,
    );
  };

  return (
    <section className={homeActionBar} aria-label={copy.home.quoteTitle}>
      <div className={homeActionBridge}>
        <PageContainer>
          <div className={homeActionIsland}>
            <div className={homeActionPane}>
              <h2 className={homeActionLabel}>{copy.home.trackTitle}</h2>
              <form
                className={homeActionControls}
                onSubmit={(e) => {
                  e.preventDefault();
                  submitTrack();
                }}
              >
                <label className="sr-only" htmlFor="home-action-track">
                  {copy.home.trackPlaceholder}
                </label>
                <input
                  id="home-action-track"
                  value={trackNumber}
                  onChange={(e) => setTrackNumber(e.target.value)}
                  placeholder={copy.home.trackPlaceholder}
                  className={homeActionField}
                  autoComplete="off"
                />
                <Button type="submit" variant="secondary" size="sm" width="mobile">
                  {copy.ui.track}
                </Button>
              </form>
            </div>

            <div className={homeActionDivider} aria-hidden />

            <div className={`${homeActionPane} lg:min-w-0 lg:flex-[1.45]`}>
              <h2 className={homeActionLabel}>{copy.home.quoteTitle}</h2>
              <form
                className={homeActionControls}
                onSubmit={(e) => {
                  e.preventDefault();
                  submitQuote();
                }}
              >
                <div className={homeActionRow}>
                  <label className="sr-only" htmlFor="home-action-from">
                    {copy.home.quoteFrom}
                  </label>
                  <SettlementSelect
                    id="home-action-from"
                    instanceId="home-action-from"
                    locale={locale}
                    value={from}
                    onChange={setFrom}
                    placeholder={copy.home.quoteFrom}
                    variant="compact"
                    className="min-w-0 flex-1"
                  />
                  <button
                    type="button"
                    className={homeActionSwap}
                    aria-label={copy.home.quoteSwap}
                    onClick={() => {
                      setFrom(to);
                      setTo(from);
                    }}
                  >
                    <SwapIcon />
                  </button>
                  <label className="sr-only" htmlFor="home-action-to">
                    {copy.home.quoteTo}
                  </label>
                  <SettlementSelect
                    id="home-action-to"
                    instanceId="home-action-to"
                    locale={locale}
                    value={to}
                    onChange={setTo}
                    placeholder={copy.home.quoteTo}
                    variant="compact"
                    className="min-w-0 flex-1"
                  />
                </div>
                <Button type="submit" variant="primary" size="sm" width="mobile">
                  {copy.home.quoteCta}
                </Button>
              </form>
            </div>
          </div>
        </PageContainer>
      </div>
    </section>
  );
}
