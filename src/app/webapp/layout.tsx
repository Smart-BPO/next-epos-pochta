import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { TelegramProvider } from "@/components/webapp/TelegramProvider";
import { SITE_CONFIG } from "@/utils/consts";

export const metadata: Metadata = {
  title: "EPOS POCHTA WebApp",
  description: "Telegram Mini App — kontakt va joʻnatma soʻrovi",
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
};

export const viewport: Viewport = {
  themeColor: SITE_CONFIG.themeColor,
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function WebAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Script
        src="https://telegram.org/js/telegram-web-app.js"
        strategy="beforeInteractive"
      />
      <TelegramProvider>{children}</TelegramProvider>
    </>
  );
}
