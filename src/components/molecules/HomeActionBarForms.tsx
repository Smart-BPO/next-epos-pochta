"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/i18n/config";
import { localePath } from "@/i18n/paths";
import type { SiteCopy } from "@/data/types";
import {
  getSettlementById,
  settlementLabel,
  uzbekistanHubSettlements,
} from "@/data/settlements";
import { Button } from "@/components/atoms/Button";
import { trackEvent } from "@/lib/analytics/events";
import {
  homeActionButton,
  homeActionControls,
  homeActionField,
  homeActionRow,
  homeActionSwap,
} from "@/styles/ui";
import { cn } from "@/lib/cn";

function SwapIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      xmlns="http://www.w3.org/2000/svg"
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

const homeActionSelect = cn(
  homeActionField,
  "appearance-none bg-[length:1rem] bg-[right_0.75rem_center] bg-no-repeat pr-9",
  "bg-[url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")]",
);

export function HomeTrackForm({
  locale,
  copy,
}: {
  locale: Locale;
  copy: SiteCopy;
}) {
  const router = useRouter();
  const [trackNumber, setTrackNumber] = useState("");

  return (
    <form
      className={homeActionControls}
      onSubmit={(e) => {
        e.preventDefault();
        const number = trackNumber.trim();
        trackEvent("track_search_start");
        router.push(
          `${localePath(locale, "/tracking/")}?number=${encodeURIComponent(number)}`,
        );
      }}
    >
      <label className="sr-only" htmlFor="home-action-track">
        {copy.home.trackPlaceholder}
      </label>
      <input
        id="home-action-track"
        name="track_number"
        value={trackNumber}
        onChange={(e) => setTrackNumber(e.target.value)}
        placeholder={copy.home.trackPlaceholder}
        className={homeActionField}
        autoComplete="off"
      />
      <Button
        type="submit"
        variant="secondary"
        size="sm"
        width="mobile"
        className={homeActionButton}
      >
        {copy.ui.track}
      </Button>
    </form>
  );
}

export function HomeQuoteForm({
  locale,
  copy,
}: {
  locale: Locale;
  copy: SiteCopy;
}) {
  const router = useRouter();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const hubs = uzbekistanHubSettlements;

  return (
    <form
      className={homeActionControls}
      onSubmit={(e) => {
        e.preventDefault();
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
      }}
    >
      <div className={homeActionRow}>
        <label className="sr-only" htmlFor="home-action-from">
          {copy.home.quoteFrom}
        </label>
        <select
          id="home-action-from"
          name="from"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          className={cn(homeActionSelect, "min-w-0 flex-1")}
        >
          <option value="">{copy.home.quoteFrom}</option>
          {hubs.map((s) => (
            <option key={s.id} value={s.id}>
              {settlementLabel(s, locale)}
            </option>
          ))}
        </select>
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
        <select
          id="home-action-to"
          name="to"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className={cn(homeActionSelect, "min-w-0 flex-1")}
        >
          <option value="">{copy.home.quoteTo}</option>
          {hubs.map((s) => (
            <option key={s.id} value={s.id}>
              {settlementLabel(s, locale)}
            </option>
          ))}
        </select>
      </div>
      <Button
        type="submit"
        variant="primary"
        size="sm"
        width="mobile"
        className={homeActionButton}
      >
        {copy.home.quoteCta}
      </Button>
    </form>
  );
}
