import type { Locale } from "@/i18n/config";

export type WebAppCopy = {
  brand: string;
  title: string;
  lead: string;
  tabCalc: string;
  tabShip: string;
  tabTrack: string;
  tabProfile: string;
  contactTitle: string;
  contactLead: string;
  shareContact: string;
  shareHint: string;
  orManual: string;
  phoneLabel: string;
  phonePlaceholder: string;
  nameLabel: string;
  namePlaceholder: string;
  saveContact: string;
  contactSaved: string;
  changeContact: string;
  contactRequired: string;
  calcTitle: string;
  calcLead: string;
  calcCta: string;
  calcResult: string;
  calcEta: string;
  calcToShip: string;
  calcNeedRoute: string;
  shipmentTitle: string;
  shipmentLead: string;
  fromLabel: string;
  toLabel: string;
  weightLabel: string;
  dimsLabel: string;
  lengthLabel: string;
  widthLabel: string;
  heightLabel: string;
  commentLabel: string;
  commentPlaceholder: string;
  submitShipment: string;
  disclaimer: string;
  successTitle: string;
  successText: string;
  newShipment: string;
  trackTitle: string;
  trackLead: string;
  trackEmpty: string;
  trackAll: string;
  trackActive: string;
  trackDone: string;
  trackWaiting: string;
  trackOpenSite: string;
  trackHighlight: string;
  statusPending: string;
  statusConfirmed: string;
  statusCancelled: string;
  statusDraft: string;
  profileTitle: string;
  profileLead: string;
  profileSupport: string;
  profileAbout: string;
  profileLang: string;
  blockedTitle: string;
  blockedLead: string;
  blockedCta: string;
  outsideTelegram: string;
  required: string;
  invalidPhone: string;
  submitError: string;
  loading: string;
};

const uz: WebAppCopy = {
  brand: "EPOS POCHTA",
  title: "Telegram orqali joʻnatma",
  lead: "Hisoblang, joʻnatma yarating va statusni kuzating.",
  tabCalc: "Hisob",
  tabShip: "Joʻnatma",
  tabTrack: "Kuzatish",
  tabProfile: "Profil",
  contactTitle: "Kontaktni ulash",
  contactLead:
    "Telefon raqamingiz menejer bilan bogʻlanadi. Keyin joʻnatma ochiladi.",
  shareContact: "Telegram kontaktini ulashish",
  shareHint: "Telegram soʻrovida telefonni tasdiqlang.",
  orManual: "yoki raqamni qoʻlda kiriting",
  phoneLabel: "Telefon",
  phonePlaceholder: "+998 __ ___ __ __",
  nameLabel: "Ism",
  namePlaceholder: "Ismingiz",
  saveContact: "Kontaktni saqlash",
  contactSaved: "Kontakt ulandi",
  changeContact: "Boshqa raqam",
  contactRequired: "Avval kontaktni ulang — Profil yoki shu yerda.",
  calcTitle: "Yetkazib berish narxi",
  calcLead: "Yoʻnalish va ogʻirlikni kiriting. Bu taxminiy smeta.",
  calcCta: "Hisoblash",
  calcResult: "Taxminiy narx",
  calcEta: "Muddat",
  calcToShip: "Joʻnatmani rasmiylashtirish",
  calcNeedRoute: "Qayerdan va qayerga ni tanlang",
  shipmentTitle: "Joʻnatmani rasmiylashtirish",
  shipmentLead:
    "Yoʻnalish va parametrlarni kiriting. Yakuniy narxni menejer tasdiqlaydi.",
  fromLabel: "Qayerdan",
  toLabel: "Qayerga",
  weightLabel: "Ogʻirlik (kg)",
  dimsLabel: "Oʻlchamlar (sm)",
  lengthLabel: "Uzunlik",
  widthLabel: "Kenglik",
  heightLabel: "Balandlik",
  commentLabel: "Izoh",
  commentPlaceholder: "Qadoq, vaqt, qoʻshimcha maʼlumot",
  submitShipment: "Joʻnatma soʻrovini yuborish",
  disclaimer:
    "Bu yakuniy narx / оферта emas. Menejer hisobni tasdiqlagach bogʻlanamiz.",
  successTitle: "Soʻrov qabul qilindi",
  successText: "Menejer tez orada bogʻlanadi. Soʻrov ID:",
  newShipment: "Yana joʻnatma",
  trackTitle: "Mening joʻnatmalarim",
  trackLead: "Status va trek-raqam shu yerda.",
  trackEmpty: "Hali joʻnatma yoʻq. Hisobdan yoki Joʻnatma boʻlimidan boshlang.",
  trackAll: "Hammasi",
  trackActive: "Jarayonda",
  trackDone: "Tasdiqlangan",
  trackWaiting: "Trek kutilmoqda",
  trackOpenSite: "Saytda kuzatish",
  trackHighlight: "Yangi soʻrov",
  statusPending: "Menejer kutmoqda",
  statusConfirmed: "Tasdiqlangan",
  statusCancelled: "Bekor",
  statusDraft: "Qoralama",
  profileTitle: "Profil",
  profileLead: "Kontakt va til sozlamalari.",
  profileSupport: "Operator bilan bogʻlanish",
  profileAbout: "EPOS POCHTA — Oʻzbekiston boʻylab yetkazib berish.",
  profileLang: "Til",
  blockedTitle: "Faqat Telegram da",
  blockedLead:
    "Mini App faqat @epos_pochta_bot orqali ochiladi. Brauzerda ishlamaydi.",
  blockedCta: "Botni ochish",
  outsideTelegram:
    "Brauzerda ochilgan. Mini App ni bot orqali oching.",
  required: "Majburiy maydon",
  invalidPhone: "Telefon raqamini toʻgʻri kiriting",
  submitError: "Yuborib boʻlmadi. Qayta urinib koʻring.",
  loading: "Yuklanmoqda…",
};

