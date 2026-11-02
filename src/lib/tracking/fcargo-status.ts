import type { Locale } from "@/i18n/config";
import type { TrackingStatusCode } from "./types";

type StatusCopy = { uz: string; ru: string; stage: TrackingStatusCode };

/**
 * Customer-facing labels for FCargo package status codes (GET /statuses).
 * Problem codes use neutral wording — internal FCargo names (e.g. EXCEPTION
 * "price comment required") are not shown to customers.
 */
export const FCARGO_STATUS_COPY: Record<string, StatusCopy> = {
  CREATED: { uz: "Ariza qabul qilindi", ru: "Заявка принята", stage: "created" },
  ON_HOLD: {
    uz: "Ma’lumotlar aniqlashtirilmoqda",
    ru: "Уточняем данные",
    stage: "created",
  },
  EXCEPTION: {
    uz: "Menejer siz bilan bog‘lanadi",
    ru: "Менеджер свяжется с вами",
    stage: "created",
  },
  PICKUP_ASSIGNED: {
    uz: "Olib ketish uchun kuryer tayinlandi",
    ru: "Назначен курьер на забор",
    stage: "accepted",
  },
  AWAITING_PICKUP: {
    uz: "Olib ketish boshqa vaqtga ko‘chirildi",
    ru: "Забор перенесён",
    stage: "accepted",
  },
  PICKUP_STARTED: {
    uz: "Kuryer jo‘natma uchun yo‘lga chiqdi",
    ru: "Курьер выехал за отправлением",
    stage: "accepted",
  },
  PICKUP_FAILED: {
    uz: "Jo‘natmani olib bo‘lmadi",
    ru: "Не удалось забрать отправление",
    stage: "accepted",
  },
  PICKED_UP: { uz: "Jo‘natma kuryerda", ru: "Отправление у курьера", stage: "accepted" },
  AWAITING_HANDOVER: {
    uz: "Kuryer omborga topshirmoqda",
    ru: "Курьер сдаёт на склад",
    stage: "accepted",
  },
  RECEIVED_AT_ORIGIN_WAREHOUSE: {
    uz: "Jo‘natish omboriga qabul qilindi",
    ru: "Принято на складе отправки",
    stage: "accepted",
  },
  REPACKED: { uz: "Qayta qadoqlandi", ru: "Переупаковано", stage: "accepted" },
  READY_FOR_DISPATCH: {
    uz: "Jo‘natishga tayyor",
    ru: "Готово к отправке",
    stage: "accepted",
  },
  IN_TRANSIT: { uz: "Yo‘lda", ru: "В пути", stage: "in_transit" },
  RECEIVED_AT_HUB: {
    uz: "Saralash markazida",
    ru: "В сортировочном центре",
    stage: "in_transit",
  },
  ARRIVED_AT_DESTINATION_WAREHOUSE: {
    uz: "Qabul qiluvchi omboriga yetib keldi",
    ru: "Прибыло на склад получателя",
    stage: "in_transit",
  },
  RECEIVED_AT_DESTINATION_WAREHOUSE: {
    uz: "Qabul qiluvchi omboriga yetib keldi",
    ru: "Прибыло на склад получателя",
    stage: "in_transit",
  },
  DELIVERY_ASSIGNED: {
    uz: "Yetkazish uchun kuryerga berildi",
    ru: "Передано курьеру на доставку",
    stage: "out_for_delivery",
  },
  OUT_FOR_DELIVERY: {
    uz: "Kuryer jo‘natmani olib kelmoqda",
    ru: "Курьер везёт отправление",
    stage: "out_for_delivery",
  },
  DELIVERY_ATTEMPT_FAILED: {
    uz: "Yetkazib bo‘lmadi",
    ru: "Не удалось доставить",
    stage: "delivery_attempt",
  },
  DELIVERY_RESCHEDULED: {
    uz: "Yetkazish boshqa vaqtga ko‘chirildi",
    ru: "Доставка перенесена",
    stage: "delivery_attempt",
  },
  DELIVERED: { uz: "Yetkazib berildi", ru: "Доставлено", stage: "delivered" },
  REFUSED: {
    uz: "Qabul qiluvchi rad etdi",
    ru: "Получатель отказался",
    stage: "delivery_attempt",
  },
  MISSING: {
    uz: "Ishlov berish kechikmoqda, siz bilan bog‘lanamiz",
    ru: "Обработка задерживается, мы свяжемся с вами",
    stage: "unknown",
  },
  DAMAGED: {
    uz: "Ishlov berish kechikmoqda, siz bilan bog‘lanamiz",
    ru: "Обработка задерживается, мы свяжемся с вами",
    stage: "unknown",
  },
  AWAITING_SENDER_DECISION: {
    uz: "Jo‘natuvchi qarorini kutyapmiz",
    ru: "Ждём решения отправителя",
    stage: "delivery_attempt",
  },
  RETURN_RECEIVED_AT_WAREHOUSE: {
    uz: "Qaytarish: omborda",
    ru: "Возврат: на складе",
    stage: "returned",
  },
  RETURN_IN_TRANSIT: { uz: "Qaytarish: yo‘lda", ru: "Возврат: в пути", stage: "returned" },
  RETURN_OUT_FOR_DELIVERY: {
    uz: "Qaytarish: kuryer jo‘natuvchiga olib bormoqda",
    ru: "Возврат: курьер везёт отправителю",
    stage: "returned",
  },
  RETURNED_TO_SENDER: {
    uz: "Jo‘natuvchiga qaytarildi",
    ru: "Возвращено отправителю",
    stage: "returned",
  },
  CANCELLED: { uz: "Bekor qilindi", ru: "Отменено", stage: "cancelled" },
  LOST: {
    uz: "Ishlov berish kechikmoqda, siz bilan bog‘lanamiz",
    ru: "Обработка задерживается, мы свяжемся с вами",
    stage: "unknown",
  },
  DISPOSED: { uz: "Hisobdan chiqarildi", ru: "Списано", stage: "cancelled" },
};

