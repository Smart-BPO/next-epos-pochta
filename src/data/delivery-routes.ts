import type { Locale } from "@/i18n/config";
import {
  DELIVERY_CITIES,
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
  cities: DeliveryCity[] = DELIVERY_CITIES,
): DeliveryRoute | undefined {
  const from = cities.find((c) => c.code === fromCode.toLowerCase());
  const to = cities.find((c) => c.code === toCode.toLowerCase());
  if (!from || !to || from.code === to.code) return undefined;
  const distanceKm = getDistanceKm(from.code, to.code);
  return {
    from,
    to,
    distanceKm,
    etaBand: etaBandForDistance(distanceKm),
  };
}

export function listDeliveryRouteParams(
  cities: DeliveryCity[] = DELIVERY_CITIES,
): Array<{ from: string; to: string }> {
  const codes = cities.map((c) => c.code);
  const params: Array<{ from: string; to: string }> = [];
  for (const from of codes) {
    for (const to of codes) {
      if (from === to) continue;
      params.push({ from, to });
    }
  }
  return params;
}

/** Fewer SSG pages for Hostinger memory — priority corridors only; rest on-demand. */
export function listPriorityDeliveryRouteParams(
  cities: DeliveryCity[] = DELIVERY_CITIES,
  priorityCodes: readonly string[] = [
    "tas",
    "skd",
    "bhk",
    "azn",
    "nma",
    "feg",
  ],
): Array<{ from: string; to: string }> {
  const allowed = new Set(
    priorityCodes.map((c) => c.toLowerCase()).filter((c) =>
      cities.some((city) => city.code === c),
    ),
  );
  return listDeliveryRouteParams(cities).filter(
    ({ from, to }) => allowed.has(from) && allowed.has(to),
  );
}

export function routesFrom(
  code: string,
  cities: DeliveryCity[] = DELIVERY_CITIES,
): DeliveryRoute[] {
  return cities
    .filter((c) => c.code !== code.toLowerCase())
    .map((to) => getDeliveryRoute(code, to.code, cities))
    .filter((r): r is DeliveryRoute => Boolean(r));
}

export function routesTo(
  code: string,
  cities: DeliveryCity[] = DELIVERY_CITIES,
): DeliveryRoute[] {
  return cities
    .filter((c) => c.code !== code.toLowerCase())
    .map((from) => getDeliveryRoute(from.code, code, cities))
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

/** Genitive forms for «из {city}» in route titles / meta. */
const RU_FROM_GENITIVE: Record<string, string> = {
  tas: "Ташкента",
  skd: "Самарканда",
  bhk: "Бухары",
  nma: "Намангана",
  azn: "Андижана",
  feg: "Ферганы",
  ncu: "Нукуса",
  ksq: "Карши",
  tmj: "Термеза",
  nvi: "Навои",
  jiz: "Джизака",
  ugc: "Ургенча",
};

export function routeTitle(locale: Locale, route: DeliveryRoute): string {
  const to = cityDisplayName(route.to, locale);
  if (locale === "uz") {
    const from = cityDisplayName(route.from, locale);
    return `${from}dan ${to}ga yetkazib berish`;
  }
  // Russian: из + genitive, в + accusative (nominative for these city names)
  const fromGen = RU_FROM_GENITIVE[route.from.code] ?? route.from.nameRu;
  return `Доставка из ${fromGen} в ${to}`;
}

export function routeMetaTitle(locale: Locale, route: DeliveryRoute): string {
  const to = cityDisplayName(route.to, locale);
  if (locale === "uz") {
    const from = cityDisplayName(route.from, locale);
    return `${from} — ${to} yetkazib berish | EPOS POCHTA`;
  }
  const fromGen = RU_FROM_GENITIVE[route.from.code] ?? route.from.nameRu;
  return `Доставка из ${fromGen} в ${to} — EPOS POCHTA`;
}

export function routeMetaDescription(
  locale: Locale,
  route: DeliveryRoute,
): string {
  const to = cityDisplayName(route.to, locale);
  const eta = etaLabel(locale, route.etaBand);
  if (locale === "uz") {
    const from = cityDisplayName(route.from, locale);
    return `${from}dan ${to}ga kuryerlik yetkazib berish (~${route.distanceKm} km). ${eta}. Kalkulyatorda orientir, yakuniy narx — menejer tasdigʻi.`;
  }
  const fromGen = RU_FROM_GENITIVE[route.from.code] ?? route.from.nameRu;
  return `Курьерская доставка из ${fromGen} в ${to} (~${route.distanceKm} км). ${eta}. Ориентир в калькуляторе, финальную цену подтверждает менеджер.`;
}

export function routeLead(locale: Locale, route: DeliveryRoute): string {
  const to = cityDisplayName(route.to, locale);
  if (locale === "uz") {
    const from = cityDisplayName(route.from, locale);
    return `${from}dan ${to}ga hujjat, pochta va biznes joʻnatmalarini EPOS POCHTA orqali yuboring. Masofa taxminan ${route.distanceKm} km. Narx va muddat — kalkulyatorda orientir; bu oferta emas, menejer tasdiqlaydi.`;
  }
  const fromGen = RU_FROM_GENITIVE[route.from.code] ?? route.from.nameRu;
  return `Отправьте документы, посылки и B2B-отправления из ${fromGen} в ${to} с EPOS POCHTA. Расстояние около ${route.distanceKm} км. Срок и стоимость — ориентир в калькуляторе; это не оферта, итог подтверждает менеджер.`;
}

export function routeFaq(
  locale: Locale,
  route: DeliveryRoute,
): Array<{ question: string; answer: string }> {
  const from = cityDisplayName(route.from, locale);
  const to = cityDisplayName(route.to, locale);
  const eta = etaLabel(locale, route.etaBand);
  const fromCityFaq =
    locale === "uz" ? route.from.faqUz[0] : route.from.faqRu[0];
  const toCityFaq = locale === "uz" ? route.to.faqUz[0] : route.to.faqRu[0];

  const base =
    locale === "uz"
      ? [
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
        ]
      : [
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

  const extras: Array<{ question: string; answer: string }> = [];
  if (fromCityFaq) extras.push(fromCityFaq);
  if (toCityFaq && toCityFaq.question !== fromCityFaq?.question) {
    extras.push(toCityFaq);
  }
  return [...base, ...extras];
}