const ru: WebAppCopy = {
  brand: "EPOS POCHTA",
  title: "Отправление через Telegram",
  lead: "Рассчитайте, оформите отправление и следите за статусом.",
  tabCalc: "Расчёт",
  tabShip: "Отправка",
  tabTrack: "Треки",
  tabProfile: "Профиль",
  contactTitle: "Подключить контакт",
  contactLead:
    "Телефон нужен для связи с менеджером. После этого откроется оформление.",
  shareContact: "Поделиться контактом Telegram",
  shareHint: "Подтвердите телефон в запросе Telegram.",
  orManual: "или введите номер вручную",
  phoneLabel: "Телефон",
  phonePlaceholder: "+998 __ ___ __ __",
  nameLabel: "Имя",
  namePlaceholder: "Ваше имя",
  saveContact: "Сохранить контакт",
  contactSaved: "Контакт подключён",
  changeContact: "Другой номер",
  contactRequired: "Сначала подключите контакт — в Профиле или здесь.",
  calcTitle: "Стоимость доставки",
  calcLead: "Укажите маршрут и вес. Это ориентировочная смета.",
  calcCta: "Рассчитать",
  calcResult: "Ориентир",
  calcEta: "Срок",
  calcToShip: "Оформить отправление",
  calcNeedRoute: "Выберите откуда и куда",
  shipmentTitle: "Оформление отправления",
  shipmentLead:
    "Укажите маршрут и параметры. Итоговую цену подтвердит менеджер.",
  fromLabel: "Откуда",
  toLabel: "Куда",
  weightLabel: "Вес (кг)",
  dimsLabel: "Габариты (см)",
  lengthLabel: "Длина",
  widthLabel: "Ширина",
  heightLabel: "Высота",
  commentLabel: "Комментарий",
  commentPlaceholder: "Упаковка, время, доп. информация",
  submitShipment: "Отправить заявку",
  disclaimer:
    "Это не финальная цена и не оферта. После подтверждения менеджером мы свяжемся.",
  successTitle: "Заявка принята",
  successText: "Менеджер скоро свяжется. ID заявки:",
  newShipment: "Ещё отправление",
  trackTitle: "Мои отправления",
  trackLead: "Статус и трек-номер здесь.",
  trackEmpty: "Пока нет отправлений. Начните с расчёта или оформления.",
  trackAll: "Все",
  trackActive: "В работе",
  trackDone: "Подтверждённые",
  trackWaiting: "Трек ожидается",
  trackOpenSite: "Открыть на сайте",
  trackHighlight: "Новая заявка",
  statusPending: "Ждёт менеджера",
  statusConfirmed: "Подтверждено",
  statusCancelled: "Отменено",
  statusDraft: "Черновик",
  profileTitle: "Профиль",
  profileLead: "Контакт и язык.",
  profileSupport: "Связаться с оператором",
  profileAbout: "EPOS POCHTA — доставка по Узбекистану.",
  profileLang: "Язык",
  blockedTitle: "Только в Telegram",
  blockedLead:
    "Mini App открывается только через @epos_pochta_bot. В браузере недоступно.",
  blockedCta: "Открыть бота",
  outsideTelegram:
    "Открыто в браузере. Откройте Mini App через бота.",
  required: "Обязательное поле",
  invalidPhone: "Введите корректный номер телефона",
  submitError: "Не удалось отправить. Попробуйте ещё раз.",
  loading: "Загрузка…",
};

export function getWebAppCopy(locale: Locale): WebAppCopy {
  return locale === "ru" ? ru : uz;
}
