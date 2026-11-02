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
      "Oʻzbekiston boʻylab yetkazib berish.",
      "",
      "Bu yerda nima qilasiz:",
      "1) telefon raqamingizni ulashasiz",
      "2) ilovani ochasiz",
      "3) yoʻnalish va joʻnatmani rasmiylashtirasiz, trekni kuzatasiz",
      "",
      "Tilni tanlang / Выберите язык / 请选择语言：",
    ].join("\n"),
    langPicked:
      "Til: Oʻzbekcha ✅\n\nDavom etish uchun pastdagi tugma orqali telefon raqamingizni ulashing. Keyin EPOS ilovasini ochamiz.",
    shareContactBtn: "📱 Raqamni ulashish",
    contactThanks: (name: string, phone: string) =>
      `Rahmat${name ? `, ${name}` : ""}! Raqam saqlandi: ${phone}\n\nEndi «EPOS ilovasini ochish» tugmasini bosing — hisoblash, joʻnatma va treklar shu yerda.`,
    openApp: "EPOS ilovasini ochish",
    needShare:
      "Iltimos, pastdagi «Raqamni ulashish» tugmasi orqali telefonni yuboring.",
    restart: "Qayta boshlash uchun /start bosing.",
  },
  ru: {
    welcome: [
      "📦 *EPOS POCHTA*",
      "",
      "Доставка по Узбекистану.",
      "",
      "Что делать дальше:",
      "1) поделитесь номером телефона",
      "2) откройте приложение",
      "3) оформите отправление и следите за треком",
      "",
      "Выберите язык / Tilni tanlang / 请选择语言：",
    ].join("\n"),
    langPicked:
      "Язык: Русский ✅\n\nЧтобы продолжить, нажмите кнопку ниже и поделитесь номером телефона. Затем откроем приложение EPOS.",
    shareContactBtn: "📱 Поделиться номером",
    contactThanks: (name: string, phone: string) =>
      `Спасибо${name ? `, ${name}` : ""}! Номер сохранён: ${phone}\n\nНажмите «Открыть приложение EPOS» — там расчёт, оформление и ваши треки.`,
    openApp: "Открыть приложение EPOS",
    needShare:
      "Пожалуйста, отправьте телефон кнопкой «Поделиться номером» ниже.",
    restart: "Чтобы начать заново, нажмите /start.",
  },
  zh: {
    welcome: [
      "📦 *EPOS POCHTA*",
      "",
      "乌兹别克斯坦境内快递。",
      "",
      "接下来请：",
      "1）分享手机号",
      "2）打开应用",
      "3）下单并查看运单",
      "",
      "请选择语言 / Tilni tanlang / Выберите язык：",
    ].join("\n"),
    langPicked:
      "语言：中文 ✅\n\n请点击下方按钮分享手机号。之后将打开 EPOS 应用。",
    shareContactBtn: "📱 分享号码",
    contactThanks: (name: string, phone: string) =>
      `谢谢${name ? `，${name}` : ""}！号码已保存：${phone}\n\n请点击「打开 EPOS 应用」— 在那里估算、下单并查看运单。`,
    openApp: "打开 EPOS 应用",
    needShare: "请使用下方「分享号码」按钮发送电话。",
    restart: "要重新开始，请点击 /start。",
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
      [{ text: "🇨🇳 中文", callback_data: "onboard:lang:zh" }],
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
