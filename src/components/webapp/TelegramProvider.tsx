"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Locale } from "@/i18n/config";
import {
  detectWebAppLocale,
  getTelegramWebApp,
  telegramUserSnapshot,
} from "@/lib/webapp/telegram";
import type { TelegramUser, TelegramWebApp } from "@/lib/webapp/telegram-types";
import { SITE_CONFIG } from "@/utils/consts";

type TelegramContextValue = {
  ready: boolean;
  isTelegram: boolean;
  locale: Locale;
  setLocale: (locale: Locale) => void;
  webApp: TelegramWebApp | null;
  user: TelegramUser | null;
  userSnapshot: ReturnType<typeof telegramUserSnapshot>;
  initData: string;
};

const TelegramContext = createContext<TelegramContextValue | null>(null);

export function TelegramProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [locale, setLocale] = useState<Locale>("uz");
  const [webApp, setWebApp] = useState<TelegramWebApp | null>(null);

  useEffect(() => {
    const boot = () => {
      const tg = getTelegramWebApp();
      setWebApp(tg);
      setLocale(detectWebAppLocale("uz"));
      if (tg) {
        try {
          tg.ready();
          tg.expand();
          tg.setHeaderColor(SITE_CONFIG.themeColor);
          tg.setBackgroundColor("#ffffff");
        } catch {
          // Older clients may miss setters.
        }
      }
      setReady(true);
    };

    // Script may load after first paint.
    if (getTelegramWebApp()) {
      boot();
      return;
    }
    const timer = window.setTimeout(boot, 120);
    return () => window.clearTimeout(timer);
  }, []);

  const value = useMemo<TelegramContextValue>(() => {
    const user = webApp?.initDataUnsafe?.user ?? null;
    return {
      ready,
      isTelegram: Boolean(webApp?.initData),
      locale,
      setLocale,
      webApp,
      user,
      userSnapshot: telegramUserSnapshot(user),
      initData: webApp?.initData ?? "",
    };
  }, [ready, locale, webApp]);

  return (
    <TelegramContext.Provider value={value}>{children}</TelegramContext.Provider>
  );
}

export function useTelegram() {
  const ctx = useContext(TelegramContext);
  if (!ctx) {
    throw new Error("useTelegram must be used within TelegramProvider");
  }
  return ctx;
}
