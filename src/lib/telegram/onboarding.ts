import type { Locale } from "@/i18n/config";

export type BotLocale = Locale;

export type OnboardingSession = {
  locale: BotLocale;
  updatedAt: number;
};

/** Ephemeral per-chat locale for bot onboarding (resets on redeploy). */
const sessions = new Map<number, OnboardingSession>();

const TTL_MS = 7 * 24 * 60 * 60 * 1000;

export function getOnboardingSession(chatId: number): OnboardingSession | null {
  const row = sessions.get(chatId);
  if (!row) return null;
  if (Date.now() - row.updatedAt > TTL_MS) {
    sessions.delete(chatId);
    return null;
  }
  return row;
}

export function setOnboardingLocale(chatId: number, locale: BotLocale) {
  sessions.set(chatId, { locale, updatedAt: Date.now() });
}

export function clearOnboardingSession(chatId: number) {
  sessions.delete(chatId);
}

export const botOnboardingCopy = {
  uz: {
    welcome: [
      "📦 *EPOS POCHTA*",
      "",
      "Xalqaro va mahalliy yetkazib berish xizmati.",
      "Bu bot orqali joʻnatma soʻrovini Telegram Mini App da rasmiylashtirasiz — trek, yoʻnalish va menejer bilan aloqa shu yerda.",
      "",
      "🇷🇺 EPOS POCHTA — служба доставки.",
      "Оформление отправления — в Mini App.",
      "",
      "Tilni tanlang / Выберите язык:",
    ].join("\n"),
    langPicked:
      "Til: Oʻzbekcha ✅\n\nDavom etish uchun telefon raqamingizni ulashing. Shundan keyin Mini App ochiladi.",
    shareContactBtn: "📱 Raqamni ulashish",
    contactThanks: (name: string, phone: string) =>
      `Rahmat${name ? `, ${name}` : ""}! Kontakt saqlandi: ${phone}\n\nEndi Mini App ni oching — yoʻnalish va joʻnatmani u yerda rasmiylashtirasiz.`,
    openApp: "EPOS Mini App",
    needShare:
      "Iltimos, pastdagi «Raqamni ulashish» tugmasi orqali telefonni yuboring.",
    restart: "Qayta boshlash uchun /start bosing.",
  },
  ru: {
    welcome: [
      "📦 *EPOS POCHTA*",
      "",
      "Служба международной и местной доставки.",
      "Через этого бота вы оформляете заявку в Telegram Mini App — маршрут, параметры и связь с менеджером.",
      "",
      "🇺🇿 EPOS POCHTA — yetkazib berish xizmati.",
      "Joʻnatma — Mini App orqali.",
      "",
      "Выберите язык / Tilni tanlang:",
    ].join("\n"),
    langPicked:
      "Язык: Русский ✅\n\nЧтобы продолжить, поделитесь номером телефона. После этого откроется Mini App.",
    shareContactBtn: "📱 Поделиться номером",
    contactThanks: (name: string, phone: string) =>
      `Спасибо${name ? `, ${name}` : ""}! Контакт сохранён: ${phone}\n\nОткройте Mini App — маршрут и отправление оформляются там.`,
    openApp: "EPOS Mini App",
    needShare:
      "Пожалуйста, отправьте телефон кнопкой «Поделиться номером» ниже.",
    restart: "Чтобы начать заново, нажмите /start.",
  },
} as const;

/** First screen is bilingual by design; buttons pick locale. */
export function languageKeyboard() {
  return {
    inline_keyboard: [
      [
        { text: "🇺🇿 Oʻzbekcha", callback_data: "onboard:lang:uz" },
        { text: "🇷🇺 Русский", callback_data: "onboard:lang:ru" },
      ],
    ],
  };
}

export function shareContactKeyboard(locale: BotLocale) {
  const text = botOnboardingCopy[locale].shareContactBtn;
  return {
    keyboard: [[{ text, request_contact: true }]],
    resize_keyboard: true,
    one_time_keyboard: true,
  };
}

export function normalizeBotPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("998") && digits.length === 12) return `+${digits}`;
  if (digits.length === 9) return `+998${digits}`;
  if (digits.length >= 10) return `+${digits}`;
  return "";
}
