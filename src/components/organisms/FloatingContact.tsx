"use client";

import { SITE_CONFIG } from "@/utils/consts";

export function FloatingContact({
  phoneLabel,
  telegramLabel,
}: {
  phoneLabel: string;
  telegramLabel: string;
}) {
  return (
    <div className="floating-contact" aria-label="Quick contact">
      <a href={`tel:${SITE_CONFIG.phone}`}>{phoneLabel}</a>
      {SITE_CONFIG.telegramUrl ? (
        <a
          href={SITE_CONFIG.telegramUrl}
          target="_blank"
          rel="noreferrer"
          style={{ background: "#229ED9" }}
        >
          {telegramLabel}
        </a>
      ) : null}
    </div>
  );
}
