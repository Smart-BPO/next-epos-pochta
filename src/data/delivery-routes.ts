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

export type EtaBand = "short" | "long";

/** Road distance up to which a corridor counts as short (48 h); longer → 72 h. */
export const SHORT_ROUTE_MAX_KM = 360;

export const ETA_HOURS: Record<EtaBand, number> = { short: 48, long: 72 };

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
  return km <= SHORT_ROUTE_MAX_KM ? "short" : "long";
}

const HUB_BY_REGION = new Map<string, string>(
  DELIVERY_CITIES.flatMap((c) => {
    if (!c.settlementId) return [];
    const region = c.settlementId.slice(0, 4);
    // Tashkent city (1726) also serves Tashkent region (1727).
    return region === "1726"
      ? [[region, c.code] as const, ["1727", c.code] as const]
      : [[region, c.code] as const];
  }),
);

/** ETA band between two FCargo SOATO settlements/regions (same region → short). */
export function etaBandForSettlements(fromId: string, toId: string): EtaBand {
  const fromRegion = fromId.slice(0, 4);
  const toRegion = toId.slice(0, 4);
  const fromHub = HUB_BY_REGION.get(fromRegion);
  const toHub = HUB_BY_REGION.get(toRegion);
  if (fromRegion === toRegion || (fromHub && fromHub === toHub)) return "short";
  if (!fromHub || !toHub) return "long";
  return etaBandForDistance(getDistanceKm(fromHub, toHub));
}

