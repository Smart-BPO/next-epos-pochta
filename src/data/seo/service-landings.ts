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
  {
    titleUz: string;
    titleRu: string;
    titleZh: string;
    descUz: string;
    descRu: string;
    descZh: string;
  }
> = {
  documents: {
    titleUz: "Hujjatlarni kuryer orqali yetkazish",
    titleRu: "Доставка документов курьером по Узбекистану",
    titleZh: "乌兹别克斯坦文件快递",
    descUz:
      "Hujjat yetkazish Oʻzbekiston boʻylab: shartnomalar va muhim qogʻozlar. Kalkulyator orientiri, yakuniy narx — menejer.",
    descRu:
      "Доставка документов курьером по Узбекистану: договоры и деловая корреспонденция. Ориентир в калькуляторе, итог — менеджер EPOS POCHTA.",
    descZh:
      "乌兹别克斯坦境内的文件快递：合同与商务信函。计算器为参考价，最终价格由 EPOS POCHTA 经理确认。",
  },
  parcels: {
    titleUz: "Pochta va joʻnatmalar yetkazib berish",
    titleRu: "Доставка посылок по Узбекистану",
    titleZh: "乌兹别克斯坦包裹配送",
    descUz:
      "Shaharlararo pochta yetkazib berish. Ogʻirlik va yoʻnalish boʻyicha orientir — kalkulyatorda.",
    descRu:
      "Междугородняя доставка посылок по Узбекистану. Ориентир по весу и маршруту — в калькуляторе.",
    descZh: "乌兹别克斯坦城际包裹配送。按重量和线路在计算器中查看参考价。",
  },
  door: {
    titleUz: "Eshikgacha yetkazib berish — eshikdan eshikka",
    titleRu: "Доставка до двери — курьер на дом по Узбекистану",
    titleZh: "送货上门 — 乌兹别克斯坦上门快递",
    descUz:
      "Eshikgacha yetkazish: punktga bormasdan. Toshkent va boshqa shaharlar — kalkulyator + menejer tasdigʻi.",
    descRu:
      "Доставка до двери без визита в пункт. Ташкент и регионы — ориентир в калькуляторе, итог подтверждает менеджер EPOS POCHTA.",
    descZh:
      "无需去网点的送货上门。塔什干及各地区 — 计算器为参考价，最终由 EPOS POCHTA 经理确认。",
  },
  courier: {
    titleUz: "Kuryer chaqirish Toshkent va viloyatlarda",
    titleRu: "Вызвать курьера в Ташкенте — забор отправления",
    titleZh: "在塔什干叫快递员 — 上门取件",
    descUz:
      "Kuryer chaqirish: manzildan olib ketish. Kalkulyatorda pickup bilan orientir, muddatni menejer tasdiqlaydi.",
    descRu:
      "Вызов курьера в Ташкенте и регионах: забор с адреса. Ориентир с опцией забора в калькуляторе — слот подтверждает менеджер.",
    descZh: "塔什干及各地区上门取件。计算器中可勾选取件，具体时段由经理确认。",
  },
  ecommerce: {
    titleUz: "Internet-doʻkonlar uchun yetkazib berish",
    titleRu: "Доставка для интернет-магазинов — e-com логистика",
    titleZh: "网店配送 — 电商物流",
    descUz:
      "Internet-doʻkon yetkazib berish: ommaviy joʻnatmalar, statuslar, COD imkoniyati. Individual shartlar — ochiq tarifsiz.",
    descRu:
      "Доставка для интернет-магазинов: массовые отправления, статусы, COD. Индивидуальные условия без публичного прайса — EPOS POCHTA.",
    descZh: "网店配送：批量寄件、状态、货到付款。单独条件，不公布公开价目 — EPOS POCHTA。",
  },
  corporate: {
    titleUz: "Korporativ yetkazib berish",
    titleRu: "Корпоративная доставка по Узбекистану",
    titleZh: "乌兹别克斯坦企业配送",
    descUz:
      "Kompaniyalar uchun muntazam olib ketish va hisobotlar. Tijorat taklifi — ariza orqali.",
    descRu:
      "Регулярный забор и отчётность для компаний. Коммерческое предложение — по заявке.",
    descZh: "面向公司的定期取件与报表。商务方案按申请提供。",
  },
  cod: {
    titleUz: "Yetkazib berishda toʻlov (COD / naqd)",
    titleRu: "Наложенный платёж при доставке — COD",
    titleZh: "货到付款 — COD",
    descUz:
      "Yetkazib berishda toʻlov: qabul qiluvchidan toʻlov yigʻish. Shartlar biznes arizasida kelishiladi.",
    descRu:
      "Наложенный платёж при доставке (COD): приём оплаты у получателя. Условия согласуются в бизнес-заявке EPOS POCHTA.",
    descZh: "配送时向收件人收款（COD）。条件在 EPOS POCHTA 企业申请中约定。",
  },
  returns: {
    titleUz: "Qaytarish joʻnatmalari",
    titleRu: "Возвратные отправления",
    titleZh: "退件",
    descUz:
      "Internet-doʻkonlar uchun qaytarish logistikasi. Shartlar menejer bilan kelishiladi.",
    descRu:
      "Обратная логистика для интернет-магазинов. Условия согласуются с менеджером.",
    descZh: "面向网店的逆向物流。条件与经理约定。",
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
  if (locale === "uz") return row.titleUz;
  if (locale === "zh") return row.titleZh;
  return row.titleRu;
}

export function serviceMetaDescription(
  locale: Locale,
  slug: ServiceSlug,
): string {
  const row = SERVICE_SEO[slug];
  if (locale === "uz") return row.descUz;
  if (locale === "zh") return row.descZh;
  return row.descRu;
}
