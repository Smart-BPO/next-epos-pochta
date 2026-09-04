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
  homeQuoteSelect,
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
  const [category, setCategory] = useState("");

  const submit = () => {
    trackEvent("request_price_start", { source: "home_quote" });
    const params = new URLSearchParams();
    if (from.trim()) params.set("from", from.trim());
    if (to.trim()) params.set("to", to.trim());
    if (category) params.set("category", category);
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
          className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center self-center rounded-xl border border-black/10 text-black/60 transition-colors hover:border-black/20 hover:text-black"
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

        <label className="sr-only" htmlFor="home-quote-category">
          {copy.home.quoteCategory}
        </label>
        <select
          id="home-quote-category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className={`${homeQuoteSelect} bg-[url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%228%22 fill=%22none%22%3E%3Cpath d=%22M1 1.5 6 6.5 11 1.5%22 stroke=%22%23000%22 stroke-opacity=%22.4%22 stroke-width=%221.5%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22/%3E%3C/svg%3E')]`}
        >
          <option value="">{copy.home.quoteCategory}</option>
          {copy.home.needs.map((item) => (
            <option key={item.id} value={item.id}>
              {item.title}
            </option>
          ))}
        </select>

        <Button
          type="submit"
          variant="heroPrimary"
          className="w-full shrink-0 lg:w-auto"
        >
          {copy.home.quoteCta}
        </Button>
      </form>
      <p className="mt-3 m-0 text-sm text-black/50 lg:mt-4">{copy.home.quoteNote}</p>
    </div>
  );
}