export function etaHoursForSettlements(fromId: string, toId: string): number {
  return ETA_HOURS[etaBandForSettlements(fromId, toId)];
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

/** All hub A→B corridors for SSG (Hostinger cannot reliably SSR missing route HTML). */
export function listPriorityDeliveryRouteParams(
  cities: DeliveryCity[] = DELIVERY_CITIES,
  priorityCodes?: readonly string[],
): Array<{ from: string; to: string }> {
  if (!priorityCodes?.length) return listDeliveryRouteParams(cities);
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

export function etaHoursLabel(locale: Locale, hours: number): string {
  if (locale === "uz") return `${hours} soatgacha`;
  if (locale === "zh") return `${hours} 小时内`;
  return `до ${hours} часов`;
}

export function etaLabel(locale: Locale, band: EtaBand): string {
  return etaHoursLabel(locale, ETA_HOURS[band]);
}

/** Sentence-initial form, e.g. «Доставка до 48 часов». */
export function etaSentence(locale: Locale, band: EtaBand): string {
  const hours = ETA_HOURS[band];
  if (locale === "uz") return `Yetkazish ${hours} soatgacha`;
  if (locale === "zh") return `${hours} 小时内送达`;
  return `Доставка до ${hours} часов`;
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
  if (locale === "zh") {
    const from = cityDisplayName(route.from, locale);
    return `从${from}到${to}的配送`;
  }
  // Russian: из + genitive, в + accusative (nominative for these city names)
  const fromGen = RU_FROM_GENITIVE[route.from.code] ?? route.from.nameRu;
  return `Доставка из ${fromGen} в ${to}`;
}

/** TAS ↔ top regional hubs (Wordstat phase-1 corridors). */
export function isPriorityTasCorridor(route: DeliveryRoute): boolean {
  const hubs = new Set(["skd", "bhk", "feg", "azn", "nma"]);
  const a = route.from.code;
  const b = route.to.code;
  return (a === "tas" && hubs.has(b)) || (b === "tas" && hubs.has(a));
}

export function routeMetaTitle(locale: Locale, route: DeliveryRoute): string {
  const to = cityDisplayName(route.to, locale);
  if (locale === "uz") {
    const from = cityDisplayName(route.from, locale);
    if (isPriorityTasCorridor(route)) {
      return `${from} — ${to} pochta va kuryer yetkazib berish`;
    }
    return `${from} — ${to} yetkazib berish`;
  }
  if (locale === "zh") {
    const from = cityDisplayName(route.from, locale);
    if (isPriorityTasCorridor(route)) {
      return `从${from}到${to} — 包裹与快递`;
    }
    return `从${from}到${to}的配送`;
  }
  const fromGen = RU_FROM_GENITIVE[route.from.code] ?? route.from.nameRu;
  if (isPriorityTasCorridor(route)) {
    return `Доставка из ${fromGen} в ${to} — посылки и курьер`;
  }
  return `Доставка из ${fromGen} в ${to}`;
}

export function routeMetaDescription(
  locale: Locale,
  route: DeliveryRoute,
): string {
  const to = cityDisplayName(route.to, locale);
  const eta = etaSentence(locale, route.etaBand);
  if (locale === "uz") {
    const from = cityDisplayName(route.from, locale);
    return `${from}dan ${to}ga pochta va kuryer (~${route.distanceKm} km). ${eta}. Kalkulyatorda orientir, yakuniy narx — menejer. Oferta emas.`;
  }
  if (locale === "zh") {
    const from = cityDisplayName(route.from, locale);
    return `从${from}到${to}的包裹与快递（约 ${route.distanceKm} 公里）。${eta}。计算器为参考价，最终价格由经理确认。不是要约。`;
  }
  const fromGen = RU_FROM_GENITIVE[route.from.code] ?? route.from.nameRu;
  return `Посылки и курьер из ${fromGen} в ${to} (~${route.distanceKm} км). ${eta}. Ориентир в калькуляторе, финал у менеджера. Не оферта.`;
}

export function routeLead(locale: Locale, route: DeliveryRoute): string {
  const to = cityDisplayName(route.to, locale);
  if (locale === "uz") {
    const from = cityDisplayName(route.from, locale);
    return `${from}dan ${to}ga hujjat, pochta va biznes joʻnatmalarini EPOS POCHTA kuryeri orqali yuboring. Masofa ~${route.distanceKm} km. Narx va muddat — kalkulyatorda orientir; bu oferta emas, menejer tasdiqlaydi.`;
  }
  if (locale === "zh") {
    const from = cityDisplayName(route.from, locale);
    return `通过 EPOS POCHTA 快递员把文件、包裹和企业快件从${from}寄到${to}。距离约 ${route.distanceKm} 公里。时效和费用在计算器中为参考值；这不是要约，由经理确认。`;
  }
  const fromGen = RU_FROM_GENITIVE[route.from.code] ?? route.from.nameRu;
  return `Отправьте документы, посылки и B2B-отправления из ${fromGen} в ${to} курьером EPOS POCHTA. Расстояние ~${route.distanceKm} км. Срок и стоимость — ориентир в калькуляторе; это не оферта, итог подтверждает менеджер.`;
}

/** Extra body paragraphs for route pages (priority corridors get longer copy). */
export function routeBody(
  locale: Locale,
  route: DeliveryRoute,
): string[] {
  const from = cityDisplayName(route.from, locale);
  const to = cityDisplayName(route.to, locale);
  const eta = etaLabel(locale, route.etaBand);
  const priority = isPriorityTasCorridor(route);

  if (locale === "uz") {
    const base = [
      `${from} — ${to} yoʻnalishi boʻylab hujjat va pochta qabul qilinadi. Masofa taxminan ${route.distanceKm} km; muddat orientiri: ${eta}.`,
      `Narxni kalkulyatorda hisoblang yoki «narx soʻrash» arizasini qoldiring. Koʻrsatilgan summa — orientir, oferta yoki ochiq tarif emas.`,
    ];
    if (!priority) return base;
    return [
      ...base,
      `${from} va ${to} shahar sahifalarida mahalliy kuryer, eshikgacha rejim va biznes shartlari haqida batafsil. Qaytarish yoʻnalishi uchun sahifadagi «orqaga» havoladan foydalaning.`,
      `Internet-doʻkonlar uchun muntazam olib ketish va statuslar — biznes arizasi orqali, individual kelishuv bilan.`,
    ];
  }

  if (locale === "zh") {
    const base = [
      `${from}至${to}线路接收文件和包裹。距离约 ${route.distanceKm} 公里；时效参考：${eta}。`,
      "请在计算器中估算费用，或提交「查询价格」申请。所示金额是参考价，不是要约，也不是公开价目。",
    ];
    if (!priority) return base;
    return [
      ...base,
      `${from}和${to}的城市页面有本地快递员、送货上门和企业条件。返程线路请使用本页的「返程」链接。`,
      "网店的定期取件和状态通过企业申请、按单独条件办理。",
    ];
  }

  const fromGen = RU_FROM_GENITIVE[route.from.code] ?? route.from.nameRu;
  const base = [
    `По маршруту из ${fromGen} в ${to} принимаем документы и посылки. Расстояние около ${route.distanceKm} км; ориентир по сроку: ${eta}.`,
    `Рассчитайте стоимость в калькуляторе или оставьте заявку «запросить стоимость». Показанная сумма — ориентир, не оферта и не публичный тариф.`,
  ];
  if (!priority) return base;
  return [
    ...base,
    `На страницах городов ${from} и ${to} — детали по местному курьеру, режиму «до двери» и B2B. Обратное направление — ссылка «обратно» на этой странице.`,
    `Для интернет-магазинов регулярный забор и статусы оформляются через бизнес-заявку на индивидуальных условиях.`,
  ];
}

export function routeFaq(
  locale: Locale,
  route: DeliveryRoute,
): Array<{ question: string; answer: string }> {
  const from = cityDisplayName(route.from, locale);
  const to = cityDisplayName(route.to, locale);
  const eta = etaSentence(locale, route.etaBand);
  const fromCityFaq =
    locale === "zh" ? undefined : locale === "uz" ? route.from.faqUz[0] : route.from.faqRu[0];
  const toCityFaq =
    locale === "zh" ? undefined : locale === "uz" ? route.to.faqUz[0] : route.to.faqRu[0];

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
      : locale === "zh"
        ? [
            {
              question: `从${from}到${to}需要多久？`,
              answer: `${eta}。准确时效取决于重量、地址和货物类型，由经理确认。`,
            },
            {
              question: `${from}和${to}之间有多远？`,
              answer: `公路距离约 ${route.distanceKm} 公里。这是事实参考，不是价格公式。`,
            },
            {
              question: "在哪里查看费用？",
              answer:
                "在计算器中填写出发地、目的地、重量和尺寸。所示金额是参考价，不是要约。",
            },
            {
              question: "接收文件和包裹吗？",
              answer: "接收。面向个人和企业快件。稳定货量请提交企业申请。",
            },
            {
              question: `有从${to}返回${from}的线路吗？`,
              answer:
                "有单独的线路页面。请使用本页的「返程」链接，或在计算器中交换地点。",
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

  const corridorExtras: Array<{ question: string; answer: string }> =
    isPriorityTasCorridor(route)
      ? locale === "uz"
        ? [
            {
              question: `${to}da eshikgacha yetkazish bormi?`,
              answer:
                "Ha, manzil kelishilganda. Shahar sahifasi va hisobda aniqlang — bu alohida xizmat intentidan farq qiladi.",
            },
            {
              question: `${from}dan kuryer chaqirish mumkinmi?`,
              answer:
                "Ha, olib ketish uchun kuryer chaqirish mumkin. Muntazam oqimlar uchun biznes arizasini qoldiring.",
            },
          ]
        : locale === "zh"
          ? [
              {
                question: `${to}可以送货上门吗？`,
                answer:
                  "可以，需确认地址。请在城市页面和报价中核对 — 这不替代单独的「送货上门」服务。",
              },
              {
                question: `可以在${from}叫快递员吗？`,
                answer: "可以上门取件。稳定货量请提交企业申请。",
              },
            ]
          : [
            {
              question: `Есть доставка до двери в ${to}?`,
              answer:
                "Да, при согласовании адреса. Уточните на странице города и в расчёте — это не замена отдельной услуги «до двери».",
            },
            {
              question: `Можно вызвать курьера в ${from}?`,
              answer:
                "Да, доступен забор курьером. Для регулярных потоков оставьте бизнес-заявку.",
            },
          ]
      : [];

  const extras: Array<{ question: string; answer: string }> = [];
  if (fromCityFaq) extras.push(fromCityFaq);
  if (toCityFaq && toCityFaq.question !== fromCityFaq?.question) {
    extras.push(toCityFaq);
  }
  return [...base, ...corridorExtras, ...extras];
}
