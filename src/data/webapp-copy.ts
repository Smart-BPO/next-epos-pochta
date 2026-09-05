import type { Locale } from "@/i18n/config";

export type WebAppCopy = {
  brand: string;
  title: string;
  lead: string;
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
  outsideTelegram: string;
  required: string;
  invalidPhone: string;
  submitError: string;
};

const uz: WebAppCopy = {
  brand: "EPOS POCHTA",
  title: "Telegram orqali joʻnatma",
  lead: "Avval kontaktni ulashing — keyin yoʻnalishni rasmiylashtiramiz.",
  contactTitle: "Kontaktni ulash",
  contactLead:
    "Telefon raqamingiz menejer va keyingi admin panel bilan bogʻlanadi. Shundan keyin joʻnatma yaratish ochiladi.",
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
  shipmentTitle: "Joʻnatmani rasmiylashtirish",
  shipmentLead: "Yoʻnalish va parametrlarni kiriting. Yakuniy narxni menejer tasdiqlaydi.",
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
    "Bu yakuniy narx emas. Menejer hisobni tasdiqlagach bogʻlanamiz.",
  successTitle: "Soʻrov qabul qilindi",
  successText: "Menejer tez orada bogʻlanadi. Soʻrov ID:",
  newShipment: "Yana joʻnatma",
  outsideTelegram:
    "Brauzerda ochilgan. Telegram Mini App da kontaktni bitta tugma bilan ulash mumkin; shu yerda raqamni qoʻlda kiriting.",
  required: "Majburiy maydon",
  invalidPhone: "Telefon raqamini toʻgʻri kiriting",
  submitError: "Yuborib boʻlmadi. Qayta urinib koʻring.",
};

const ru: WebAppCopy = {
  brand: "EPOS POCHTA",
  title: "Отправление через Telegram",
  lead: "Сначала поделитесь контактом — затем оформите направление.",
  contactTitle: "Подключить контакт",
  contactLead:
    "Телефон нужен, чтобы связать вас с менеджером и будущей админкой. После этого откроется оформление отправления.",
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
  shipmentTitle: "Оформление отправления",
  shipmentLead: "Укажите маршрут и параметры. Итоговую цену подтвердит менеджер.",
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
    "Это не финальная цена. После подтверждения менеджером мы свяжемся с вами.",
  successTitle: "Заявка принята",
  successText: "Менеджер скоро свяжется. ID заявки:",
  newShipment: "Ещё отправление",
  outsideTelegram:
    "Открыто в браузере. В Telegram Mini App контакт можно отправить одной кнопкой; здесь введите номер вручную.",
  required: "Обязательное поле",
  invalidPhone: "Введите корректный номер телефона",
  submitError: "Не удалось отправить. Попробуйте ещё раз.",
};

export function getWebAppCopy(locale: Locale): WebAppCopy {
  return locale === "ru" ? ru : uz;
}
