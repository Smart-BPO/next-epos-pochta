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
} as const;
