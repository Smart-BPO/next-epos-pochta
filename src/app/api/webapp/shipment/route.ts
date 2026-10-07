import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { hasSupabaseAdminConfig } from "@/lib/supabase/env";
import { isNextResponse, requireWebAppInitData } from "@/lib/webapp/auth";
import { createFcargoOrder } from "@/lib/fcargo/create-order";
import { createHash, randomBytes } from "node:crypto";

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
  receiverName?: string;
  receiverPhone?: string;
  /** Client idempotency token (stable across retries). */
  requestId?: string;
  initData?: string;
};

function toNumber(value: unknown) {
  if (value === "" || value == null) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function externalIdFor(sessionId: string, requestId: string) {
  const digest = createHash("sha256")
    .update(`${sessionId}:${requestId}`)
    .digest("hex")
    .slice(0, 12)
    .toUpperCase();
  return `WA-${digest}`;
}

export async function POST(request: Request) {
  let body: ShipmentPayload;
  try {
    body = (await request.json()) as ShipmentPayload;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const auth = requireWebAppInitData(body.initData);
  if (isNextResponse(auth)) return auth;

  if (!body.sessionId?.trim()) {
    return NextResponse.json({ error: "contact_required" }, { status: 401 });
  }
  if (!body.fromSettlementId || !body.toSettlementId) {
    return NextResponse.json({ error: "route_required" }, { status: 400 });
  }
  if (body.fromSettlementId === body.toSettlementId) {
    return NextResponse.json({ error: "same_route" }, { status: 400 });
  }

  const receiverName = (body.receiverName ?? "").trim();
  const receiverPhone = (body.receiverPhone ?? "").trim();
  if (!receiverName || !receiverPhone) {
    return NextResponse.json({ error: "receiver_required" }, { status: 400 });
  }

  const sessionId = body.sessionId.trim();
  const locale = body.locale === "ru" ? "ru" : "uz";
  const requestId =
    (typeof body.requestId === "string" && body.requestId.trim()) ||
    randomBytes(8).toString("hex");

  if (!hasSupabaseAdminConfig()) {
    return NextResponse.json({ error: "db_unavailable" }, { status: 503 });
  }

  const admin = createSupabaseAdminClient();
  const { data: contact } = await admin
    .from("epos_webapp_contacts")
    .select("session_id, telegram_user_id, phone, first_name, last_name, source")
    .eq("session_id", sessionId)
    .maybeSingle();
  if (!contact) {
    return NextResponse.json({ error: "contact_not_found" }, { status: 401 });
  }
  if (
    contact.telegram_user_id != null &&
    contact.telegram_user_id !== auth.userId
  ) {
    return NextResponse.json({ error: "telegram_mismatch" }, { status: 403 });
  }
  if (contact.source !== "telegram_contact") {
    return NextResponse.json({ error: "phone_unverified" }, { status: 403 });
  }

  const senderName =
    [contact.first_name, contact.last_name].filter(Boolean).join(" ").trim() ||
    "EPOS customer";
  const senderPhone = contact.phone || body.phone || "";
  const externalId = externalIdFor(sessionId, requestId);

  const created = await createFcargoOrder({
    externalId,
    idempotencyKey: `epos-webapp-${externalId}`,
    sender: {
      name: senderName,
      phone: senderPhone,
      settlementId: body.fromSettlementId,
      address: body.fromLabel,
    },
    receiver: {
      name: receiverName,
      phone: receiverPhone,
      settlementId: body.toSettlementId,
      address: body.toLabel,
    },
    weightKg: toNumber(body.weightKg),
    lengthCm: toNumber(body.lengthCm),
    widthCm: toNumber(body.widthCm),
    heightCm: toNumber(body.heightCm),
    comment: (body.comment ?? "").trim(),
    locale,
    packageDescription: `EPOS Mini App ${externalId}`,
    source: "webapp",
    contactSessionId: sessionId,
    telegramUserId: auth.userId,
  });

  if (!created.ok) {
    const status =
      created.message === "fcargo_not_configured"
        ? 503
        : created.message.startsWith("invalid_")
          ? 400
          : 502;
    return NextResponse.json(
      { error: created.message || "fcargo_failed" },
      { status },
    );
  }

  return NextResponse.json({
    ok: true,
    id: created.order.trackingNumber,
    trackingNumber: created.order.trackingNumber,
    orderId: created.order.orderId,
    status: created.order.status,
    duplicate: created.order.duplicate,
  });
}
