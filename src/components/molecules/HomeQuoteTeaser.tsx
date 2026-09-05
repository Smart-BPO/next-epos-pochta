"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/i18n/config";
import { localePath } from "@/i18n/paths";
import type { SiteCopy } from "@/data/types";
import { trackEvent } from "@/lib/analytics/events";
import { Button } from "@/components/atoms/Button";
import {
  homeHeroTrackerTitle,
  homeQuoteCard,
  homeQuoteField,
  homeQuoteRow,
} from "@/styles/ui";

function SwapIcon() {
  return (
    <svg
      width="20"
      height="20"
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

/** Route A→B teaser — redirects to lead form, never auto-prices. */
export function HomeQuoteTeaser({
  locale,
  copy,
}: {
  locale: Locale;
  copy: SiteCopy;
}) {
  const router = useRouter();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const submit = () => {
    trackEvent("request_price_start", { source: "home_quote" });
    const params = new URLSearchParams();
    if (from.trim()) params.set("from", from.trim());
    if (to.trim()) params.set("to", to.trim());
    const qs = params.toString();
    router.push(
      `${localePath(locale, "/request-price/")}${qs ? `?${qs}` : ""}`,
    );
  };

  return (
    <div className={homeQuoteCard}>
      <h2 className={homeHeroTrackerTitle}>{copy.home.quoteTitle}</h2>
      <form
        className={homeQuoteRow}
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <label className="sr-only" htmlFor="home-quote-from">
            {copy.home.quoteFrom}
          </label>
          <input
            id="home-quote-from"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            placeholder={copy.home.quoteFrom}
            className={homeQuoteField}
            autoComplete="address-level2"
          />

          <button
            type="button"
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-black/10 text-black/60 transition-colors hover:border-black/20 hover:text-black"
            aria-label={copy.home.quoteSwap}
            onClick={() => {
              setFrom(to);
              setTo(from);
            }}
          >
            <SwapIcon />
          </button>

          <label className="sr-only" htmlFor="home-quote-to">
            {copy.home.quoteTo}
          </label>
          <input
            id="home-quote-to"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder={copy.home.quoteTo}
            className={homeQuoteField}
            autoComplete="address-level2"
          />
        </div>

        <Button
          type="submit"
          variant="heroPrimary"
          className="w-full shrink-0 !min-h-11 !px-5 !py-2.5 text-sm lg:w-auto"
        >
          {copy.home.quoteCta}
        </Button>
      </form>
      <p className="mt-2 m-0 text-xs text-black/50 sm:text-sm lg:mt-3">
        {copy.home.quoteNote}
      </p>
    </div>
  );
}
