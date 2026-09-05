import { NextResponse } from "next/server";

type ShipmentPayload = {
  sessionId?: string;
  locale?: string;
  phone?: string;
  telegramUserId?: number;
  fromSettlementId?: string;
  toSettlementId?: string;
  fromLabel?: string;
  toLabel?: string;
  weightKg?: number | string;
  lengthCm?: number | string;
  widthCm?: number | string;
  heightCm?: number | string;
  comment?: string;
};

function createShipmentId() {
  const now = new Date();
  const stamp = now.toISOString().slice(0, 10).replace(/-/g, "");
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `WS-${stamp}-${rand}`;
}

function toNumber(value: unknown) {
  if (value === "" || value == null) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export async function POST(request: Request) {
  let body: ShipmentPayload;
  try {
    body = (await request.json()) as ShipmentPayload;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  if (!body.sessionId?.trim()) {
    return NextResponse.json({ error: "contact_required" }, { status: 401 });
  }
  if (!body.fromSettlementId || !body.toSettlementId) {
    return NextResponse.json({ error: "route_required" }, { status: 400 });
  }
  if (body.fromSettlementId === body.toSettlementId) {
    return NextResponse.json({ error: "same_route" }, { status: 400 });
  }

  const id = createShipmentId();
  const record = {
    id,
    kind: "webapp_shipment",
    sessionId: body.sessionId.trim(),
    locale: body.locale === "ru" ? "ru" : "uz",
    phone: body.phone ?? "",
    telegramUserId: body.telegramUserId ?? null,
    fromSettlementId: body.fromSettlementId,
    toSettlementId: body.toSettlementId,
    fromLabel: body.fromLabel ?? "",
    toLabel: body.toLabel ?? "",
    weightKg: toNumber(body.weightKg),
    lengthCm: toNumber(body.lengthCm),
    widthCm: toNumber(body.widthCm),
    heightCm: toNumber(body.heightCm),
    comment: (body.comment ?? "").trim(),
    // Client estimate must never be treated as final price / оферта
    priceStatus: "pending_manager",
    createdAt: new Date().toISOString(),
  };

  // TODO(admin): insert shipment draft linked to contact session / telegram user
  // TODO(tracking-api): allocate track number after manager confirms
  console.info("[webapp:shipment]", JSON.stringify(record));

  return NextResponse.json({
    ok: true,
    id,
  });
}
