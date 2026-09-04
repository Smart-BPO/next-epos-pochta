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
    <div className="floating-contact" aria-label="Quick contact">
      <a
        href={`tel:${SITE_CONFIG.phone}`}
        onClick={() => trackEvent("contact_tel_click", { source: "floating" })}
      >
        {phoneLabel}
      </a>
      {SITE_CONFIG.telegramUrl ? (
        <a
          href={SITE_CONFIG.telegramUrl}
          target="_blank"
          rel="noreferrer"
          style={{ background: "#229ED9" }}
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
