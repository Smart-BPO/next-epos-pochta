"use client";

import { useState } from "react";
import type { Locale } from "@/i18n/config";
import { getContent } from "@/i18n/get-content";
import { SITE_CONFIG } from "@/utils/consts";
import { Button } from "@/components/atoms/Button";
import { PageContainer } from "@/components/atoms/PageContainer";
import { trackEvent } from "@/lib/analytics/events";

export function TrackingPageView({
  locale,
  initialNumber = "",
}: {
  locale: Locale;
  initialNumber?: string;
}) {
  const copy = getContent(locale);
  const [number, setNumber] = useState(initialNumber);
  const [submitted, setSubmitted] = useState(Boolean(initialNumber));

  return (
    <section className="section">
      <PageContainer>
        <h1 className="section-title">{copy.tracking.title}</h1>
        <p className="section-lead">{copy.tracking.lead}</p>

        <form
          className="card"
          style={{ maxWidth: "36rem", marginBottom: "1.25rem" }}
          onSubmit={(e) => {
            e.preventDefault();
            setSubmitted(true);
            trackEvent("track_search_submit");
            // TODO(tracking-api): call EPOS tracking API
          }}
        >
          <div className="field">
            <label htmlFor="track-number">{copy.tracking.placeholder}</label>
            <input
              id="track-number"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              placeholder={copy.tracking.placeholder}
            />
          </div>
          <Button type="submit">{copy.ui.track}</Button>
        </form>

        {!submitted || !number.trim() ? (
          <div className="alert alert-info">{copy.tracking.emptyHint}</div>
        ) : (
          <div className="alert alert-warning" role="status">
            <strong>{copy.tracking.unavailableTitle}</strong>
            <p>{copy.tracking.unavailableText}</p>
            <p>
              <a href={`tel:${SITE_CONFIG.phone}`}>{SITE_CONFIG.phoneDisplay}</a>
            </p>
          </div>
        )}
      </PageContainer>
    </section>
  );
}
