import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { hasSupabaseAdminConfig } from "@/lib/supabase/env";
import { dispatchNotification } from "@/lib/messaging/dispatch";
import { leadClientLabel } from "@/lib/cms/lead-display";

type LeadType = "price" | "business" | "contact";

interface LeadPayload {
  type: LeadType;
  locale?: string;
  pageUrl?: string;
  utm?: Record<string, string>;
  requestId?: string;
  website?: string;
  data: Record<string, unknown>;
}

const rateMap = new Map<string, { count: number; resetAt: number }>();
const idempotencyMap = new Map<string, { id: string; createdAt: number }>();

function createLeadId() {
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, "0");
  const d = String(now.getUTCDate()).padStart(2, "0");
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `EP-${y}${m}${d}-${rand}`;
}

function clientKey(request: Request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

function checkRateLimit(key: string) {
  const now = Date.now();
  const entry = rateMap.get(key);
  if (!entry || entry.resetAt < now) {
    rateMap.set(key, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  if (entry.count >= 8) return false;
  entry.count += 1;
  return true;
}

function pruneMaps() {
  const now = Date.now();
  for (const [k, v] of idempotencyMap) {
    if (now - v.createdAt > 24 * 60 * 60 * 1000) idempotencyMap.delete(k);
  }
}

function pickPhone(data: Record<string, unknown>): string {
  const phone =
    (typeof data.phone === "string" && data.phone) ||
    (typeof data.tel === "string" && data.tel) ||
    "";
  return phone;
}

function pickEmail(data: Record<string, unknown>): string {
  return typeof data.email === "string" ? data.email : "";
}

function pickName(data: Record<string, unknown>): string {
  return leadClientLabel({ data });
}

export async function POST(request: Request) {
  pruneMaps();

  let body: LeadPayload;
  try {
    body = (await request.json()) as LeadPayload;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  if (body.website) {
    return NextResponse.json({ id: createLeadId(), ok: true });
  }

  if (!body.type || !body.data || typeof body.data !== "object") {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
  }

  const ip = clientKey(request);
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  if (body.requestId && hasSupabaseAdminConfig()) {
    try {
      const admin = createSupabaseAdminClient();
      const { data: existing } = await admin
        .from("epos_leads")
        .select("id")
        .eq("request_id", body.requestId)
        .maybeSingle();
      if (existing?.id) {
        return NextResponse.json({
          id: existing.id,
          ok: true,
          duplicate: true,
        });
      }
    } catch {
      // fall through
    }
  }

  if (body.requestId && idempotencyMap.has(body.requestId)) {
    const existing = idempotencyMap.get(body.requestId)!;
    return NextResponse.json({ id: existing.id, ok: true, duplicate: true });
  }

  const id = createLeadId();
  if (body.requestId) {
    idempotencyMap.set(body.requestId, { id, createdAt: Date.now() });
  }

  const locale = body.locale === "ru" ? "ru" : "uz";
  const name = pickName(body.data);
  const phone = pickPhone(body.data);
  const email = pickEmail(body.data);
  const details = JSON.stringify(body.data, null, 2);
  const name_part = name && name !== "—" ? `, ${name.split(/\s+/)[0]}` : "";

  if (hasSupabaseAdminConfig()) {
    try {
      const admin = createSupabaseAdminClient();
      const { error } = await admin.from("epos_leads").insert({
        id,
        type: body.type,
        locale,
        status: "new",
        source: "website",
        payload: {
          pageUrl: body.pageUrl ?? "",
          data: body.data,
        },
        utm: body.utm ?? {},
        request_id: body.requestId ?? null,
        notified_email: false,
        notified_telegram: false,
      });
      if (error) console.error("[lead:db]", error.message);
    } catch (err) {
      console.error("[lead:db]", err);
    }
  } else {
    console.info("[lead]", id, body.type);
  }

  const data = {
    id,
    type: body.type,
    name,
    name_part,
    phone,
    email,
    details,
    locale,
  };

  let notifiedEmail = false;
  let notifiedTelegram = false;

  try {
    const staff = await dispatchNotification({
      event: "lead_created_staff",
      locale,
      data,
      entityType: "lead",
      entityId: id,
      idempotencyKey: `lead-staff-${id}`,
      leadIdForTelegram: id,
    });
    notifiedEmail = staff.sent.some((s) => s.channel === "email" && s.ok);
    notifiedTelegram = staff.sent.some((s) => s.channel === "telegram" && s.ok);
  } catch (err) {
    console.error("[lead:notify-staff]", err);
  }

  try {
    await dispatchNotification({
      event: "lead_created_customer",
      locale,
      data,
      entityType: "lead",
      entityId: id,
      idempotencyKey: `lead-customer-${id}`,
    });
  } catch (err) {
    console.error("[lead:notify-customer]", err);
  }

  if (hasSupabaseAdminConfig() && (notifiedEmail || notifiedTelegram)) {
    try {
      const admin = createSupabaseAdminClient();
      await admin
        .from("epos_leads")
        .update({
          notified_email: notifiedEmail,
          notified_telegram: notifiedTelegram,
        })
        .eq("id", id);
    } catch {
      // non-fatal
    }
  }

  return NextResponse.json({ id, ok: true });
}
