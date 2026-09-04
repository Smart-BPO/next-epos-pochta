import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
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

export async function generateMetadata(): Promise<Metadata> {
  return {
    ...rootMetadata,
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
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const htmlLangHeader = (await headers()).get("x-html-lang");
  const lang = htmlLangHeader === "ru" ? "ru" : "uz";

  return (
    <html lang={lang} className={manrope.variable} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body
        className="antialiased has-sticky-cta"
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <JsonLd data={getGlobalJsonLdGraph()} />
        {children}
        <SiteAnalytics />
        <AppToaster />
      </body>
    </html>
  );
}
