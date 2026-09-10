/**
 * SEO measurement helpers — wire these goal names in Yandex Metrika / GA4.
 * Events are already fired from the app via `trackEvent`.
 */
export const SEO_ANALYTICS_GOALS = {
  /** Calculator showed a non-binding estimate */
  price_estimate_shown: {
    metrika: "price_estimate_shown",
    ga4: "price_estimate_shown",
    description: "Калькулятор: показана ориентировочная смета",
  },
  /** User clicked confirm-with-manager from calculator */
  request_price_start: {
    metrika: "request_price_start",
    ga4: "request_price_start",
    description: "Переход к B2B-заявке / подтверждению с менеджером",
  },
  /** B2B / price lead submitted */
  price_form_submit_success: {
    metrika: "price_form_submit_success",
    ga4: "price_form_submit_success",
    description: "Успешная B2B-заявка на коммерческое предложение",
  },
  business_connect_submit_success: {
    metrika: "business_connect_submit_success",
    ga4: "business_connect_submit_success",
    description: "Успешная заявка на подключение бизнеса",
  },
  track_support_call_click: {
    metrika: "track_support_call_click",
    ga4: "track_support_call_click",
    description: "Клик по телефону поддержки",
  },
} as const;

/** Priority query clusters for GSC / Webmaster baseline (uz + ru intent). */
export const SEO_PRIORITY_QUERIES = {
  brand: ["EPOS POCHTA", "епос почта", "epos pochta"],
  deliveryGeneral: [
    "доставка посылок узбекистан",
    "курьерская доставка ташкент",
    "yetkazib berish oʻzbekiston",
    "kuryer toshkent",
  ],
  calculator: [
    "рассчитать стоимость доставки",
    "калькулятор доставки узбекистан",
    "yetkazib berish narxini hisoblash",
  ],
  business: [
    "доставка для интернет-магазинов",
    "корпоративная доставка узбекистан",
    "internet-doʻkon yetkazib berish",
  ],
  cities: [
    "доставка в самарканд",
    "доставка в бухару",
    "доставка в андижан",
    "samarqandga yetkazib berish",
  ],
  routes: [
    "доставка из ташкента в самарканд",
    "доставка из ташкента в бухару",
    "toshkentdan samarqandga yetkazib berish",
    "toshkentdan buxoroga yetkazib berish",
  ],
  services: [
    "доставка документов ташкент",
    "курьер на дом ташкент",
    "hujjat yetkazish",
    "eshikdan eshikka yetkazib berish",
  ],
} as const;

export type SeoEngine = "google" | "yandex";
export type SeoLocale = "uz" | "ru";

