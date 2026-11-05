export type AccountLinked = {
  id: string;
  phone: string;
  displayName: string | null;
};

export type AccountShipmentRow = {
  trackingNumber: string;
  packageId: string | number | null;
  statusCode: string | null;
  statusLabel: string;
  stage: string;
  isTerminal: boolean;
  fromLabel: string | null;
  toLabel: string | null;
  createdAt: string | null;
  estimatedDeliveryAt: string | null;
  deliveredAt: string | null;
  origin: "api" | "crm" | "catalog";
  hasTimeline: boolean;
};

export type AccountTimelineEvent = {
  code: string;
  label: string;
  occurredAt?: string;
  location?: string;
  note?: string;
};

export type AccountAuthMode =
  | { kind: "cookie" }
  | { kind: "telegram"; initData: string };

export function accountAuthBody(
  auth: AccountAuthMode,
  extra?: Record<string, unknown>,
): Record<string, unknown> {
  if (auth.kind === "telegram") {
    return { initData: auth.initData, ...extra };
  }
  return { ...extra };
}
