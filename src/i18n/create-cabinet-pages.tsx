import { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import type { Locale } from "@/i18n/config";
import { ogLocale } from "@/i18n/config";
import { getLocalizedAlternates, localePath } from "@/i18n/paths";
import { cabinetCopy } from "@/data/cabinet";
import { createPageMetadata } from "@/utils/seo/metadata";
import { CabinetShell } from "@/views/cabinet/CabinetShell";
import {
  CabinetNewView,
  CabinetProfileView,
  CabinetShipmentView,
  CabinetShipmentsView,
  CabinetTrackingView,
} from "@/views/cabinet/CabinetViews";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const LEGACY_TABS: Record<string, string> = {
  new: "new/",
  profile: "profile/",
};

export function createCabinetPages(locale: Locale) {
  const href = (sub = "") => localePath(locale, `/cabinet/${sub}`);

  return {
    generateMetadata(): Metadata {
      const copy = cabinetCopy(locale);
      return createPageMetadata(
        copy.metaTitle,
        copy.metaDescription,
        href(),
        {
          alternates: getLocalizedAlternates("/cabinet/"),
          ogLocale: ogLocale[locale],
          noIndex: true,
        },
      );
    },

    Layout: function CabinetLayout({
      children,
    }: {
      children: React.ReactNode;
    }) {
      return <CabinetShell locale={locale}>{children}</CabinetShell>;
    },

    ShipmentsPage: async function CabinetShipmentsPage({
      searchParams,
    }: {
      searchParams: SearchParams;
    }) {
      const sp = await searchParams;
      const tab = typeof sp.tab === "string" ? LEGACY_TABS[sp.tab] : undefined;
      if (tab) {
        const rest = new URLSearchParams();
        for (const [key, value] of Object.entries(sp)) {
          if (key !== "tab" && typeof value === "string") rest.set(key, value);
        }
        const qs = rest.toString();
        redirect(`${href(tab)}${qs ? `?${qs}` : ""}`);
      }
      return <CabinetShipmentsView />;
    },

    ShipmentPage: async function CabinetShipmentPage({
      params,
    }: {
      params: Promise<{ tracking: string }>;
    }) {
      const { tracking } = await params;
      return <CabinetShipmentView tracking={decodeURIComponent(tracking)} />;
    },

    NewPage: function CabinetNewPage() {
      return (
        <Suspense fallback={null}>
          <CabinetNewView />
        </Suspense>
      );
    },

    TrackingPage: function CabinetTrackingPage() {
      return (
        <Suspense fallback={null}>
          <CabinetTrackingView />
        </Suspense>
      );
    },

    ProfilePage: function CabinetProfilePage() {
      return <CabinetProfileView />;
    },
  };
}
