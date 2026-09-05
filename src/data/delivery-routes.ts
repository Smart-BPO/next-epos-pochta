import type { Locale } from "@/i18n/config";
import {
  DELIVERY_CITIES,
  getDeliveryCityByCode,
  type DeliveryCity,
  cityDisplayName,
} from "@/data/delivery-cities";

/**
 * Approximate road distances (km) between delivery hubs.
 * Used for route facts only — not for pricing.
 * Undirected: look up sorted pair key.
 */
const DISTANCE_KM: Record<string, number> = {
  "azn-feg": 75,
  "azn-jiz": 420,
  "azn-nma": 70,
  "azn-tas": 350,
  "bhk-jiz": 380,
  "bhk-ksq": 180,
  "bhk-ncu": 580,
  "bhk-nvi": 120,
  "bhk-skd": 270,
  "bhk-tas": 560,
  "bhk-tmj": 420,
  "bhk-ugc": 480,
  "feg-jiz": 400,
  "feg-nma": 90,
  "feg-tas": 320,
  "jiz-ksq": 280,
  "jiz-nma": 380,
  "jiz-nvi": 220,
  "jiz-skd": 150,
  "jiz-tas": 200,
  "jiz-tmj": 480,
  "ksq-nvi": 160,
  "ksq-skd": 180,
  "ksq-tas": 430,
  "ksq-tmj": 280,
  "ksq-ugc": 520,
  "ncu-nvi": 520,
  "ncu-tas": 1250,
  "ncu-ugc": 180,
  "nma-tas": 300,
  "nvi-skd": 200,
  "nvi-tas": 400,
  "nvi-tmj": 380,
  "nvi-ugc": 450,
  "skd-tas": 280,
  "skd-tmj": 380,
  "skd-ugc": 620,
  "tas-tmj": 700,
  "tas-ugc": 1100,
  "tmj-ugc": 900,
};

function pairKey(a: string, b: string) {
  return [a, b].sort().join("-");
}

export type EtaBand = "near" | "mid" | "far";

export type DeliveryRoute = {
  from: DeliveryCity;
  to: DeliveryCity;
  distanceKm: number;
  etaBand: EtaBand;
};

export function getDistanceKm(fromCode: string, toCode: string): number {
  const from = fromCode.toLowerCase();
  const to = toCode.toLowerCase();
  if (from === to) return 0;
  return DISTANCE_KM[pairKey(from, to)] ?? 450;
}

export function etaBandForDistance(km: number): EtaBand {
  if (km < 250) return "near";
  if (km < 550) return "mid";
  return "far";
}

export function getDeliveryRoute(
  fromCode: string,
  toCode: string,
): DeliveryRoute | undefined {
  const from = getDeliveryCityByCode(fromCode);
  const to = getDeliveryCityByCode(toCode);
  if (!from || !to || from.code === to.code) return undefined;
  const distanceKm = getDistanceKm(from.code, to.code);
  return {
    from,
    to,
    distanceKm,
    etaBand: etaBandForDistance(distanceKm),
  };
}

export function listDeliveryRouteParams(): Array<{ from: string; to: string }> {
  const codes = DELIVERY_CITIES.map((c) => c.code);
  const params: Array<{ from: string; to: string }> = [];
  for (const from of codes) {
    for (const to of codes) {
      if (from === to) continue;
      params.push({ from, to });
    }
  }
  return params;
}

export function routesFrom(code: string): DeliveryRoute[] {
  return DELIVERY_CITIES.filter((c) => c.code !== code.toLowerCase())
    .map((to) => getDeliveryRoute(code, to.code))
    .filter((r): r is DeliveryRoute => Boolean(r));
}

export function routesTo(code: string): DeliveryRoute[] {
  return DELIVERY_CITIES.filter((c) => c.code !== code.toLowerCase())
    .map((from) => getDeliveryRoute(from.code, code))
    .filter((r): r is DeliveryRoute => Boolean(r));
}

export function routePath(fromCode: string, toCode: string) {
  return `/delivery/${fromCode.toLowerCase()}/${toCode.toLowerCase()}/`;
}

export function etaLabel(locale: Locale, band: EtaBand): string {
  if (locale === "uz") {
    if (band === "near") return "Odatda 1–2 ish kuni (orientir)";
    if (band === "mid") return "Odatda 2–4 ish kuni (orientir)";
    return "Odatda 3–5 ish kuni (orientir)";
  }
  if (band === "near") return "Обычно 1–2 рабочих дня (ориентир)";
  if (band === "mid") return "Обычно 2–4 рабочих дня (ориентир)";
  return "Обычно 3–5 рабочих дней (ориентир)";
}

