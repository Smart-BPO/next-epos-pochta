export type WebAppContactSession = {
  sessionId: string;
  phone: string;
  firstName: string;
  lastName?: string;
  telegramUserId?: number;
  telegramUsername?: string;
  linkedAt: string;
  source: "telegram_contact" | "manual";
};

const STORAGE_KEY = "epos_webapp_contact_v1";

export function readContactSession(): WebAppContactSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as WebAppContactSession;
    if (!parsed?.sessionId || !parsed?.phone) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeContactSession(session: WebAppContactSession) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function clearContactSession() {
  window.localStorage.removeItem(STORAGE_KEY);
}
