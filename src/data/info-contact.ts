import type { Locale } from "@/i18n/config";
import { loc } from "@/i18n/loc";
import { localePath } from "@/i18n/paths";
import { SITE_CONFIG } from "@/utils/consts";

export type InfoContactLink = {
  id: string;
  href: string;
  title: string;
  description: string;
  external?: boolean;
};

function telegramHandle(url: string) {
  try {
    const name = new URL(url).pathname.replace(/^\/+|\/+$/g, "");
    return name ? `@${name}` : url;
  } catch {
    return url;
  }
}

export function infoContactCopy(locale: Locale) {
  return {
    metaTitle: loc(locale, "Aloqa", "Контакты", "联系方式"),
    metaDescription: loc(
      locale,
      "EPOS POCHTA: telefon, Telegram, bot va sayt.",
      "EPOS POCHTA: телефон, Telegram, бот и сайт.",
      "EPOS POCHTA：电话、Telegram、机器人和网站。",
    ),
    lead: loc(
      locale,
      "Oʻzbekiston boʻylab kuryerlik yetkazib berish. Qoʻngʻiroq qiling, Telegramda yozing yoki saytga kiring.",
      "Курьерская доставка по Узбекистану. Позвоните, напишите в Telegram или откройте сайт.",
      "乌兹别克斯坦快递配送。可以致电、在 Telegram 留言，或打开网站。",
    ),
    hours: loc(
      locale,
      SITE_CONFIG.hoursDisplayUz,
      SITE_CONFIG.hoursDisplayRu,
      SITE_CONFIG.hoursDisplayZh,
    ),
    languageLabel: loc(locale, "Til", "Язык", "语言"),
  };
}

export function infoContactLinks(locale: Locale): InfoContactLink[] {
  return [
    {
      id: "phone",
      href: `tel:${SITE_CONFIG.phone}`,
      title: SITE_CONFIG.phoneDisplay,
      description: loc(
        locale,
        "Operatorga qoʻngʻiroq qiling",
        "Позвоните оператору",
        "致电接线员",
      ),
    },
    {
      id: "telegram",
      href: SITE_CONFIG.telegramUrl,
      title: telegramHandle(SITE_CONFIG.telegramUrl),
      description: loc(
        locale,
        "Operatorga yozing",
        "Напишите оператору",
        "给接线员发消息",
      ),
      external: true,
    },
    {
      id: "bot",
      href: SITE_CONFIG.telegramBotUrl,
      title: telegramHandle(SITE_CONFIG.telegramBotUrl),
      description: loc(
        locale,
        "Buyurtma, kuzatuv va kabinet",
        "Заказ, отслеживание и кабинет",
        "下单、查询和个人账户",
      ),
      external: true,
    },
    {
      id: "site",
      href: localePath(locale, "/"),
      title: "epos-pochta.uz",
      description: loc(
        locale,
        "Kalkulyator, kuzatuv va xizmatlar",
        "Калькулятор, отслеживание и услуги",
        "计算器、查询与服务",
      ),
    },
  ];
}
