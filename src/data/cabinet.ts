import type { Locale } from "@/i18n/config";
import { loc } from "@/i18n/loc";

export function cabinetCopy(locale: Locale) {
  return {
    title: loc(locale, "Kabinet", "Кабинет", "个人中心"),
    lead: loc(
      locale,
      "Telefon orqali kabinetni ulang — joʻnatmalarni koʻring va yangi buyurtma yarating.",
      "Подключите кабинет по телефону — смотрите отправления и создавайте новые.",
      "用手机号连接个人中心 — 查看运单并创建新订单。",
    ),
    metaTitle: loc(
      locale,
      "Kabinet — EPOS POCHTA",
      "Кабинет — EPOS POCHTA",
      "个人中心 — EPOS POCHTA",
    ),
    metaDescription: loc(
      locale,
      "EPOS POCHTA kabineti: hisobni ulash, joʻnatmalar va yangi buyurtma.",
      "Кабинет EPOS POCHTA: вход по SMS, отправления и новый заказ.",
      "EPOS POCHTA 个人中心：短信登录、运单与新订单。",
    ),
    navLabel: loc(locale, "Kabinet", "Кабинет", "个人中心"),
    phoneLabel: loc(locale, "Telefon", "Телефон", "电话"),
    codeLabel: loc(locale, "SMS kod", "SMS-код", "短信验证码"),
    sendCode: loc(locale, "Kod yuborish", "Отправить код", "发送验证码"),
    resendCode: loc(locale, "Qayta yuborish", "Отправить ещё раз", "重新发送"),
    verify: loc(locale, "Tasdiqlash", "Подтвердить", "确认"),
    logout: loc(locale, "Chiqish", "Выйти", "退出"),
    linkedAs: loc(locale, "Bogʻlangan hisob", "Привязанный аккаунт", "已绑定账户"),
    packagesTitle: loc(locale, "Joʻnatmalar", "Отправления", "运单"),
    emptyPackages: loc(
      locale,
      "Hali joʻnatma yoʻq.",
      "Пока нет отправлений.",
      "暂无运单。",
    ),
    newShipment: loc(locale, "Yangi joʻnatma", "Новое отправление", "新订单"),
    fromLabel: loc(locale, "Qayerdan", "Откуда", "发件地"),
    toLabel: loc(locale, "Qayerga", "Куда", "收件地"),
    receiverName: loc(locale, "Qabul qiluvchi", "Получатель", "收件人"),
    receiverPhone: loc(
      locale,
      "Qabul qiluvchi telefoni",
      "Телефон получателя",
      "收件人电话",
    ),
    weightLabel: loc(locale, "Ogʻirlik (kg)", "Вес (кг)", "重量（公斤）"),
    dimsLabel: loc(
      locale,
      "Oʻlchamlar (sm)",
      "Размеры (см)",
      "尺寸（厘米）",
    ),
    commentLabel: loc(locale, "Izoh", "Комментарий", "备注"),
    submitShipment: loc(
      locale,
      "Buyurtma yaratish",
      "Создать заказ",
      "创建订单",
    ),
    successTitle: loc(
      locale,
      "Buyurtma qabul qilindi",
      "Заказ принят",
      "订单已创建",
    ),
    trackLabel: loc(locale, "Trek-raqam", "Трек-номер", "运单号"),
    noCustomer: loc(
      locale,
      "Bu raqam hali mijoz sifatida roʻyxatda yoʻq. Avval buyurtma qoldiring, keyin kabinetni ulang.",
      "Этот номер ещё не в базе клиентов. Сначала оставьте заказ, затем подключите кабинет.",
      "该号码尚未登记为客户。请先下单，然后再连接个人中心。",
    ),
    contactCta: loc(locale, "Aloqa", "Контакты", "联系我们"),
    rateLimited: loc(
      locale,
      "Juda koʻp urinish. Birozdan keyin qayta urinib koʻring.",
      "Слишком много попыток. Попробуйте позже.",
      "尝试次数过多，请稍后再试。",
    ),
    invalidCode: loc(
      locale,
      "Kod notoʻgʻri yoki muddati tugagan.",
      "Неверный или просроченный код.",
      "验证码错误或已过期。",
    ),
    genericError: loc(
      locale,
      "Xatolik yuz berdi. Qayta urinib koʻring.",
      "Произошла ошибка. Попробуйте ещё раз.",
      "出错了，请再试一次。",
    ),
    disclaimer: loc(
      locale,
      "Yakuniy narxni menejer tasdiqlaydi. Bu oferta emas.",
      "Финальную цену подтверждает менеджер. Это не оферта.",
      "最终价格由经理确认。这不是要约。",
    ),
  };
}
