"use client";

import { useState } from "react";
import type { Locale } from "@/i18n/config";
import type { SiteCopy } from "@/data/types";
import { uzbekistanCities } from "@/data/types";

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
    <div className="card" style={{ maxWidth: "36rem" }}>
      <label className="field">
        <span>{copy.home.geoSearchPlaceholder}</span>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={copy.home.geoSearchPlaceholder}
        />
      </label>
      {!query.trim() || matches.length === 0 ? (
        <p className="hint">{copy.home.geoEmpty}</p>
      ) : (
        <ul style={{ margin: 0, paddingLeft: "1.1rem" }}>
          {matches.slice(0, 8).map((city) => (
            <li key={city.id} style={{ marginBottom: "0.5rem" }}>
              <strong>{locale === "uz" ? city.uz : city.ru}</strong>
              <div className="hint">{copy.home.geoAvailable}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
