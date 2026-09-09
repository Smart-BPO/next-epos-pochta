import { createHash, randomInt } from "node:crypto";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { normalizeUzMsisdn } from "@/lib/sms/playmobile";
import { dispatchNotification } from "@/lib/messaging/dispatch";

export type OtpChannel = "sms" | "email";

export type OtpPurpose =
  | "verify"
  | "login"
  | "webapp"
  | "profile_phone"
  | "profile_email";

export const PUBLIC_OTP_PURPOSES: OtpPurpose[] = ["verify", "login", "webapp"];

function hashCode(code: string): string {
  return createHash("sha256").update(code, "utf8").digest("hex");
}

const rateMap = new Map<string, { count: number; resetAt: number }>();

function checkOtpRate(key: string): boolean {
  const now = Date.now();
  const entry = rateMap.get(key);
  if (!entry || entry.resetAt < now) {
    rateMap.set(key, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  if (entry.count >= 3) return false;
  entry.count += 1;
  return true;
}

function normalizeEmail(raw: string): string | null {
  const email = raw.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;
  return email;
}

function resolveRecipient(params: {
  channel?: OtpChannel;
  recipient?: string;
  phone?: string;
}):
  | { ok: true; channel: OtpChannel; recipient: string }
  | { ok: false; error: string } {
  const channel: OtpChannel = params.channel ?? "sms";

  if (channel === "sms") {
    const raw = params.recipient ?? params.phone ?? "";
    const msisdn = normalizeUzMsisdn(raw);
    if (!msisdn) return { ok: false, error: "invalid_phone" };
    return { ok: true, channel: "sms", recipient: msisdn };
  }

  const email = normalizeEmail(params.recipient ?? "");
  if (!email) return { ok: false, error: "invalid_email" };
  return { ok: true, channel: "email", recipient: email };
}

export async function issueOtp(params: {
  /** @deprecated prefer channel + recipient; kept for /api/otp */
  phone?: string;
  channel?: OtpChannel;
  recipient?: string;
  purpose?: OtpPurpose;
  locale?: "uz" | "ru";
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const resolved = resolveRecipient(params);
  if (!resolved.ok) return resolved;

  const { channel, recipient } = resolved;
  const purpose = params.purpose ?? "verify";
  const rateKey = `${channel}:${recipient}`;
  if (!checkOtpRate(rateKey)) return { ok: false, error: "rate_limited" };

  const code = String(randomInt(100000, 999999));
  const client = createSupabaseAdminClient();
  const expires = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  const { error } = await client.from("epos_otp_challenges").insert({
    phone: channel === "sms" ? recipient : null,
    channel,
    recipient,
    code_hash: hashCode(code),
    purpose,
    expires_at: expires,
  });
  if (error) return { ok: false, error: error.message };

  if (channel === "sms") {
    const dispatch = await dispatchNotification({
      event: "otp_send",
      locale: params.locale ?? "uz",
      data: { code, phone: recipient },
      to: { phones: [recipient] },
      entityType: "otp",
      entityId: recipient,
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

  const dispatch = await dispatchNotification({
    event: "otp_email",
    locale: params.locale ?? "uz",
    data: { code, email: recipient, phone: "" },
    to: { emails: [recipient] },
    entityType: "otp",
    entityId: recipient,
  });
  const emailOk = dispatch.sent.some((s) => s.channel === "email" && s.ok);
  if (!emailOk) {
    return {
      ok: false,
      error: dispatch.sent.find((s) => !s.ok)?.error || "email_failed",
    };
  }
  return { ok: true };
}

export async function verifyOtp(params: {
  phone?: string;
  channel?: OtpChannel;
  recipient?: string;
  code: string;
  purpose?: OtpPurpose;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const resolved = resolveRecipient(params);
  if (!resolved.ok) return resolved;

  const { channel, recipient } = resolved;
  const code = params.code.replace(/\D/g, "");
  if (code.length !== 6) return { ok: false, error: "invalid_code" };

  const client = createSupabaseAdminClient();
  const { data, error } = await client
    .from("epos_otp_challenges")
    .select("id, code_hash, expires_at, attempts, consumed_at")
    .eq("channel", channel)
    .eq("recipient", recipient)
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
