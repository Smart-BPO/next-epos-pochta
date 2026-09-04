"use client";

import { useState } from "react";
import type { Locale } from "@/i18n/config";
import type { SiteCopy } from "@/data/types";
import { uzbekistanCities } from "@/data/types";
import { card, field, fieldControl, fieldHint, fieldLabel } from "@/styles/ui";

export function GeoSearch({
  locale,
  copy,
}: {
  locale: Locale;
  copy: SiteCopy;
}) {
  const [query, setQuery] = useState("");
  const matches = uzbekistanCities.filter((c) => {
    const label = locale === "uz" ? c.uz : c.ru;
    return label.toLowerCase().includes(query.trim().toLowerCase());
  });

  return (
    <div className={`${card} max-w-xl`}>
      <label className={field}>
        <span className={fieldLabel}>{copy.home.geoSearchPlaceholder}</span>
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
