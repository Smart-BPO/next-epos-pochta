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
  receiverNameLabel: string;
  receiverPhoneLabel: string;
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
  fcargoLinkTitle: string;
  fcargoLinkLead: string;
  fcargoSendCode: string;
  fcargoCodeLabel: string;
  fcargoVerify: string;
  fcargoResend: string;
  fcargoUnlink: string;
  fcargoLinked: string;
  fcargoNoCustomer: string;
  fcargoRateLimited: string;
  fcargoInvalidCode: string;
  fcargoError: string;
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
  contactTitle: "Telefonni koʻrsatish",
  contactLead:
    "Raqam menejer siz bilan bogʻlanishi uchun kerak. Keyin joʻnatmani rasmiylashtirasiz.",
  shareContact: "Telegramdan raqamni ulashish",
  shareHint: "Telegram oynasida raqamni tasdiqlang.",
  orManual: "yoki raqamni qoʻlda kiriting",
  phoneLabel: "Telefon",
  phonePlaceholder: "+998 __ ___ __ __",
  nameLabel: "Ism",
  namePlaceholder: "Ismingiz",
  saveContact: "Kontaktni saqlash",
  contactSaved: "Kontakt ulandi",
  changeContact: "Boshqa raqam",
  contactRequired: "Avval telefonni koʻrsating — Profil yoki shu yerda.",
  calcTitle: "Yetkazib berish narxi",
  calcLead: "Yoʻnalish va ogʻirlikni kiriting. Bu taxminiy smeta.",
  calcCta: "Hisoblash",
  calcResult: "Taxminiy narx",
  calcEta: "Muddat",
  calcToShip: "Joʻnatmani rasmiylashtirish",
  calcNeedRoute: "Qayerdan va qayerga ni tanlang",
  shipmentTitle: "Joʻnatmani rasmiylashtirish",
  shipmentLead:
    "Yoʻnalish, qabul qiluvchi va parametrlar. Soʻrov yuborilgach trek-raqam beriladi.",
  fromLabel: "Qayerdan",
  toLabel: "Qayerga",
  receiverNameLabel: "Qabul qiluvchi ismi",
  receiverPhoneLabel: "Qabul qiluvchi telefoni",
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
  successTitle: "Joʻnatma ochildi",
  successText: "Trek-raqam:",
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
  profileLead: "Telefon, til va shaxsiy kabinet.",
  profileSupport: "Operator bilan bogʻlanish",
  profileAbout: "EPOS POCHTA — Oʻzbekiston boʻylab yetkazib berish.",
  profileLang: "Til",
  fcargoLinkTitle: "Shaxsiy kabinet",
  fcargoLinkLead:
    "Telefoningizga SMS-kod yuboramiz. Tasdiqlang — eski joʻnatmalar ochiladi va yangi buyurtma qulayroq boʻladi.",
  fcargoSendCode: "SMS-kod olish",
  fcargoCodeLabel: "SMS-kod",
  fcargoVerify: "Tasdiqlash",
  fcargoResend: "Kodni qayta yuborish",
  fcargoUnlink: "Kabinetni uzish",
  fcargoLinked: "Kabinet ulangan",
  fcargoNoCustomer:
    "Bu raqam hali mijoz sifatida roʻyxatda yoʻq. Avval joʻnatma soʻrovini yuboring, keyin kabinetni ulang.",
  fcargoRateLimited: "Juda koʻp urinish. Keyinroq qayta urinib koʻring.",
  fcargoInvalidCode: "Kod notoʻgʻri yoki muddati tugagan.",
  fcargoError: "Xatolik. Qayta urinib koʻring.",
  blockedTitle: "Faqat Telegram da",
  blockedLead:
    "Bu ilova faqat @epos_pochta_bot orqali ochiladi. Oddiy brauzerda ishlamaydi.",
  blockedCta: "Botni ochish",
  outsideTelegram:
    "Brauzerda ochilgan. Ilovani bot orqali oching.",
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
  contactTitle: "Указать телефон",
  contactLead:
    "Номер нужен, чтобы менеджер мог связаться с вами. После этого можно оформлять отправление.",
  shareContact: "Поделиться номером из Telegram",
  shareHint: "Подтвердите номер в окне Telegram.",
  orManual: "или введите номер вручную",
  phoneLabel: "Телефон",
  phonePlaceholder: "+998 __ ___ __ __",
  nameLabel: "Имя",
  namePlaceholder: "Ваше имя",
  saveContact: "Сохранить контакт",
  contactSaved: "Контакт подключён",
  changeContact: "Другой номер",
  contactRequired: "Сначала укажите телефон — в Профиле или здесь.",
  calcTitle: "Стоимость доставки",
  calcLead: "Укажите маршрут и вес. Это ориентировочная смета.",
  calcCta: "Рассчитать",
  calcResult: "Ориентир",
  calcEta: "Срок",
  calcToShip: "Оформить отправление",
  calcNeedRoute: "Выберите откуда и куда",
  shipmentTitle: "Оформление отправления",
  shipmentLead:
    "Маршрут, получатель и параметры. После отправки заявки появится трек-номер.",
  fromLabel: "Откуда",
  toLabel: "Куда",
  receiverNameLabel: "Имя получателя",
  receiverPhoneLabel: "Телефон получателя",
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
  successTitle: "Отправление создано",
  successText: "Трек-номер:",
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
  profileLead: "Телефон, язык и личный кабинет.",
  profileSupport: "Связаться с оператором",
  profileAbout: "EPOS POCHTA — доставка по Узбекистану.",
  profileLang: "Язык",
  fcargoLinkTitle: "Личный кабинет",
  fcargoLinkLead:
    "Отправим SMS-код на ваш номер. После подтверждения откроются прошлые отправления и удобное оформление новых.",
  fcargoSendCode: "Получить SMS-код",
  fcargoCodeLabel: "SMS-код",
  fcargoVerify: "Подтвердить",
  fcargoResend: "Отправить код ещё раз",
  fcargoUnlink: "Отключить кабинет",
  fcargoLinked: "Кабинет подключён",
  fcargoNoCustomer:
    "Этот номер ещё не в базе клиентов. Сначала оформите отправление, затем подключите кабинет.",
  fcargoRateLimited: "Слишком много попыток. Попробуйте позже.",
  fcargoInvalidCode: "Неверный или просроченный код.",
  fcargoError: "Ошибка. Попробуйте ещё раз.",
  blockedTitle: "Только в Telegram",
  blockedLead:
    "Это приложение открывается только через @epos_pochta_bot. В обычном браузере недоступно.",
  blockedCta: "Открыть бота",
  outsideTelegram:
    "Открыто в браузере. Откройте приложение через бота.",
  required: "Обязательное поле",
  invalidPhone: "Введите корректный номер телефона",
  submitError: "Не удалось отправить. Попробуйте ещё раз.",
  loading: "Загрузка…",
};

