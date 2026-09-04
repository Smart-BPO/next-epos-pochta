"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/i18n/config";
import { localePath } from "@/i18n/paths";
import type { SiteCopy } from "@/data/types";
import { trackEvent } from "@/lib/analytics/events";
import { Button } from "@/components/atoms/Button";
import { fieldControl } from "@/styles/ui";

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
      className="flex flex-wrap gap-3"
    >
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={copy.home.trackPlaceholder}
        aria-label={copy.home.trackPlaceholder}
        className={`${fieldControl} min-w-0 flex-[1_1_12rem]`}
      />
      <Button type="submit">{copy.ui.track}</Button>
    </form>
  );
}
