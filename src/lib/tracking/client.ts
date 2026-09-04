import type { Locale } from "@/i18n/config";
import type { TrackingLookupResult, TrackingShipment } from "./types";
import { isValidTrackingNumber, normalizeTrackingNumber } from "./types";

const DEMO_NUMBER = "000000";

function demoShipment(locale: Locale): TrackingShipment {
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  const labels =
    locale === "uz"
      ? {
          created: "Buyurtma yaratildi",
          accepted: "Punktga qabul qilindi",
          inTransit: "Yoʻlda",
          out: "Yetkazishga chiqdi",
          delivered: "Yetkazildi",
          tashkent: "Toshkent",
          samarkand: "Samarqand",
        }
      : {
          created: "Заявка создана",
          accepted: "Принято в пункте",
          inTransit: "В пути",
          out: "Передано курьеру",
          delivered: "Доставлено",
          tashkent: "Ташкент",
          samarkand: "Самарканд",
        };

  return {
    number: DEMO_NUMBER,
    status: "delivered",
    updatedAt: new Date(now - day).toISOString(),
    events: [
      {
        code: "created",
        label: labels.created,
        occurredAt: new Date(now - 4 * day).toISOString(),
        location: labels.tashkent,
      },
      {
        code: "accepted",
        label: labels.accepted,
        occurredAt: new Date(now - 3 * day).toISOString(),
        location: labels.tashkent,
      },
      {
        code: "in_transit",
        label: labels.inTransit,
        occurredAt: new Date(now - 2 * day).toISOString(),
        location: labels.samarkand,
      },
      {
        code: "out_for_delivery",
        label: labels.out,
        occurredAt: new Date(now - day - 8 * 60 * 60 * 1000).toISOString(),
        location: labels.samarkand,
      },
      {
        code: "delivered",
        label: labels.delivered,
        occurredAt: new Date(now - day).toISOString(),
        location: labels.samarkand,
        note:
          locale === "uz"
            ? "Demo joʻnatma — haqiqiy API ulanmagan"
            : "Демо-отправление — реальный API не подключён",
      },
    ],
  };
}

/**
 * Client adapter for shipment lookup.
 * TODO(tracking-api): replace stub with real EPOS tracking HTTP client.
 * Demo number 000000 returns a local success timeline until the API is live.
 */
export async function lookupTracking(
  rawNumber: string,
  locale: Locale = "uz",
): Promise<TrackingLookupResult> {
  const number = normalizeTrackingNumber(rawNumber);
  if (!number || !isValidTrackingNumber(number)) {
    return { ok: false, error: "invalid_format" };
  }

  if (number === DEMO_NUMBER) {
    return { ok: true, shipment: demoShipment(locale) };
  }

  // Honest stub: never invent delivery history for real-looking numbers.
  return { ok: false, error: "unavailable" };
}
