import type { Locale } from "@/i18n/config";
import type { TelegramContact, TelegramUser, TelegramWebApp } from "./telegram-types";

export function getTelegramWebApp(): TelegramWebApp | null {
  if (typeof window === "undefined") return null;
  return window.Telegram?.WebApp ?? null;
}

export function detectWebAppLocale(fallback: Locale = "uz"): Locale {
  const tg = getTelegramWebApp();
  const code = tg?.initDataUnsafe?.user?.language_code?.toLowerCase() ?? "";
  if (code.startsWith("ru")) return "ru";
  if (code.startsWith("uz")) return "uz";
  if (typeof window !== "undefined") {
    const q = new URLSearchParams(window.location.search).get("lang");
    if (q === "ru" || q === "uz") return q;
  }
  return fallback;
}

export function telegramUserSnapshot(user?: TelegramUser | null) {
  if (!user) return null;
  return {
    id: user.id,
    firstName: user.first_name ?? "",
    lastName: user.last_name ?? "",
    username: user.username ?? "",
    languageCode: user.language_code ?? "",
    photoUrl: user.photo_url ?? "",
  };
}

export function normalizeTelegramPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("998") && digits.length === 12) return `+${digits}`;
  if (digits.length === 9) return `+998${digits}`;
  if (phone.startsWith("+") && digits.length >= 10) return `+${digits}`;
  return phone.trim();
}

type ContactRequestedEvent = {
  status?: "sent" | "cancelled";
  responseUnsafe?: {
    contact?: TelegramContact;
  };
  response?: {
    contact?: TelegramContact;
  };
};

/** Ask Telegram for phone; falls back to null when unavailable (browser / old clients). */
export function requestTelegramContact(): Promise<TelegramContact | null> {
  const tg = getTelegramWebApp();
  if (!tg?.requestContact) return Promise.resolve(null);

  return new Promise((resolve) => {
    let settled = false;
    const finish = (contact: TelegramContact | null) => {
      if (settled) return;
      settled = true;
      tg.offEvent("contactRequested", onContactRequested);
      resolve(contact);
    };

    const onContactRequested = (event?: unknown) => {
      const payload = (event ?? {}) as ContactRequestedEvent;
      if (payload.status === "cancelled") {
        finish(null);
        return;
      }
      const contact =
        payload.responseUnsafe?.contact ?? payload.response?.contact ?? null;
      finish(contact);
    };

    tg.onEvent("contactRequested", onContactRequested);
    try {
      tg.requestContact((shared) => {
        // Some clients only return a boolean; contact may arrive via event.
        if (!shared) finish(null);
      });
    } catch {
      finish(null);
    }

    // Safety timeout — manual form remains available.
    window.setTimeout(() => finish(null), 20_000);
  });
}
