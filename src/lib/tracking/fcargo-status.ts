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

export function fcargoStatusCopy(
  code: string | null | undefined,
  locale: "uz" | "ru",
  fallbackName?: string | null,
): { label: string; stage: TrackingStatusCode } {
  const key = (code ?? "").trim().toUpperCase();
  const hit = FCARGO_STATUS_COPY[key];
  if (hit) return { label: hit[locale], stage: hit.stage };
  return {
    label: fallbackName?.trim() || (locale === "uz" ? "Holat yangilanmoqda" : "Статус обновляется"),
    stage: "unknown",
  };
}
