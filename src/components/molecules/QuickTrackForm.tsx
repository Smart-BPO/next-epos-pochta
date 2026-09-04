"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/i18n/config";
import { localePath } from "@/i18n/paths";
import type { SiteCopy } from "@/data/types";
import { trackEvent } from "@/lib/analytics/events";
import { Button } from "@/components/atoms/Button";

export function QuickTrackForm({
  locale,
  copy,
}: {
  locale: Locale;
  copy: SiteCopy;
}) {
  const router = useRouter();
  const [value, setValue] = useState("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const number = value.trim();
        trackEvent("track_search_start");
        router.push(
          `${localePath(locale, "/tracking/")}?number=${encodeURIComponent(number)}`,
        );
      }}
      style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}
    >
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={copy.home.trackPlaceholder}
        aria-label={copy.home.trackPlaceholder}
        style={{
          flex: "1 1 12rem",
          minHeight: "var(--tap-min)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-md)",
          padding: "0.65rem 0.85rem",
        }}
      />
      <Button type="submit">{copy.ui.track}</Button>
    </form>
  );
}
