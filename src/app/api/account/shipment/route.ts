import { createHash, randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { isLocale } from "@/i18n/config";
import { createFcargoOrder } from "@/lib/fcargo/create-order";
import { requireActiveLink } from "@/lib/fcargo/epos-account-auth";
import { logFcargoRequest } from "@/lib/fcargo/log";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { hasSupabaseAdminConfig } from "@/lib/supabase/env";

type ShipmentBody = {
  initData?: string;
  locale?: string;
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
  requestId?: string;
  declaredValue?: number | string;
  isFragile?: boolean;
  payerType?: string;
};

function toNumber(value: unknown) {
  if (value === "" || value == null) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function externalIdFor(linkId: string, requestId: string) {
  const digest = createHash("sha256")
    .update(`${linkId}:${requestId}`)
    .digest("hex")
    .slice(0, 12)
    .toUpperCase();
  return `AC-${digest}`;
}

async function resolveWebappSessionId(
  telegramUserId: string,
): Promise<string | null> {
  if (!hasSupabaseAdminConfig() || !telegramUserId) return null;
  const admin = createSupabaseAdminClient();
  const tgId = Number(telegramUserId);
  if (!Number.isFinite(tgId)) return null;
  const { data } = await admin
    .from("epos_webapp_contacts")
    .select("session_id")
    .eq("telegram_user_id", tgId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  const sessionId =
    typeof data?.session_id === "string" ? data.session_id.trim() : "";
  return sessionId || null;
}

export async function POST(request: Request) {
  let body: ShipmentBody;
  try {
    body = (await request.json()) as ShipmentBody;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  // Orders use CMS Client API key + sender from link row — live bearer not required.
  const linked = await requireActiveLink(
    request,
    body as Record<string, unknown>,
  );
  if (!linked.ok) return linked.response;

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

  const locale = isLocale(body.locale) ? body.locale : "uz";
  const requestId =
    (typeof body.requestId === "string" && body.requestId.trim()) ||
    randomBytes(8).toString("hex");
  const externalId = externalIdFor(linked.link.id, requestId);
  const senderName =
    (linked.link.display_name ?? "").trim() || "EPOS customer";

  const isTelegram = linked.subject.type === "telegram";
  const contactSessionId = isTelegram
    ? await resolveWebappSessionId(linked.subject.id)
    : null;
  const telegramUserId = isTelegram
    ? Number(linked.subject.id) || null
    : null;

  const payerRaw = (body.payerType ?? "").trim();
  const payerType =
    payerRaw === "receiver" || payerRaw === "third_party"
      ? payerRaw
      : "sender";

  const created = await createFcargoOrder({
    externalId,
    idempotencyKey: `epos-account-${externalId}`,
    sender: {
      name: senderName,
      phone: linked.link.phone,
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
    declaredValue: toNumber(body.declaredValue),
    isFragile: body.isFragile === true,
    payerType,
    comment: (body.comment ?? "").trim(),
    locale,
    packageDescription: `EPOS ${isTelegram ? "WebApp" : "Cabinet"} ${externalId}`,
    source: isTelegram ? "webapp" : "cabinet",
    contactSessionId,
    telegramUserId,
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

  const linkedCustomerId = (linked.link.fcargo_client_id ?? "").trim();
  if (
    created.order.customerId != null &&
    linkedCustomerId &&
    String(created.order.customerId) !== linkedCustomerId
  ) {
    logFcargoRequest({
      direction: "out",
      source: "out_api",
      method: "POST",
      path: "/orders",
      ok: true,
      httpStatus: 201,
      orderId: created.order.orderId,
      trackingNumber: created.order.trackingNumber,
      errorCode: "sender_customer_mismatch",
      errorMessage: `order sender_customer_id=${created.order.customerId} != link.fcargo_client_id=${linkedCustomerId}`,
      requestBody: {
        linked_customer_id: linkedCustomerId,
        sender_customer_id: created.order.customerId,
        phone: linked.link.phone,
      },
    });
  }

  const trackingNumber = created.order.trackingNumber;
  return NextResponse.json({
    ok: true,
    id: trackingNumber || externalId,
    trackingNumber,
    status: created.order.status,
    duplicate: created.order.duplicate,
  });
}
