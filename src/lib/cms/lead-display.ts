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
  if (type === "business") return "Бизнес";
  if (type === "contact") return "Контакт";
  return "Расчёт";
}

export function leadTypeLabel(type: string): string {
  if (type === "price") return "Цена";
  if (type === "business") return "Бизнес";
  if (type === "contact") return "Контакт";
  return type;
}

export function formatDashDate(iso: string) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Tashkent",
  }).format(new Date(iso));
}
