import { createHash, randomInt } from "node:crypto";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { normalizeUzMsisdn } from "@/lib/sms/playmobile";
import { dispatchNotification } from "@/lib/messaging/dispatch";

function hashCode(code: string): string {
  return createHash("sha256").update(code, "utf8").digest("hex");
}

const rateMap = new Map<string, { count: number; resetAt: number }>();

function checkOtpRate(phone: string): boolean {
  const now = Date.now();
  const entry = rateMap.get(phone);
  if (!entry || entry.resetAt < now) {
    rateMap.set(phone, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  if (entry.count >= 3) return false;
  entry.count += 1;
  return true;
}

export async function issueOtp(params: {
  phone: string;
  purpose?: "verify" | "login" | "webapp";
  locale?: "uz" | "ru";
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const msisdn = normalizeUzMsisdn(params.phone);
  if (!msisdn) return { ok: false, error: "invalid_phone" };
  if (!checkOtpRate(msisdn)) return { ok: false, error: "rate_limited" };

  const code = String(randomInt(100000, 999999));
  const client = createSupabaseAdminClient();
  const expires = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  const { error } = await client.from("epos_otp_challenges").insert({
    phone: msisdn,
    code_hash: hashCode(code),
    purpose: params.purpose ?? "verify",
    expires_at: expires,
  });
  if (error) return { ok: false, error: error.message };

  const dispatch = await dispatchNotification({
    event: "otp_send",
    locale: params.locale ?? "uz",
    data: { code, phone: msisdn },
    to: { phones: [msisdn] },
    entityType: "otp",
    entityId: msisdn,
  });

  const smsOk = dispatch.sent.some((s) => s.channel === "sms" && s.ok);
  if (!smsOk) {
    return {
      ok: false,
      error: dispatch.sent.find((s) => !s.ok)?.error || "sms_failed",
    };
  }
  return { ok: true };
}

export async function verifyOtp(params: {
  phone: string;
  code: string;
  purpose?: "verify" | "login" | "webapp";
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const msisdn = normalizeUzMsisdn(params.phone);
  if (!msisdn) return { ok: false, error: "invalid_phone" };
  const code = params.code.replace(/\D/g, "");
  if (code.length < 4) return { ok: false, error: "invalid_code" };

  const client = createSupabaseAdminClient();
  const { data, error } = await client
    .from("epos_otp_challenges")
    .select("id, code_hash, expires_at, attempts, consumed_at")
    .eq("phone", msisdn)
    .eq("purpose", params.purpose ?? "verify")
    .is("consumed_at", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) return { ok: false, error: error.message };
  if (!data) return { ok: false, error: "not_found" };
  if (data.consumed_at) return { ok: false, error: "already_used" };
  if (new Date(data.expires_at).getTime() < Date.now()) {
    return { ok: false, error: "expired" };
  }
  if (data.attempts >= 5) return { ok: false, error: "too_many_attempts" };

  const ok = data.code_hash === hashCode(code);
  await client
    .from("epos_otp_challenges")
    .update({
      attempts: data.attempts + 1,
      consumed_at: ok ? new Date().toISOString() : null,
    })
    .eq("id", data.id);

  if (!ok) return { ok: false, error: "invalid_code" };
  return { ok: true };
}
