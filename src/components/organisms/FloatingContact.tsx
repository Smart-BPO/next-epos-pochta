"use client";

import { SITE_CONFIG } from "@/utils/consts";
import { trackEvent } from "@/lib/analytics/events";

export function FloatingContact({
  phoneLabel,
  telegramLabel,
}: {
  phoneLabel: string;
  telegramLabel: string;
}) {
  return (
    <div
      className="fixed right-4 bottom-[calc(1rem+var(--sticky-cta-height))] z-30 grid gap-2 md:bottom-4"
      aria-label="Quick contact"
    >
      <a
        href={`tel:${SITE_CONFIG.phone}`}
        onClick={() => trackEvent("contact_tel_click", { source: "floating" })}
        className="grid min-h-[var(--tap-min)] min-w-[var(--tap-min)] place-items-center rounded-[0.65rem] bg-primary px-3.5 text-[0.8rem] font-bold text-white shadow-md"
      >
        {phoneLabel}
      </a>
      {SITE_CONFIG.telegramUrl ? (
        <a
          href={SITE_CONFIG.telegramUrl}
          target="_blank"
          rel="noreferrer"
          className="grid min-h-[var(--tap-min)] min-w-[var(--tap-min)] place-items-center rounded-[0.65rem] bg-telegram px-3.5 text-[0.8rem] font-bold text-white shadow-md"
          onClick={() =>
            trackEvent("contact_telegram_click", { source: "floating" })
          }
        >
          {telegramLabel}
        </a>
      ) : null}
    </div>
  );
}