const STATUS_ZH: Record<string, string> = {
  CREATED: "申请已接收",
  ON_HOLD: "正在核对信息",
  EXCEPTION: "经理将与您联系",
  PICKUP_ASSIGNED: "已安排取件快递员",
  AWAITING_PICKUP: "取件已改期",
  PICKUP_STARTED: "快递员已出发取件",
  PICKUP_FAILED: "未能取到快件",
  PICKED_UP: "快件在快递员处",
  AWAITING_HANDOVER: "快递员正在交至仓库",
  RECEIVED_AT_ORIGIN_WAREHOUSE: "已到达寄出仓库",
  REPACKED: "已重新包装",
  READY_FOR_DISPATCH: "准备发出",
  IN_TRANSIT: "运输中",
  RECEIVED_AT_HUB: "在分拣中心",
  ARRIVED_AT_DESTINATION_WAREHOUSE: "已到达目的仓库",
  RECEIVED_AT_DESTINATION_WAREHOUSE: "已到达目的仓库",
  DELIVERY_ASSIGNED: "已交给派送快递员",
  OUT_FOR_DELIVERY: "快递员正在派送",
  DELIVERY_ATTEMPT_FAILED: "未能送达",
  DELIVERY_RESCHEDULED: "派送已改期",
  DELIVERED: "已送达",
  REFUSED: "收件人拒收",
  MISSING: "处理延迟，我们将与您联系",
  DAMAGED: "处理延迟，我们将与您联系",
  AWAITING_SENDER_DECISION: "等待寄件人决定",
  RETURN_RECEIVED_AT_WAREHOUSE: "退件：在仓库",
  RETURN_IN_TRANSIT: "退件：运输中",
  RETURN_OUT_FOR_DELIVERY: "退件：快递员正在送回寄件人",
  RETURNED_TO_SENDER: "已退回寄件人",
  CANCELLED: "已取消",
  LOST: "处理延迟，我们将与您联系",
  DISPOSED: "已核销",
};

export function fcargoStatusCopy(
  code: string | null | undefined,
  locale: Locale,
  fallbackName?: string | null,
): { label: string; stage: TrackingStatusCode } {
  const key = (code ?? "").trim().toUpperCase();
  const hit = FCARGO_STATUS_COPY[key];
  if (hit) {
    const label =
      locale === "zh" ? (STATUS_ZH[key] ?? hit.ru) : hit[locale];
    return { label, stage: hit.stage };
  }
  return {
    label:
      fallbackName?.trim() ||
      (locale === "uz"
        ? "Holat yangilanmoqda"
        : locale === "zh"
          ? "状态更新中"
          : "Статус обновляется"),
    stage: "unknown",
  };
}
