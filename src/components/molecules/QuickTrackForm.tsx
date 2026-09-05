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
  homeTrackCard,
} from "@/styles/ui";

export function QuickTrackForm({
  locale,
  copy,
  variant = "default",
}: {
  locale: Locale;
  copy: SiteCopy;
  variant?: "default" | "hero" | "card";
}) {
  const router = useRouter();
  const [value, setValue] = useState("");
  const stacked = variant === "hero" || variant === "card";

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
        "flex w-full items-center gap-2",
        variant === "card"
          ? "flex-row"
          : stacked
            ? "flex-col sm:flex-row sm:gap-3"
            : "flex-wrap gap-3",
      )}
    >
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={copy.home.trackPlaceholder}
        aria-label={copy.home.trackPlaceholder}
        className={cn(
          fieldControl,
          "min-w-0 flex-1 !py-2.5 placeholder:text-black/40",
          !stacked && "flex-[1_1_12rem]",
        )}
      />
      <Button
        type="submit"
        variant={stacked ? "heroSecondary" : "primary"}
        className="!min-h-11 shrink-0 !px-4 !py-2.5 text-sm"
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
        <p className="mt-3 text-sm text-black/60">{copy.home.trackHint}</p>
      </div>
    );
  }

  if (variant === "card") {
    return (
      <div className={homeTrackCard}>
        <h2 className={homeHeroTrackerTitle}>{copy.home.trackTitle}</h2>
        {form}
        <p className="mt-2 text-xs text-black/50 sm:text-sm">{copy.home.trackHint}</p>
      </div>
    );
  }

  return form;
}
