export function leadClientLabel(payload: unknown): string {
  const data =
    payload && typeof payload === "object" && "data" in payload
      ? ((payload as { data?: Record<string, unknown> }).data ?? {})
      : ((payload as Record<string, unknown>) ?? {});
  const name =
    (typeof data.name === "string" && data.name) ||
    (typeof data.fullName === "string" && data.fullName) ||
    (typeof data.contactName === "string" && data.contactName) ||
    "";
  const phone =
    (typeof data.phone === "string" && data.phone) ||
    (typeof data.tel === "string" && data.tel) ||
    "";
  return name || phone || "—";
}

export function leadRouteLabel(type: string, payload: unknown): string {
  const data =
    payload && typeof payload === "object" && "data" in payload
      ? ((payload as { data?: Record<string, unknown> }).data ?? {})
      : ((payload as Record<string, unknown>) ?? {});
  const from =
    (typeof data.from === "string" && data.from) ||
    (typeof data.fromCity === "string" && data.fromCity) ||
    "";
  const to =
    (typeof data.to === "string" && data.to) ||
    (typeof data.toCity === "string" && data.toCity) ||
    "";
  if (from && to) return `${from} → ${to}`;
  const routes = typeof data.routes === "string" ? data.routes.trim() : "";
  if (routes) {
    return routes.length > 48 ? `${routes.slice(0, 48)}…` : routes;
  }
  if (type === "business") return "Бизнес";
  if (type === "contact") return "Контакт";
  if (type === "price") return "B2B / цена";
  return "Расчёт";
}

export function leadDraftStep(payload: unknown): number | null {
  if (!payload || typeof payload !== "object") return null;
  const meta = (payload as { meta?: { step?: unknown } }).meta;
  const step = Number(meta?.step);
  return Number.isFinite(step) && step > 0 ? step : null;
}

export function leadTypeLabel(
  type: string,
  labels?: { price: string; business: string; contact: string },
): string {
  if (type === "price") return labels?.price ?? "Цена";
  if (type === "business") return labels?.business ?? "Бизнес";
  if (type === "contact") return labels?.contact ?? "Контакт";
  return type;
}

export function formatDashDate(iso: string, locale: string = "ru-RU") {
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Tashkent",
  }).format(new Date(iso));
}
