"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/i18n/config";
import { localePath } from "@/i18n/paths";
import type { SiteCopy } from "@/data/types";
import { trackEvent } from "@/lib/analytics/events";
import { Button } from "@/components/atoms/Button";
import { cn } from "@/lib/cn";
import {
  fieldControl,
  homeHeroTracker,
  homeHeroTrackerTitle,
} from "@/styles/ui";

export function QuickTrackForm({
  locale,
  copy,
  variant = "default",
}: {
  locale: Locale;
  copy: SiteCopy;
  variant?: "default" | "hero";
}) {
  const router = useRouter();
  const [value, setValue] = useState("");

  const form = (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const number = value.trim();
        trackEvent("track_search_start");
        router.push(
          `${localePath(locale, "/tracking/")}?number=${encodeURIComponent(number)}`,
        );
      }}
      className={cn(
        "flex w-full gap-4",
        variant === "hero"
          ? "flex-col sm:flex-row sm:items-center"
          : "flex-wrap",
      )}
    >
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={copy.home.trackPlaceholder}
        aria-label={copy.home.trackPlaceholder}
        className={cn(
          fieldControl,
          "min-w-0",
          variant === "hero"
            ? "flex-1 placeholder:text-black/40"
            : "flex-[1_1_12rem]",
        )}
      />
      <Button
        type="submit"
        variant={variant === "hero" ? "heroSecondary" : "primary"}
        className="shrink-0"
      >
        {copy.ui.track}
      </Button>
    </form>
  );

  if (variant === "hero") {
    return (
      <div className={homeHeroTracker}>
        <h2 className={homeHeroTrackerTitle}>{copy.home.trackTitle}</h2>
        {form}
        <p className="mt-4 text-base text-black/60">{copy.home.trackHint}</p>
      </div>
    );
  }

  return form;
}
