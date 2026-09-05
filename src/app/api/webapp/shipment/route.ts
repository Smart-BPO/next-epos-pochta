import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { hasSupabaseAdminConfig } from "@/lib/supabase/env";

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
  const sessionId = body.sessionId.trim();
  const row = {
    id,
    contact_session_id: sessionId,
    locale: body.locale === "ru" ? "ru" : "uz",
    phone: body.phone ?? "",
    telegram_user_id:
      typeof body.telegramUserId === "number" ? body.telegramUserId : null,
    from_settlement_id: body.fromSettlementId,
    to_settlement_id: body.toSettlementId,
    from_label: body.fromLabel ?? "",
    to_label: body.toLabel ?? "",
    weight_kg: toNumber(body.weightKg),
    length_cm: toNumber(body.lengthCm),
    width_cm: toNumber(body.widthCm),
    height_cm: toNumber(body.heightCm),
    comment: (body.comment ?? "").trim(),
    status: "pending_manager",
    track_number: null,
    price_status: "pending_manager",
  };

  if (!hasSupabaseAdminConfig()) {
    console.info("[webapp:shipment]", JSON.stringify(row));
    return NextResponse.json({ ok: true, id });
  }

  try {
    const admin = createSupabaseAdminClient();
    const { data: contact } = await admin
      .from("epos_webapp_contacts")
      .select("session_id")
      .eq("session_id", sessionId)
      .maybeSingle();
    if (!contact) {
      return NextResponse.json({ error: "contact_not_found" }, { status: 401 });
    }

    const { error } = await admin.from("epos_webapp_shipments").insert(row);
    if (error) {
      console.error("[webapp:shipment:db]", error.message);
      return NextResponse.json({ error: "db_error" }, { status: 500 });
    }
  } catch (err) {
    console.error("[webapp:shipment:db]", err);
    return NextResponse.json({ error: "db_error" }, { status: 500 });
  }

  // TODO(tracking-api): allocate track number after manager confirms
  return NextResponse.json({ ok: true, id });
}
