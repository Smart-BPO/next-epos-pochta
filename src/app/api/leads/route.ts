import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { hasSupabaseAdminConfig } from "@/lib/supabase/env";
import { dispatchNotification } from "@/lib/messaging/dispatch";
import { leadClientLabel } from "@/lib/cms/lead-display";
import {
  createLeadId,
  findLeadByRequestId,
  findLeadByResumeToken,
  mergePayload,
  normalizeDraftData,
  publicDraftPayload,
  validateDraftContact,
  validateFinalize,
} from "@/lib/leads/price-draft";

type LeadType = "price" | "business" | "contact";
type LeadMode = "full" | "draft" | "update" | "finalize";

interface LeadPayload {
  type: LeadType;
  mode?: LeadMode;
  locale?: string;
  pageUrl?: string;
  utm?: Record<string, string>;
  requestId?: string;
  uid?: string;
  step?: number;
  website?: string;
  data: Record<string, unknown>;
}

const rateMap = new Map<string, { count: number; resetAt: number }>();
const idempotencyMap = new Map<string, { id: string; createdAt: number }>();

function clientKey(request: Request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

function checkRateLimit(key: string, limit = 8) {
  const now = Date.now();
  const entry = rateMap.get(key);
  if (!entry || entry.resetAt < now) {
    rateMap.set(key, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  if (entry.count >= limit) return false;
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

async function notifyLeadCreated(opts: {
  id: string;
  type: LeadType;
  locale: "uz" | "ru";
  data: Record<string, unknown>;
}) {
  const name = pickName(opts.data);
  const phone = pickPhone(opts.data);
  const email = pickEmail(opts.data);
  const details = JSON.stringify(opts.data, null, 2);
  const name_part = name && name !== "—" ? `, ${name.split(/\s+/)[0]}` : "";
  const data = {
    id: opts.id,
    type: opts.type,
    name,
    name_part,
    phone,
    email,
    details,
    locale: opts.locale,
  };

  let notifiedEmail = false;
  let notifiedTelegram = false;

  try {
    const staff = await dispatchNotification({
      event: "lead_created_staff",
      locale: opts.locale,
      data,
      entityType: "lead",
      entityId: opts.id,
      idempotencyKey: `lead-staff-${opts.id}`,
      leadIdForTelegram: opts.id,
    });
    notifiedEmail = staff.sent.some((s) => s.channel === "email" && s.ok);
    notifiedTelegram = staff.sent.some((s) => s.channel === "telegram" && s.ok);
  } catch (err) {
    console.error("[lead:notify-staff]", err);
  }

  try {
    await dispatchNotification({
      event: "lead_created_customer",
      locale: opts.locale,
      data,
      entityType: "lead",
      entityId: opts.id,
      idempotencyKey: `lead-customer-${opts.id}`,
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
        .eq("id", opts.id);
    } catch {
      // non-fatal
    }
  }
}

async function handleDraft(body: LeadPayload, locale: "uz" | "ru") {
  if (body.type !== "price") {
    return NextResponse.json({ error: "draft_price_only" }, { status: 400 });
  }

  const data = normalizeDraftData({
    ...body.data,
    clientType: "company",
    source: "b2b_request_price",
  });
  const err = validateDraftContact(data);
  if (err) return NextResponse.json({ error: err }, { status: 400 });

  const step = Math.min(4, Math.max(1, Number(body.step) || 1));

  if (!hasSupabaseAdminConfig()) {
    const id = createLeadId();
    const uid = crypto.randomUUID();
    return NextResponse.json({ id, uid, ok: true, step, status: "draft" });
  }

  if (body.requestId) {
    const existing = await findLeadByRequestId(body.requestId);
    if (existing) {
      if (existing.status !== "draft") {
        return NextResponse.json({
          id: existing.id,
          uid: existing.resume_token,
          ok: true,
          duplicate: true,
          status: existing.status,
          step: Number(existing.payload?.meta?.step) || 4,
          complete: true,
        });
      }
      const admin = createSupabaseAdminClient();
      const payload = mergePayload(
        existing.payload,
        body.pageUrl ?? "",
        data,
        step,
        false,
      );
      await admin
        .from("epos_leads")
        .update({
          payload,
          locale,
          utm: body.utm ?? existing.utm ?? {},
        })
        .eq("id", existing.id);
      return NextResponse.json({
        id: existing.id,
        uid: existing.resume_token,
        ok: true,
        step,
        status: "draft",
      });
    }
  }

  const id = createLeadId();
  const admin = createSupabaseAdminClient();
  const { data: inserted, error } = await admin
    .from("epos_leads")
    .insert({
      id,
      type: "price",
      locale,
      status: "draft",
      source: "website",
      payload: mergePayload(undefined, body.pageUrl ?? "", data, step, false),
      utm: body.utm ?? {},
      request_id: body.requestId ?? null,
      notified_email: false,
      notified_telegram: false,
    })
    .select("id, resume_token")
    .single();

  if (error || !inserted) {
    console.error("[lead:draft]", error?.message);
    return NextResponse.json({ error: "db_error" }, { status: 500 });
  }

  if (body.requestId) {
    idempotencyMap.set(body.requestId, {
      id: inserted.id,
      createdAt: Date.now(),
    });
  }

  return NextResponse.json({
    id: inserted.id,
    uid: inserted.resume_token,
    ok: true,
    step,
    status: "draft",
  });
}

async function handleUpdate(body: LeadPayload, locale: "uz" | "ru") {
  if (body.type !== "price") {
    return NextResponse.json({ error: "update_price_only" }, { status: 400 });
  }
  const uid = typeof body.uid === "string" ? body.uid.trim() : "";
  if (!uid) return NextResponse.json({ error: "uid_required" }, { status: 400 });

  const existing = await findLeadByResumeToken(uid);
  if (!existing) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  if (existing.status !== "draft") {
    return NextResponse.json({
      id: existing.id,
      uid: existing.resume_token,
      ok: true,
      complete: true,
      status: existing.status,
      step: 4,
    });
  }

  const data = normalizeDraftData({
    ...(existing.payload?.data ?? {}),
    ...body.data,
    clientType: "company",
    source: "b2b_request_price",
  });
  const step = Math.min(4, Math.max(1, Number(body.step) || 2));

  if (!hasSupabaseAdminConfig()) {
    return NextResponse.json({
      id: existing.id,
      uid,
      ok: true,
      step,
      status: "draft",
    });
  }

  const admin = createSupabaseAdminClient();
  const payload = mergePayload(
    existing.payload,
    body.pageUrl ?? "",
    data,
    step,
    false,
  );
  await admin
    .from("epos_leads")
    .update({ payload, locale, utm: body.utm ?? existing.utm ?? {} })
    .eq("id", existing.id);

  return NextResponse.json({
    id: existing.id,
    uid: existing.resume_token,
    ok: true,
    step,
    status: "draft",
  });
}

async function handleFinalize(body: LeadPayload, locale: "uz" | "ru") {
  if (body.type !== "price") {
    return NextResponse.json({ error: "finalize_price_only" }, { status: 400 });
  }

  const uid = typeof body.uid === "string" ? body.uid.trim() : "";
  const dataIn = normalizeDraftData({
    ...body.data,
    clientType: "company",
    source: "b2b_request_price",
  });

  let existing = uid ? await findLeadByResumeToken(uid) : null;
  if (!existing && body.requestId) {
    existing = await findLeadByRequestId(body.requestId);
  }

  if (existing && existing.status !== "draft") {
    return NextResponse.json({
      id: existing.id,
      uid: existing.resume_token,
      ok: true,
      duplicate: true,
      complete: true,
      status: existing.status,
    });
  }

  const merged = normalizeDraftData({
    ...(existing?.payload?.data ?? {}),
    ...dataIn,
  });
  const err = validateFinalize(merged);
  if (err) return NextResponse.json({ error: err }, { status: 400 });

  if (!hasSupabaseAdminConfig()) {
    const id = existing?.id ?? createLeadId();
    return NextResponse.json({ id, ok: true, complete: true, status: "new" });
  }

  const admin = createSupabaseAdminClient();
  const payload = mergePayload(
    existing?.payload,
    body.pageUrl ?? "",
    merged,
    4,
    true,
  );

  let id = existing?.id;
  let resumeToken = existing?.resume_token;

  if (existing) {
    await admin
      .from("epos_leads")
      .update({
        status: "new",
        payload,
        locale,
        utm: body.utm ?? existing.utm ?? {},
      })
      .eq("id", existing.id);
  } else {
    id = createLeadId();
    const { data: inserted, error } = await admin
      .from("epos_leads")
      .insert({
        id,
        type: "price",
        locale,
        status: "new",
        source: "website",
        payload,
        utm: body.utm ?? {},
        request_id: body.requestId ?? null,
        notified_email: false,
        notified_telegram: false,
      })
      .select("id, resume_token")
      .single();
    if (error || !inserted) {
      console.error("[lead:finalize]", error?.message);
      return NextResponse.json({ error: "db_error" }, { status: 500 });
    }
    id = inserted.id;
    resumeToken = inserted.resume_token;
  }

  await notifyLeadCreated({
    id: id!,
    type: "price",
    locale,
    data: merged,
  });

  return NextResponse.json({
    id,
    uid: resumeToken,
    ok: true,
    complete: true,
    status: "new",
  });
}

async function handleFull(body: LeadPayload, locale: "uz" | "ru") {
  if (body.requestId && hasSupabaseAdminConfig()) {
    try {
      const existing = await findLeadByRequestId(body.requestId);
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

  const data = body.data;

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
          data,
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

  await notifyLeadCreated({
    id,
    type: body.type,
    locale,
    data,
  });

  return NextResponse.json({ id, ok: true });
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
  if (!checkRateLimit(ip, 12)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const locale = body.locale === "ru" ? "ru" : "uz";
  const mode: LeadMode = body.mode ?? "full";

  if (mode === "draft") return handleDraft(body, locale);
  if (mode === "update") return handleUpdate(body, locale);
  if (mode === "finalize") return handleFinalize(body, locale);
  return handleFull(body, locale);
}

export async function GET(request: Request) {
  const uid = new URL(request.url).searchParams.get("uid")?.trim() ?? "";
  if (!uid) {
    return NextResponse.json({ error: "uid_required" }, { status: 400 });
  }

  const ip = clientKey(request);
  if (!checkRateLimit(`resume-get:${ip}`, 20)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const row = await findLeadByResumeToken(uid);
  if (!row || row.type !== "price") {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return NextResponse.json(publicDraftPayload(row));
}
