import { NextResponse } from "next/server";
import {
  resolveFcargoWebhookSecret,
  timingSafeEqualString,
} from "@/lib/fcargo/settings";
import { logFcargoRequest } from "@/lib/fcargo/log";
import {
  applyFcargoStatusUpdate,
  parseFcargoWebhookPayload,
} from "@/lib/fcargo/sync-status";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function extractSecret(request: Request): string {
  const header =
    request.headers.get("x-fcargo-webhook-secret") ||
    request.headers.get("X-Fcargo-Webhook-Secret") ||
    "";
  if (header.trim()) return header.trim();

  const auth = request.headers.get("authorization") || "";
  const m = /^Bearer\s+(.+)$/i.exec(auth.trim());
  return m?.[1]?.trim() || "";
}

async function readBody(request: Request): Promise<unknown> {
  const contentType = (request.headers.get("content-type") || "").toLowerCase();
  if (contentType.includes("application/json")) {
    return request.json().catch(() => null);
  }
  if (
    contentType.includes("application/x-www-form-urlencoded") ||
    contentType.includes("multipart/form-data")
  ) {
    const form = await request.formData().catch(() => null);
    if (!form) return null;
    const obj: Record<string, unknown> = {};
    form.forEach((value, key) => {
      obj[key] = typeof value === "string" ? value : value.name;
    });
    return obj;
  }
  const text = await request.text().catch(() => "");
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

export async function POST(request: Request) {
  const expected = await resolveFcargoWebhookSecret();
  if (!expected) {
    return NextResponse.json(
      { ok: false, error: "webhook_secret_not_configured" },
      { status: 503 },
    );
  }

  const provided = extractSecret(request);
  if (!provided || !timingSafeEqualString(provided, expected)) {
    logFcargoRequest({
      direction: "in",
      method: "POST",
      path: "/api/fcargo/webhook",
      httpStatus: 401,
      ok: false,
      errorCode: "UNAUTHORIZED",
      errorMessage: "invalid_webhook_secret",
    });
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const body = await readBody(request);
  const parsed = parseFcargoWebhookPayload(body);

  logFcargoRequest({
    direction: "in",
    method: "POST",
    path: "/api/fcargo/webhook",
    httpStatus: 200,
    ok: true,
    leadId: parsed.externalOrderId,
    orderId: parsed.orderId != null ? String(parsed.orderId) : undefined,
    trackingNumber: parsed.tracking,
    requestBody: body,
  });

  const result = await applyFcargoStatusUpdate(parsed);

  return NextResponse.json({
    ok: true,
    applied: result.ok,
    leadId: result.leadId ?? null,
    fcargoStatus: result.fcargoStatus ?? null,
    crmStatus: result.crmStatus ?? null,
    message: result.message ?? null,
  });
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "fcargo-webhook",
    hint: "POST status events with X-Fcargo-Webhook-Secret",
  });
}
