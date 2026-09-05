import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Locale } from "@/i18n/config";
import { ogLocale } from "@/i18n/config";
import { getLocalizedPageMetadata } from "@/i18n/metadata";
import { getNewsArticleMetadata } from "@/i18n/news-metadata";
import { getLocalizedAlternates, localePath } from "@/i18n/paths";
import { createPageMetadata, canonicalPageUrl } from "@/utils/seo/metadata";
import { SiteLayout } from "@/components/templates/SiteLayout";
import { HomePageView } from "@/views/HomePageView";
import { ServicesPageView } from "@/views/ServicesPageView";
import { BusinessPageView } from "@/views/BusinessPageView";
import { BusinessConnectPageView } from "@/views/BusinessConnectPageView";
import { TrackingPageView } from "@/views/TrackingPageView";
import { RequestPricePageView } from "@/views/RequestPricePageView";
import { CalculatorPageView } from "@/views/CalculatorPageView";
import { FaqPageView } from "@/views/FaqPageView";
import { AboutPageView } from "@/views/AboutPageView";
import { ContactsPageView } from "@/views/ContactsPageView";
import { NewsListPageView } from "@/views/NewsListPageView";
import { NewsArticlePageView } from "@/views/NewsArticlePageView";
import { PrivacyPageView, TermsPageView } from "@/views/LegalPageViews";
import {
  getNewsBySlug,
  listPublishedSlugs,
} from "@/lib/news/repository";
import {
  getDeliveryRoute,
  listDeliveryRouteParams,
  routeMetaDescription,
  routeMetaTitle,
  routePath,
} from "@/data/delivery-routes";
import { pageContainer, section } from "@/styles/ui";

const suspenseFallback = (
  <div className={`${section} ${pageContainer}`}>…</div>
);

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

export function createBusinessConnectPage(locale: Locale) {
  return {
    generateMetadata: () =>
      getLocalizedPageMetadata(locale, "businessConnect", { noIndex: true }),
    Page: async function BusinessConnectPage() {
      return (
        <SiteLayout locale={locale}>
          <BusinessConnectPageView locale={locale} />
        </SiteLayout>
      );
    },
  };
}

export function createTrackingPage(locale: Locale) {
  return {
    generateMetadata: () =>
      getLocalizedPageMetadata(locale, "tracking", { noIndex: true }),
    Page: async function TrackingPage() {
      // Read ?number= on the client — keeps the route statically prerenderable.
      return (
        <SiteLayout locale={locale}>
          <Suspense fallback={suspenseFallback}>
            <TrackingPageView locale={locale} />
          </Suspense>
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
          <Suspense fallback={suspenseFallback}>
            <RequestPricePageView locale={locale} />
          </Suspense>
        </SiteLayout>
      );
    },
  };
}

export function createCalculatorPage(locale: Locale) {
  return {
    generateMetadata: () => getLocalizedPageMetadata(locale, "calculator"),
    Page: async function CalculatorPage() {
      return (
        <SiteLayout locale={locale}>
          <Suspense fallback={suspenseFallback}>
            <CalculatorPageView locale={locale} />
          </Suspense>
        </SiteLayout>
      );
    },
  };
}

export function createDeliveryIndexPage(locale: Locale) {
  return {
    generateMetadata: async () => {
      const title =
        locale === "uz"
          ? "Yetkazib berish shaharlari"
          : "Доставка по городам Узбекистана";
      const description =
        locale === "uz"
          ? "EPOS POCHTA — Toshkent, Samarqand, Buxoro va boshqa shaharlarga kuryerlik yetkazib berish. Kalkulyator va menejer tasdigʻi."
          : "EPOS POCHTA — курьерская доставка в Ташкент, Самарканд, Бухару и другие города. Калькулятор и подтверждение менеджера.";
      const path = localePath(locale, "/delivery/");
      const alternates = getLocalizedAlternates("/delivery/");
      return createPageMetadata(title, description, path, {
        locale,
        ogLocale: ogLocale[locale],
        alternates: Object.fromEntries(
          Object.entries(alternates).map(([lang, href]) => [
            lang,
            canonicalPageUrl(href),
          ]),
        ),
      });
    },
    Page: async function DeliveryIndexPage() {
      const { DeliveryIndexPageView } = await import(
        "@/views/DeliveryCityPageView"
      );
      return (
        <SiteLayout locale={locale}>
          <DeliveryIndexPageView locale={locale} />
        </SiteLayout>
      );
    },
  };
}

export function createDeliveryRoutePage(locale: Locale) {
  return {
    generateStaticParams: () => listDeliveryRouteParams(),
    generateMetadata: async ({
      params,
    }: {
      params: Promise<{ from: string; to: string }>;
    }) => {
      const { from, to } = await params;
      const route = getDeliveryRoute(from, to);
      if (!route) return getLocalizedPageMetadata(locale, "services");
      const path = localePath(locale, routePath(route.from.code, route.to.code));
      const alternates = getLocalizedAlternates(
        routePath(route.from.code, route.to.code),
      );
      return createPageMetadata(
        routeMetaTitle(locale, route),
        routeMetaDescription(locale, route),
        path,
        {
          locale,
          ogLocale: ogLocale[locale],
          alternates: Object.fromEntries(
            Object.entries(alternates).map(([lang, href]) => [
              lang,
              canonicalPageUrl(href),
            ]),
          ),
        },
      );
    },
    Page: async function DeliveryRoutePage({
      params,
    }: {
      params: Promise<{ from: string; to: string }>;
    }) {
      const { from, to } = await params;
      const route = getDeliveryRoute(from, to);
      if (!route) notFound();
      const { DeliveryRoutePageView } = await import(
        "@/views/DeliveryRoutePageView"
      );
      return (
        <SiteLayout locale={locale}>
          <DeliveryRoutePageView locale={locale} route={route} />
        </SiteLayout>
      );
    },
  };
}

export function createFaqPage(locale: Locale) {
  return {
    generateMetadata: () => getLocalizedPageMetadata(locale, "faq"),
    Page: async function FaqPage() {
      return (
        <SiteLayout locale={locale}>
          <FaqPageView locale={locale} />
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

export function createNewsListPage(locale: Locale) {
  return {
    generateMetadata: () => getLocalizedPageMetadata(locale, "news"),
    Page: async function NewsListPage({
      searchParams,
    }: {
      searchParams: Promise<Record<string, string | string[] | undefined>>;
    }) {
      const params = await searchParams;
      return (
        <SiteLayout locale={locale}>
          <NewsListPageView locale={locale} searchParams={params} />
        </SiteLayout>
      );
    },
  };
}

export function createNewsArticlePage(locale: Locale) {
  return {
    generateStaticParams: async () => {
      const slugs = await listPublishedSlugs();
      return slugs.map((slug) => ({ slug }));
    },
    generateMetadata: async ({
      params,
    }: {
      params: Promise<{ slug: string }>;
    }) => {
      const { slug } = await params;
      const article = await getNewsBySlug(locale, slug);
      if (!article) return getLocalizedPageMetadata(locale, "news");
      return getNewsArticleMetadata(locale, article);
    },
    Page: async function NewsArticlePage({
      params,
    }: {
      params: Promise<{ slug: string }>;
    }) {
      const { slug } = await params;
      const article = await getNewsBySlug(locale, slug);
      if (!article) notFound();
      return (
        <SiteLayout locale={locale}>
          <NewsArticlePageView locale={locale} article={article} />
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
