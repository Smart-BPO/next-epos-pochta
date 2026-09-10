import type { Locale } from "@/i18n/config";

export const SERVICE_SLUGS = [
  "documents",
  "parcels",
  "door",
  "courier",
  "ecommerce",
  "corporate",
  "cod",
  "returns",
] as const;

export type ServiceSlug = (typeof SERVICE_SLUGS)[number];

const SERVICE_SEO: Record<
  ServiceSlug,
  { titleUz: string; titleRu: string; descUz: string; descRu: string }
> = {
  documents: {
    titleUz: "Hujjatlarni yetkazish Oʻzbekiston boʻylab",
    titleRu: "Доставка документов по Узбекистану",
    descUz:
      "Shartnomalar va muhim qogʻozlarni kuryer orqali yetkazish. Kalkulyator orientiri, yakuniy narx — menejer tasdigʻi.",
    descRu:
      "Курьерская доставка документов и деловой корреспонденции по Узбекистану. Ориентир в калькуляторе, итог подтверждает менеджер.",
  },
  parcels: {
    titleUz: "Pochta va joʻnatmalar yetkazib berish",
    titleRu: "Доставка посылок по Узбекистану",
    descUz:
      "Shaharlararo pochta yetkazib berish. Ogʻirlik va yoʻnalish boʻyicha orientir — kalkulyatorda.",
    descRu:
      "Междугородняя доставка посылок по Узбекистану. Ориентир по весу и маршруту — в калькуляторе.",
  },
  door: {
    titleUz: "Eshikdan eshikka yetkazib berish",
    titleRu: "Доставка до двери / курьер на дом",
    descUz:
      "Punktga bormasdan eshikgacha yetkazish. Toshkent va boshqa shaharlar — soʻrov boʻyicha.",
    descRu:
      "Доставка до двери без визита в пункт. Ташкент и другие города — расчёт по запросу.",
  },
  courier: {
    titleUz: "Kuryer chaqirish — olib ketish",
    titleRu: "Вызов курьера — забор отправления",
    descUz:
      "Kuryer manzilingizga kelib joʻnatmani oladi. Kalkulyatorda pickup bilan orientir.",
    descRu:
      "Курьер заберёт отправление с вашего адреса. Ориентир с опцией забора — в калькуляторе.",
  },
  ecommerce: {
    titleUz: "Internet-doʻkonlar uchun yetkazib berish",
    titleRu: "Доставка для интернет-магазинов",
    descUz:
      "E-commerce logistika: ommaviy joʻnatmalar, statuslar, individual shartlar — ochiq tarifsiz.",
    descRu:
      "Логистика для e-commerce: массовые отправления, статусы, индивидуальные условия — без публичного прайса.",
  },
  corporate: {
    titleUz: "Korporativ yetkazib berish",
    titleRu: "Корпоративная доставка по Узбекистану",
    descUz:
      "Kompaniyalar uchun muntazam olib ketish va hisobotlar. Tijorat taklifi — ariza orqali.",
    descRu:
      "Регулярный забор и отчётность для компаний. Коммерческое предложение — по заявке.",
  },
  cod: {
    titleUz: "Yetkazib berishda toʻlov (COD)",
    titleRu: "Доставка с оплатой при получении (COD)",
    descUz:
      "Qabul qiluvchidan toʻlov yigʻish bilan yetkazib berish — biznes shartlari boʻyicha.",
    descRu:
      "Доставка с приёмом оплаты у получателя — на согласованных бизнес-условиях.",
  },
  returns: {
    titleUz: "Qaytarish joʻnatmalari",
    titleRu: "Возвратные отправления",
    descUz:
      "Internet-doʻkonlar uchun qaytarish logistikasi. Shartlar menejer bilan kelishiladi.",
    descRu:
      "Обратная логистика для интернет-магазинов. Условия согласуются с менеджером.",
  },
};

export function isServiceSlug(value: string): value is ServiceSlug {
  return (SERVICE_SLUGS as readonly string[]).includes(value);
}

export function servicePath(slug: string) {
  return `/services/${slug}/`;
}

export function serviceMetaTitle(locale: Locale, slug: ServiceSlug): string {
  const row = SERVICE_SEO[slug];
  return locale === "uz" ? row.titleUz : row.titleRu;
}

export function serviceMetaDescription(
  locale: Locale,
  slug: ServiceSlug,
): string {
  const row = SERVICE_SEO[slug];
  return locale === "uz" ? row.descUz : row.descRu;
}
