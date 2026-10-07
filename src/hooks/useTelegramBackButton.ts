"use client";

import { useEffect, useEffectEvent } from "react";
import { useTelegram } from "@/components/webapp/TelegramProvider";

/** Show Telegram BackButton while `active`; hide on root tabs. */
export function useTelegramBackButton(active: boolean, onBack: () => void) {
  const { webApp } = useTelegram();
  const handleBack = useEffectEvent(() => onBack());

  useEffect(() => {
    const btn = webApp?.BackButton;
    if (!btn) return;

    if (!active) {
      btn.hide();
      return;
    }

    const handler = () => handleBack();
    btn.onClick(handler);
    btn.show();
    return () => {
      btn.offClick(handler);
      btn.hide();
    };
  }, [active, webApp]);
}
