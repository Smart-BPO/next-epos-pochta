import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { hasSupabaseAdminConfig } from "@/lib/supabase/env";
import {
  getTelegramChatId,
  hasTelegramBotToken,
  leadStatusInlineKeyboard,
  sendMessage,
} from "@/lib/telegram/bot";

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

function formatLeadText(record: Record<string, unknown>) {
  return JSON.stringify(record, null, 2);
}

async function notifyResend(record: {
  id: string;
  type: LeadType;
  [key: string]: unknown;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const notifyTo =
    process.env.RESEND_NOTIFY_TO || process.env.NEXT_PUBLIC_CONTACT_EMAIL;
  const from =
    process.env.RESEND_FROM || "EPOS POCHTA <onboarding@resend.dev>";
  if (!apiKey || !notifyTo) return false;

  const resend = new Resend(apiKey);
  await resend.emails.send({
    from,
    to: notifyTo,
    subject: `[EPOS] ${record.type.toUpperCase()} ${record.id}`,
    text: formatLeadText(record),
  });
  return true;
}

async function notifyTelegram(record: {
  id: string;
  type: LeadType;
  [key: string]: unknown;
}) {
  if (!hasTelegramBotToken()) return false;
  const chatId = getTelegramChatId();
  if (!chatId) return false;

  const text = `EPOS lead ${record.type.toUpperCase()} ${record.id}\n\n${formatLeadText(record)}`;
  const result = await sendMessage({
    chatId,
    text,
    replyMarkup: leadStatusInlineKeyboard(record.id),
  });
  if (!result.ok) {
    throw new Error(result.description);
  }
  return true;
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
      // fall through to memory map
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

  const record = {
    id,
    type: body.type,
    locale: body.locale ?? "uz",
    pageUrl: body.pageUrl ?? "",
    utm: body.utm ?? {},
    createdAt: new Date().toISOString(),
    data: body.data,
  };

  let notifiedEmail = false;
  let notifiedTelegram = false;

  if (hasSupabaseAdminConfig()) {
    try {
      const admin = createSupabaseAdminClient();
      const { error } = await admin.from("epos_leads").insert({
        id,
        type: body.type,
        locale: body.locale === "ru" ? "ru" : "uz",
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
      if (error) {
        console.error("[lead:db]", error.message);
      }
    } catch (err) {
      console.error("[lead:db]", err);
    }
  } else {
    console.info("[lead]", JSON.stringify(record));
  }

  const notifyResults = await Promise.allSettled([
    notifyResend(record),
    notifyTelegram(record),
  ]);

  notifyResults.forEach((result, index) => {
    if (result.status === "fulfilled" && result.value) {
      if (index === 0) notifiedEmail = true;
      else notifiedTelegram = true;
    }
    if (result.status === "rejected") {
      console.error(
        index === 0 ? "[lead:email]" : "[lead:telegram]",
        result.reason,
      );
    }
  });

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
