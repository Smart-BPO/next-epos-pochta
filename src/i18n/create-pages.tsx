import { Suspense } from "react";
import type { Locale } from "@/i18n/config";
import { getLocalizedPageMetadata } from "@/i18n/metadata";
import { SiteLayout } from "@/components/templates/SiteLayout";
import { HomePageView } from "@/views/HomePageView";
import { ServicesPageView } from "@/views/ServicesPageView";
import { BusinessPageView } from "@/views/BusinessPageView";
import { TrackingPageView } from "@/views/TrackingPageView";
import { RequestPricePageView } from "@/views/RequestPricePageView";
import { AboutPageView } from "@/views/AboutPageView";
import { ContactsPageView } from "@/views/ContactsPageView";
import { PrivacyPageView, TermsPageView } from "@/views/LegalPageViews";

export function createHomePage(locale: Locale) {
  return {
    generateMetadata: () => getLocalizedPageMetadata(locale, "home"),
    Page: async function HomePage() {
      return (
        <SiteLayout locale={locale}>
          <HomePageView locale={locale} />
        </SiteLayout>
      );
    },
  };
}

export function createServicesPage(locale: Locale) {
  return {
    generateMetadata: () => getLocalizedPageMetadata(locale, "services"),
    Page: async function ServicesPage() {
      return (
        <SiteLayout locale={locale}>
          <ServicesPageView locale={locale} />
        </SiteLayout>
      );
    },
  };
}

export function createBusinessPage(locale: Locale) {
  return {
    generateMetadata: () => getLocalizedPageMetadata(locale, "business"),
    Page: async function BusinessPage() {
      return (
        <SiteLayout locale={locale}>
          <BusinessPageView locale={locale} />
        </SiteLayout>
      );
    },
  };
}

export function createTrackingPage(locale: Locale) {
  return {
    generateMetadata: () =>
      getLocalizedPageMetadata(locale, "tracking", { noIndex: true }),
    Page: async function TrackingPage({
      searchParams,
    }: {
      searchParams?: Promise<{ number?: string }>;
    }) {
      const params = searchParams ? await searchParams : {};
      return (
        <SiteLayout locale={locale}>
          <TrackingPageView
            locale={locale}
            initialNumber={params.number ?? ""}
          />
        </SiteLayout>
      );
    },
  };
}

export function createRequestPricePage(locale: Locale) {
  return {
    generateMetadata: () =>
      getLocalizedPageMetadata(locale, "requestPrice", { noIndex: true }),
    Page: async function RequestPricePage() {
      return (
        <SiteLayout locale={locale}>
          <Suspense fallback={<div className="section page-container">…</div>}>
            <RequestPricePageView locale={locale} />
          </Suspense>
        </SiteLayout>
      );
    },
  };
}

export function createAboutPage(locale: Locale) {
  return {
    generateMetadata: () => getLocalizedPageMetadata(locale, "about"),
    Page: async function AboutPage() {
      return (
        <SiteLayout locale={locale}>
          <AboutPageView locale={locale} />
        </SiteLayout>
      );
    },
  };
}

export function createContactsPage(locale: Locale) {
  return {
    generateMetadata: () => getLocalizedPageMetadata(locale, "contacts"),
    Page: async function ContactsPage() {
      return (
        <SiteLayout locale={locale}>
          <ContactsPageView locale={locale} />
        </SiteLayout>
      );
    },
  };
}

export function createPrivacyPage(locale: Locale) {
  return {
    generateMetadata: () => getLocalizedPageMetadata(locale, "privacy"),
    Page: async function PrivacyPage() {
      return (
        <SiteLayout locale={locale}>
          <PrivacyPageView locale={locale} />
        </SiteLayout>
      );
    },
  };
}

export function createTermsPage(locale: Locale) {
  return {
    generateMetadata: () => getLocalizedPageMetadata(locale, "terms"),
    Page: async function TermsPage() {
      return (
        <SiteLayout locale={locale}>
          <TermsPageView locale={locale} />
        </SiteLayout>
      );
    },
  };
}