const zh: WebAppCopy = {
  brand: "EPOS POCHTA",
  title: "通过 Telegram 寄件",
  lead: "估算、办理快件并查看状态。",
  tabCalc: "估算",
  tabShip: "寄件",
  tabTrack: "运单",
  tabProfile: "资料",
  contactTitle: "填写手机号",
  contactLead: "经理需要电话联系您。填写后即可办理寄件。",
  shareContact: "从 Telegram 分享号码",
  shareHint: "请在 Telegram 弹窗中确认号码。",
  orManual: "或手动输入号码",
  phoneLabel: "电话",
  phonePlaceholder: "+998 __ ___ __ __",
  nameLabel: "姓名",
  namePlaceholder: "您的姓名",
  saveContact: "保存联系方式",
  contactSaved: "联系方式已绑定",
  changeContact: "更换号码",
  contactRequired: "请先填写手机号 — 在资料页或这里。",
  calcTitle: "运费",
  calcLead: "填写线路和重量。这是参考报价。",
  calcCta: "计算",
  calcResult: "参考价",
  calcEta: "时效",
  calcToShip: "办理快件",
  calcNeedRoute: "请选择出发地和目的地",
  shipmentTitle: "办理快件",
  shipmentLead: "填写线路、收件人和参数。提交后会生成运单号。",
  fromLabel: "出发地",
  toLabel: "目的地",
  receiverNameLabel: "收件人姓名",
  receiverPhoneLabel: "收件人电话",
  weightLabel: "重量（公斤）",
  dimsLabel: "尺寸（厘米）",
  lengthLabel: "长度",
  widthLabel: "宽度",
  heightLabel: "高度",
  commentLabel: "备注",
  commentPlaceholder: "包装、时间、其他信息",
  submitShipment: "提交申请",
  disclaimer: "这不是最终价格，也不是要约。经理确认后我们会联系您。",
  successTitle: "快件已创建",
  successText: "运单号：",
  newShipment: "再寄一件",
  trackTitle: "我的快件",
  trackLead: "状态和运单号在这里。",
  trackEmpty: "还没有快件。请从估算或办理开始。",
  trackAll: "全部",
  trackActive: "进行中",
  trackDone: "已确认",
  trackWaiting: "等待运单号",
  trackOpenSite: "在网站打开",
  trackHighlight: "新申请",
  statusPending: "等待经理",
  statusConfirmed: "已确认",
  statusCancelled: "已取消",
  statusDraft: "草稿",
  profileTitle: "资料",
  profileLead: "电话、语言和个人中心。",
  profileSupport: "联系客服",
  profileAbout: "EPOS POCHTA — 乌兹别克斯坦配送。",
  profileLang: "语言",
  fcargoLinkTitle: "个人中心",
  fcargoLinkLead:
    "我们会向您的手机发送验证码。确认后可查看以往运单，并更方便地下新单。",
  fcargoSendCode: "获取验证码",
  fcargoCodeLabel: "短信验证码",
  fcargoVerify: "确认",
  fcargoResend: "重新发送验证码",
  fcargoUnlink: "退出个人中心",
  fcargoLinked: "个人中心已连接",
  fcargoNoCustomer: "该号码尚未登记为客户。请先寄件，然后再连接个人中心。",
  fcargoRateLimited: "尝试过多，请稍后再试。",
  fcargoInvalidCode: "验证码错误或已过期。",
  fcargoError: "出错了，请再试一次。",
  blockedTitle: "仅在 Telegram 中",
  blockedLead: "本应用只能通过 @epos_pochta_bot 打开，普通浏览器不可用。",
  blockedCta: "打开机器人",
  outsideTelegram: "当前在浏览器中打开。请通过机器人打开应用。",
  required: "必填",
  invalidPhone: "请输入正确的电话号码",
  submitError: "发送失败。请再试一次。",
  loading: "加载中…",
};

export function getWebAppCopy(locale: Locale): WebAppCopy {
  if (locale === "ru") return ru;
  if (locale === "zh") return zh;
  return uz;
}
