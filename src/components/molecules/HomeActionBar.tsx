"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/i18n/config";
import { localePath } from "@/i18n/paths";
import type { SiteCopy } from "@/data/types";
import { trackEvent } from "@/lib/analytics/events";
import { PageContainer } from "@/components/atoms/PageContainer";
import {
  homeActionBar,
  homeActionBody,
  homeActionBtn,
  homeActionDivider,
  homeActionField,
  homeActionGrid,
  homeActionIcon,
  homeActionLabel,
  homeActionNote,
  homeActionPane,
  homeActionRow,
  homeActionSwap,
} from "@/styles/ui";

function ParcelIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M7.5 13.5 20 7l12.5 6.5v13.5L20 33.5 7.5 27V13.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M20 20.5V33.5M7.5 13.5 20 20.5l12.5-7M14 10.5l12 6.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CalcIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="10"
        y="7"
        width="20"
        height="26"
        rx="2.5"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <rect
        x="13.5"
        y="10.5"
        width="13"
        height="5"
        rx="1.2"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M14.5 21h2.5M18.75 21h2.5M23 21h2.5M14.5 25.5h2.5M18.75 25.5h2.5M23 25.5h2.5M14.5 30h2.5M18.75 30h2.5M23 30h2.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SwapIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M4 7h10.5M12 4.5 14.5 7 12 9.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16 13H5.5M8 10.5 5.5 13 8 15.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Compact dual bar: track + calculator entry. */
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
    if (from.trim()) params.set("from", from.trim());
    if (to.trim()) params.set("to", to.trim());
    const qs = params.toString();
    router.push(
      `${localePath(locale, "/calculator/")}${qs ? `?${qs}` : ""}`,
    );
  };

  return (
    <section className={homeActionBar} aria-label={copy.home.quoteTitle}>
      <PageContainer className={homeActionGrid}>
        <div className={homeActionPane}>
          <ParcelIcon className={homeActionIcon} />
          <div className={homeActionBody}>
            <h2 className={homeActionLabel}>{copy.home.trackTitle}</h2>
            <form
              className={homeActionRow}
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
              <button type="submit" className={homeActionBtn}>
                {copy.ui.track}
              </button>
            </form>
          </div>
        </div>

        <div className={homeActionDivider} aria-hidden />
        <div
          className="h-px w-full bg-white/25 lg:hidden"
          aria-hidden
        />

        <div className={homeActionPane}>
          <CalcIcon className={homeActionIcon} />
          <div className={homeActionBody}>
            <h2 className={homeActionLabel}>{copy.home.quoteTitle}</h2>
            <form
              className={homeActionRow}
              onSubmit={(e) => {
                e.preventDefault();
                submitQuote();
              }}
            >
              <div className="flex min-w-0 flex-1 items-center gap-1.5 sm:gap-2">
                <label className="sr-only" htmlFor="home-action-from">
                  {copy.home.quoteFrom}
                </label>
                <input
                  id="home-action-from"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  placeholder={copy.home.quoteFrom}
                  className={homeActionField}
                  autoComplete="address-level2"
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
                <input
                  id="home-action-to"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  placeholder={copy.home.quoteTo}
                  className={homeActionField}
                  autoComplete="address-level2"
                />
              </div>
              <button type="submit" className={homeActionBtn}>
                {copy.home.quoteCta}
              </button>
            </form>
            <p className={homeActionNote}>{copy.home.quoteNote}</p>
          </div>
        </div>
      </PageContainer>
    </section>
  );
}
