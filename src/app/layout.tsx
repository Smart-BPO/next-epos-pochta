import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import type { Locale } from "@/i18n/config";
import { manrope } from "@/assets/fonts";
import "./globals.css";
import { SiteAnalytics } from "@/components/analytics/SiteAnalytics";
import { JsonLd } from "@/components/seo/JsonLd";
import { AppToaster } from "@/components/providers/AppToaster";
import { rootMetadata } from "@/utils/seo/metadata";
import { getGlobalJsonLdGraph } from "@/utils/seo/json-ld";
import { SITE_CONFIG } from "@/utils/consts";

export const viewport: Viewport = {
  themeColor: SITE_CONFIG.themeColor,
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  ...rootMetadata,
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  manifest: "/manifest.json",
  other: {
    ...(typeof rootMetadata.other === "object" && rootMetadata.other
      ? rootMetadata.other
      : {}),
    "theme-color": SITE_CONFIG.themeColor,
    ...(SITE_CONFIG.seo.googleSiteVerification
      ? {
          "google-site-verification":
            SITE_CONFIG.seo.googleSiteVerification,
        }
      : {}),
    ...(SITE_CONFIG.seo.yandexSiteVerification
      ? { "yandex-verification": SITE_CONFIG.seo.yandexSiteVerification }
      : {}),
  },
};

function localeFromHtmlLang(value: string | null): Locale {
  if (value === "ru") return "ru";
  if (value === "zh-Hans" || value === "zh") return "zh";
  return "uz";
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headerLang = (await headers()).get("x-html-lang");
  const locale = localeFromHtmlLang(headerLang);
  const lang = headerLang === "zh-Hans" || locale === "zh" ? "zh-Hans" : locale;

  return (
    <html
      lang={lang}
      className={`${manrope.variable} scroll-smooth scroll-pt-[var(--header-height)]`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html:
              '(function(){try{var p=location.pathname;var lang="uz";if(p==="/ru"||p.indexOf("/ru/")===0)lang="ru";else if(p==="/zh"||p.indexOf("/zh/")===0)lang="zh-Hans";document.documentElement.lang=lang}catch(e){}})();',
          }}
        />
      </head>
      <body
        className="flex min-h-dvh flex-col bg-white font-sans text-ink antialiased"
      >
        <JsonLd data={getGlobalJsonLdGraph(locale)} />
        {children}
        <SiteAnalytics />
        <AppToaster />
      </body>
    </html>
  );
}
