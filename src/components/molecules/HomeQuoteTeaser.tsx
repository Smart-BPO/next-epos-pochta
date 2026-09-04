"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/i18n/config";
import { localePath } from "@/i18n/paths";
import type { SiteCopy } from "@/data/types";
import { trackEvent } from "@/lib/analytics/events";
import { Button } from "@/components/atoms/Button";
import {
  field,
  fieldControl,
  fieldLabel,
  homeHeroTrackerTitle,
  homeQuoteCard,
} from "@/styles/ui";

/** Visual quote card from Figma mobile — redirects to lead form, never auto-prices. */
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
  const [weight, setWeight] = useState("");

  return (
    <div className={homeQuoteCard}>
      <h2 className={homeHeroTrackerTitle}>{copy.home.quoteTitle}</h2>
      <form
        className="grid gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          trackEvent("request_price_start");
          const params = new URLSearchParams();
          if (from.trim()) params.set("from", from.trim());
          if (to.trim()) params.set("to", to.trim());
          if (weight.trim()) params.set("weight", weight.trim());
          const qs = params.toString();
          router.push(
            `${localePath(locale, "/request-price/")}${qs ? `?${qs}` : ""}`,
          );
        }}
      >
        <label className={field}>
          <span className={fieldLabel}>{copy.home.quoteFrom}</span>
          <input
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className={fieldControl}
            autoComplete="address-level2"
          />
        </label>
        <label className={field}>
          <span className={fieldLabel}>{copy.home.quoteTo}</span>
          <input
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className={fieldControl}
            autoComplete="address-level2"
          />
        </label>
        <label className={field}>
          <span className={fieldLabel}>{copy.home.quoteWeight}</span>
          <input
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className={fieldControl}
            inputMode="decimal"
          />
        </label>
        <p className="m-0 text-sm text-black/60">{copy.home.quoteNote}</p>
        <Button type="submit" variant="heroPrimary" className="w-full">
          {copy.ui.requestPrice}
        </Button>
      </form>
    </div>
  );
}
