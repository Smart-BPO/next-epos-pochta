"use client";

import Image from "next/image";
import { getWebAppCopy } from "@/data/webapp-copy";
import { useTelegram } from "@/components/webapp/TelegramProvider";
import { Button } from "@/components/atoms/Button";
import { SITE_CONFIG } from "@/utils/consts";

const BOT_URL = "https://t.me/epos_pochta_bot";

export function WebAppAccessBlocked() {
  const { locale, webApp } = useTelegram();
  const copy = getWebAppCopy(locale);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-white px-6 text-center">
      <Image
        src="/images/brand/logo.svg"
        alt={SITE_CONFIG.name}
        width={96}
        height={36}
        unoptimized
        priority
      />
      <h1 className="m-0 mt-6 font-display text-2xl font-semibold uppercase tracking-[-0.03em] text-black">
        {copy.blockedTitle}
      </h1>
      <p className="m-0 mt-3 max-w-sm text-sm leading-relaxed text-black/55">
        {copy.blockedLead}
      </p>
      <Button
        type="button"
        variant="telegram"
        className="mt-6"
        onClick={() => {
          if (webApp?.openTelegramLink) {
            webApp.openTelegramLink(BOT_URL);
          } else {
            window.open(BOT_URL, "_blank", "noopener,noreferrer");
          }
        }}
      >
        {copy.blockedCta}
      </Button>
    </div>
  );
}