/** SERP tracking matrix: query → landing → engines (refresh monthly in GSC/Webmaster). */
export const SEO_SERP_MATRIX: ReadonlyArray<{
  cluster: keyof typeof SEO_PRIORITY_QUERIES | "head";
  locale: SeoLocale;
  query: string;
  targetPath: string;
  engines: SeoEngine[];
  competitors: ReadonlyArray<string>;
}> = [
  {
    cluster: "brand",
    locale: "ru",
    query: "EPOS POCHTA",
    targetPath: "/",
    engines: ["google", "yandex"],
    competitors: ["emu.uz", "bts.uz"],
  },
  {
    cluster: "brand",
    locale: "uz",
    query: "epos pochta",
    targetPath: "/",
    engines: ["google", "yandex"],
    competitors: ["emu.uz", "bts.uz"],
  },
  {
    cluster: "head",
    locale: "ru",
    query: "доставка посылок узбекистан",
    targetPath: "/",
    engines: ["google", "yandex"],
    competitors: [
      "emu.uz",
      "bts.uz",
      "delivery.yandex.uz",
      "ponyexpress.uz",
      "express-aramex.uz",
    ],
  },
  {
    cluster: "head",
    locale: "uz",
    query: "yetkazib berish oʻzbekiston",
    targetPath: "/",
    engines: ["google", "yandex"],
    competitors: ["emu.uz", "bts.uz", "delivery.yandex.uz"],
  },
  {
    cluster: "head",
    locale: "ru",
    query: "курьерская доставка ташкент",
    targetPath: "/delivery/tashkent/",
    engines: ["google", "yandex"],
    competitors: ["emu.uz", "bts.uz", "ponyexpress.uz"],
  },
  {
    cluster: "head",
    locale: "uz",
    query: "kuryer toshkent",
    targetPath: "/delivery/tashkent/",
    engines: ["google", "yandex"],
    competitors: ["emu.uz", "bts.uz"],
  },
  {
    cluster: "services",
    locale: "ru",
    query: "доставка документов ташкент",
    targetPath: "/services/documents/",
    engines: ["google", "yandex"],
    competitors: ["emu.uz", "bts.uz"],
  },
  {
    cluster: "services",
    locale: "uz",
    query: "hujjat yetkazish",
    targetPath: "/services/documents/",
    engines: ["google", "yandex"],
    competitors: ["emu.uz", "bts.uz"],
  },
  {
    cluster: "services",
    locale: "ru",
    query: "курьер на дом ташкент",
    targetPath: "/services/door/",
    engines: ["google", "yandex"],
    competitors: ["bts.uz", "delivery.yandex.uz"],
  },
  {
    cluster: "services",
    locale: "uz",
    query: "eshikdan eshikka yetkazib berish",
    targetPath: "/services/door/",
    engines: ["google", "yandex"],
    competitors: ["emu.uz", "bts.uz"],
  },
  {
    cluster: "services",
    locale: "ru",
    query: "доставка для интернет-магазинов",
    targetPath: "/services/ecommerce/",
    engines: ["google", "yandex"],
    competitors: ["emu.uz", "bts.uz", "delivery.yandex.uz"],
  },
  {
    cluster: "business",
    locale: "ru",
    query: "корпоративная доставка узбекистан",
    targetPath: "/business/",
    engines: ["google", "yandex"],
    competitors: ["emu.uz", "bts.uz", "ponyexpress.uz"],
  },
  {
    cluster: "business",
    locale: "uz",
    query: "internet-doʻkon yetkazib berish",
    targetPath: "/business/",
    engines: ["google", "yandex"],
    competitors: ["emu.uz", "bts.uz"],
  },
  {
    cluster: "cities",
    locale: "ru",
    query: "доставка в самарканд",
    targetPath: "/delivery/samarkand/",
    engines: ["google", "yandex"],
    competitors: ["emu.uz", "bts.uz"],
  },
  {
    cluster: "cities",
    locale: "uz",
    query: "samarqandga yetkazib berish",
    targetPath: "/delivery/samarkand/",
    engines: ["google", "yandex"],
    competitors: ["emu.uz", "bts.uz"],
  },
  {
    cluster: "cities",
    locale: "ru",
    query: "доставка в бухару",
    targetPath: "/delivery/bukhara/",
    engines: ["google", "yandex"],
    competitors: ["emu.uz", "bts.uz"],
  },
  {
    cluster: "cities",
    locale: "uz",
    query: "buxoroga yetkazib berish",
    targetPath: "/delivery/bukhara/",
    engines: ["google", "yandex"],
    competitors: ["emu.uz", "bts.uz"],
  },
  {
    cluster: "cities",
    locale: "ru",
    query: "доставка в андижан",
    targetPath: "/delivery/andijan/",
    engines: ["google", "yandex"],
    competitors: ["emu.uz", "bts.uz"],
  },
  {
    cluster: "routes",
    locale: "ru",
    query: "доставка из ташкента в самарканд",
    targetPath: "/delivery/tas/skd/",
    engines: ["google", "yandex"],
    competitors: ["emu.uz", "bts.uz"],
  },
  {
    cluster: "routes",
    locale: "uz",
    query: "toshkentdan samarqandga yetkazib berish",
    targetPath: "/delivery/tas/skd/",
    engines: ["google", "yandex"],
    competitors: ["emu.uz", "bts.uz"],
  },
  {
    cluster: "routes",
    locale: "ru",
    query: "доставка из ташкента в бухару",
    targetPath: "/delivery/tas/bhk/",
    engines: ["google", "yandex"],
    competitors: ["emu.uz", "bts.uz"],
  },
  {
    cluster: "routes",
    locale: "uz",
    query: "toshkentdan buxoroga yetkazib berish",
    targetPath: "/delivery/tas/bhk/",
    engines: ["google", "yandex"],
    competitors: ["emu.uz", "bts.uz"],
  },
  {
    cluster: "calculator",
    locale: "ru",
    query: "калькулятор доставки узбекистан",
    targetPath: "/calculator/",
    engines: ["google", "yandex"],
    competitors: ["emu.uz", "bts.uz"],
  },
  {
    cluster: "calculator",
    locale: "uz",
    query: "yetkazib berish narxini hisoblash",
    targetPath: "/calculator/",
    engines: ["google", "yandex"],
    competitors: ["emu.uz", "bts.uz"],
  },
  {
    cluster: "calculator",
    locale: "ru",
    query: "рассчитать стоимость доставки",
    targetPath: "/calculator/",
    engines: ["google", "yandex"],
    competitors: ["emu.uz", "bts.uz", "delivery.yandex.uz"],
  },
] as const;

/** Hubs that get higher sitemap priority on corridor routes. */
export const SEO_PRIORITY_HUB_CODES = [
  "tas",
  "skd",
  "bhk",
  "azn",
  "nma",
  "feg",
] as const;
