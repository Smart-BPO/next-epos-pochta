import { createHash, randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { isLocale } from "@/i18n/config";
import { createFcargoOrder } from "@/lib/fcargo/create-order";
import { requireLinkedAccount } from "@/lib/fcargo/epos-account-auth";

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

export async function POST(request: Request) {
  let body: ShipmentBody;
  try {
    body = (await request.json()) as ShipmentBody;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const linked = await requireLinkedAccount(
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
    comment: (body.comment ?? "").trim(),
    locale,
    packageDescription: `EPOS Cabinet ${externalId}`,
    source: linked.subject.type === "telegram" ? "webapp" : "lead",
    contactSessionId:
      linked.subject.type === "telegram" ? linked.subject.id : null,
    telegramUserId:
      linked.subject.type === "telegram"
        ? Number(linked.subject.id) || null
        : null,
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

  const trackingNumber = created.order.trackingNumber;
  return NextResponse.json({
    ok: true,
    id: trackingNumber || created.order.orderId || externalId,
    trackingNumber,
    orderId: created.order.orderId,
    status: created.order.status,
    duplicate: created.order.duplicate,
  });
}
