"use client";

import Image from "next/image";
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
      className="fixed right-[max(1rem,var(--page-padding))] bottom-[calc(0.75rem+var(--sticky-cta-height)+env(safe-area-inset-bottom))] z-30 flex flex-col gap-2.5 md:bottom-6"
      aria-label="Quick contact"
    >
      <a
        href={`tel:${SITE_CONFIG.phone}`}
        onClick={() => trackEvent("contact_tel_click", { source: "floating" })}
        aria-label={phoneLabel}
        className="grid size-12 place-items-center rounded-full bg-primary text-white shadow-[0_8px_20px_rgb(211_2_3/0.28)] transition-transform hover:-translate-y-0.5"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M6.6 10.8c1.5 3 3.6 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1.1-.2 1.2.4 2.5.6 3.8.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.6.6 3.8.1.4 0 .8-.3 1.1L6.6 10.8z"
            fill="currentColor"
          />
        </svg>
      </a>
      {SITE_CONFIG.telegramUrl ? (
        <a
          href={SITE_CONFIG.telegramUrl}
          target="_blank"
          rel="noreferrer"
          aria-label={telegramLabel}
          className="grid size-12 place-items-center rounded-full bg-telegram text-white shadow-[0_8px_20px_rgb(34_158_217/0.28)] transition-transform hover:-translate-y-0.5"
          onClick={() =>
            trackEvent("contact_telegram_click", { source: "floating" })
          }
        >
          <Image
            src="/images/brand/icon-telegram.svg"
            alt=""
            width={22}
            height={22}
            unoptimized
            className="brightness-0 invert"
          />
        </a>
      ) : null}
    </div>
  );
}
