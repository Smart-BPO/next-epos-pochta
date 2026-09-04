"use client";

import { useState } from "react";
import type { Locale } from "@/i18n/config";
import type { SiteCopy } from "@/data/types";
import { uzbekistanCities } from "@/data/types";
import { Button } from "@/components/atoms/Button";
import { fieldControl, fieldHint } from "@/styles/ui";

export function GeoSearch({
  locale,
  copy,
  variant = "default",
}: {
  locale: Locale;
  copy: SiteCopy;
  variant?: "default" | "home";
}) {
  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState("");
  const activeQuery = variant === "home" ? submitted : query;
  const matches = uzbekistanCities.filter((c) => {
    const label = locale === "uz" ? c.uz : c.ru;
    return label.toLowerCase().includes(activeQuery.trim().toLowerCase());
  });

  if (variant === "home") {
    return (
      <div className="w-full max-w-[29.5rem] rounded-3xl border border-black/20 bg-white p-[var(--card-pad)]">
        <form
          className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            setSubmitted(query);
          }}
        >
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={copy.home.geoSearchPlaceholder}
            aria-label={copy.home.geoSearchPlaceholder}
            className={`${fieldControl} min-w-0 flex-1 placeholder:text-black/40`}
          />
          <Button type="submit" variant="secondary" className="w-full shrink-0 sm:w-auto">
            {copy.ui.geoCheck}
          </Button>
        </form>
        {!activeQuery.trim() || matches.length === 0 ? (
          <p className="mt-4 text-base text-black/60">{copy.home.geoEmpty}</p>
        ) : (
          <ul className="mt-4 m-0 list-none space-y-3 p-0">
            {matches.slice(0, 6).map((city) => (
              <li key={city.id}>
                <strong className="text-black">
                  {locale === "uz" ? city.uz : city.ru}
                </strong>
                <p className="m-0 text-sm text-black/60">{copy.home.geoAvailable}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-xl rounded-lg border border-border bg-surface p-5 shadow-sm">
      <label className="mb-4 grid gap-1.5">
        <span className="text-[0.92rem] font-semibold text-ink">
          {copy.home.geoSearchPlaceholder}
        </span>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={copy.home.geoSearchPlaceholder}
          className={fieldControl}
        />
      </label>
      {!query.trim() || matches.length === 0 ? (
        <p className={fieldHint}>{copy.home.geoEmpty}</p>
      ) : (
        <ul className="m-0 list-disc pl-[1.1rem]">
          {matches.slice(0, 8).map((city) => (
            <li key={city.id} className="mb-2">
              <strong>{locale === "uz" ? city.uz : city.ru}</strong>
              <div className={fieldHint}>{copy.home.geoAvailable}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
