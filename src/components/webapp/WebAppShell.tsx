"use client";

import Image from "next/image";
import { getWebAppCopy } from "@/data/webapp-copy";
import { useTelegram } from "@/components/webapp/TelegramProvider";
import { WebAppTabBar } from "@/components/webapp/WebAppTabBar";
import { SITE_CONFIG } from "@/utils/consts";

export function WebAppShell({ children }: { children: React.ReactNode }) {
  const { locale, setLocale } = useTelegram();
  const copy = getWebAppCopy(locale);

  return (
    <div className="flex min-h-dvh flex-col bg-[linear-gradient(180deg,#fff5f5_0%,#ffffff_22%,#ffffff_100%)]">
      <header className="sticky top-0 z-10 border-b border-black/8 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-md items-center justify-between gap-3 px-4 py-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <Image
              src="/images/brand/logo.svg"
              alt={SITE_CONFIG.name}
              width={72}
              height={28}
              unoptimized
              priority
            />
            <span className="truncate text-[0.65rem] font-semibold uppercase tracking-wide text-black/35">
              {copy.brand}
            </span>
          </div>
          <div className="flex overflow-hidden rounded-full border border-black/10 text-xs font-semibold">
            <button
              type="button"
              className={`px-2.5 py-1 ${locale === "uz" ? "bg-primary text-white" : "bg-white text-black/55"}`}
              onClick={() => setLocale("uz")}
            >
              UZ
            </button>
            <button
              type="button"
              className={`px-2.5 py-1 ${locale === "ru" ? "bg-primary text-white" : "bg-white text-black/55"}`}
              onClick={() => setLocale("ru")}
            >
              RU
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-md flex-1 px-4 py-5 pb-3">
        {children}
      </main>

      <WebAppTabBar />
    </div>
  );
}