export function routeTitle(locale: Locale, route: DeliveryRoute): string {
  const from = cityDisplayName(route.from, locale);
  const to = cityDisplayName(route.to, locale);
  return locale === "uz"
    ? `${from}dan ${to}ga yetkazib berish`
    : `Доставка из ${from} в ${to}`;
}

export function routeMetaTitle(locale: Locale, route: DeliveryRoute): string {
  const from = cityDisplayName(route.from, locale);
  const to = cityDisplayName(route.to, locale);
  return locale === "uz"
    ? `${from} — ${to} yetkazib berish | EPOS POCHTA`
    : `Доставка из ${from} в ${to} — EPOS POCHTA`;
}

export function routeMetaDescription(
  locale: Locale,
  route: DeliveryRoute,
): string {
  const from = cityDisplayName(route.from, locale);
  const to = cityDisplayName(route.to, locale);
  const eta = etaLabel(locale, route.etaBand);
  if (locale === "uz") {
    return `${from}dan ${to}ga kuryerlik yetkazib berish (~${route.distanceKm} km). ${eta}. Kalkulyatorda orientir, yakuniy narx — menejer tasdigʻi.`;
  }
  return `Курьерская доставка из ${from} в ${to} (~${route.distanceKm} км). ${eta}. Ориентир в калькуляторе, финальную цену подтверждает менеджер.`;
}

export function routeLead(locale: Locale, route: DeliveryRoute): string {
  const from = cityDisplayName(route.from, locale);
  const to = cityDisplayName(route.to, locale);
  if (locale === "uz") {
    return `${from}dan ${to}ga hujjat, pochta va biznes joʻnatmalarini EPOS POCHTA orqali yuboring. Masofa taxminan ${route.distanceKm} km. Narx va muddat — kalkulyatorda orientir; bu oferta emas, menejer tasdiqlaydi.`;
  }
  return `Отправьте документы, посылки и B2B-отправления из ${from} в ${to} с EPOS POCHTA. Расстояние около ${route.distanceKm} км. Срок и стоимость — ориентир в калькуляторе; это не оферта, итог подтверждает менеджер.`;
}

export function routeFaq(
  locale: Locale,
  route: DeliveryRoute,
): Array<{ question: string; answer: string }> {
  const from = cityDisplayName(route.from, locale);
  const to = cityDisplayName(route.to, locale);
  const eta = etaLabel(locale, route.etaBand);

  if (locale === "uz") {
    return [
      {
        question: `${from}dan ${to}ga qancha vaqt ketadi?`,
        answer: `${eta}. Aniq muddat ogʻirlik, manzil va yuk turiga bogʻliq — menejer tasdiqlaydi.`,
      },
      {
        question: `${from} — ${to} masofasi qancha?`,
        answer: `Yoʻl boʻylab taxminan ${route.distanceKm} km. Bu faktual orientir, narx formulasi emas.`,
      },
      {
        question: "Narxni qayerdan bilaman?",
        answer:
          "Kalkulyatorda joʻnatish va qabul punktlarini, ogʻirlik va oʻlchamlarni kiriting. Koʻrsatilgan summa — orientir, oferta emas.",
      },
      {
        question: "Hujjat va pochta qabul qilinadimi?",
        answer:
          "Ha. Shaxsiy va biznes joʻnatmalar uchun. Muntazam oqimlar uchun biznes arizasini qoldiring.",
      },
      {
        question: `Qaytarish yoʻnalishi ${to} — ${from} bormi?`,
        answer: `Ha, alohida sahifa mavjud. Sahifadagi «orqaga» havoladan foydalaning yoki kalkulyatorda punktlarni almashtiring.`,
      },
    ];
  }

  return [
    {
      question: `Сколько занимает доставка из ${from} в ${to}?`,
      answer: `${eta}. Точный срок зависит от веса, адреса и типа груза — подтверждает менеджер.`,
    },
    {
      question: `Какое расстояние между ${from} и ${to}?`,
      answer: `По дороге примерно ${route.distanceKm} км. Это фактологический ориентир, не формула цены.`,
    },
    {
      question: "Где узнать стоимость?",
      answer:
        "В калькуляторе укажите пункты отправления и назначения, вес и габариты. Показанная сумма — ориентир, не оферта.",
    },
    {
      question: "Принимаете документы и посылки?",
      answer:
        "Да. Для частных и бизнес-отправлений. Для регулярных потоков оставьте бизнес-заявку.",
    },
    {
      question: `Есть направление обратно ${to} — ${from}?`,
      answer: `Да, отдельная страница маршрута. Воспользуйтесь ссылкой «обратно» на этой странице или поменяйте пункты в калькуляторе.`,
    },
  ];
}
