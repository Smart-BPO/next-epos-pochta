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
    titleUz: "Hujjatlarni kuryer orqali yetkazish",
    titleRu: "Доставка документов курьером",
    descUz:
      "Hujjat yetkazish Oʻzbekiston boʻylab: shartnomalar va muhim qogʻozlar. Kalkulyator orientiri, yakuniy narx — menejer.",
    descRu:
      "Доставка документов курьером по Узбекистану: договоры и деловая корреспонденция. Ориентир в калькуляторе, итог — менеджер.",
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
    titleUz: "Eshikdan eshikka yetkazib berish — eshikgacha",
    titleRu: "Доставка до двери — курьер на дом",
    descUz:
      "Eshikgacha yetkazish: punktga bormasdan. Toshkent va boshqa shaharlar — kalkulyator + menejer tasdigʻi.",
    descRu:
      "Доставка до двери без визита в пункт. Ташкент и регионы Узбекистана — ориентир в калькуляторе, итог подтверждает менеджер.",
  },
  courier: {
    titleUz: "Kuryer chaqirish Toshkent va viloyatlarda",
    titleRu: "Вызов курьера в Ташкенте и регионах",
    descUz:
      "Kuryer chaqirish: manzildan olib ketish. Kalkulyatorda pickup bilan orientir, muddatni menejer tasdiqlaydi.",
    descRu:
      "Вызов курьера: забор отправления с адреса. Ориентир с опцией забора в калькуляторе — слот подтверждает менеджер.",
  },
  ecommerce: {
    titleUz: "Internet-doʻkonlar uchun yetkazib berish",
    titleRu: "Доставка для интернет-магазинов",
    descUz:
      "Internet-doʻkon yetkazib berish: ommaviy joʻnatmalar, statuslar, COD imkoniyati. Individual shartlar — ochiq tarifsiz.",
    descRu:
      "Доставка для интернет-магазинов: массовые отправления, статусы, COD. Индивидуальные условия — без публичного прайса.",
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
    titleUz: "Yetkazib berishda toʻlov (COD / naqd)",
    titleRu: "Наложенный платёж при доставке (COD)",
    descUz:
      "Yetkazib berishda toʻlov: qabul qiluvchidan toʻlov yigʻish. Shartlar biznes arizasida kelishiladi.",
    descRu:
      "Наложенный платёж при доставке: приём оплаты у получателя. Условия согласуются в бизнес-заявке.",
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
