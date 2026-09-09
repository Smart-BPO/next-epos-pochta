"use client";

import { useEffect, useRef } from "react";
import { useTelegram } from "@/components/webapp/TelegramProvider";

/** Show Telegram BackButton while `active`; hide on root tabs. */
export function useTelegramBackButton(active: boolean, onBack: () => void) {
  const { webApp } = useTelegram();
  const onBackRef = useRef(onBack);
  onBackRef.current = onBack;

  useEffect(() => {
    const btn = webApp?.BackButton;
    if (!btn) return;

    if (!active) {
      btn.hide();
      return;
    }

    const handler = () => onBackRef.current();
    btn.onClick(handler);
    btn.show();
    return () => {
      btn.offClick(handler);
      btn.hide();
    };
  }, [active, webApp]);
}
