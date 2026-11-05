import { NextResponse } from "next/server";
import {
  clientIp,
  countRecentOtpAttempts,
  logOtpAttempt,
  normalizeAccountPhone,
  storeOtpChallenge,
} from "@/lib/fcargo/epos-account";
import {
  mapFcargoAuthError,
  resolveAccountCaller,
} from "@/lib/fcargo/epos-account-auth";
import { eposOtpResend } from "@/lib/fcargo/epos-client";
import { hasMessagingSecretsKey } from "@/lib/crypto/secrets";

const RESEND_COOLDOWN_MS = 45_000;
const PHONE_WINDOW_MS = 15 * 60_000;
const PHONE_LIMIT = 8;

export async function POST(request: Request) {
  if (!hasMessagingSecretsKey()) {
    return NextResponse.json({ error: "secrets_unavailable" }, { status: 503 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const phone = normalizeAccountPhone(
    typeof body.phone === "string" ? body.phone : "",
  );
  const challenge =
    typeof body.challenge === "string" ? body.challenge.trim() : "";
  if (!phone || challenge.length < 16) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }

  const caller = await resolveAccountCaller(request, body);
  if (!caller.ok) return caller.response;

  const ip = clientIp(request);
  const recent = await countRecentOtpAttempts({
    phone,
    kind: ["start", "resend"],
    windowMs: RESEND_COOLDOWN_MS,
  });
  if (recent > 0) {
    return NextResponse.json({ error: "resend_cooldown" }, { status: 429 });
  }

  const byPhone = await countRecentOtpAttempts({
    phone,
    kind: ["start", "resend"],
    windowMs: PHONE_WINDOW_MS,
  });
  if (byPhone >= PHONE_LIMIT) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const result = await eposOtpResend(phone, challenge);
  if (!result.ok) {
    await logOtpAttempt({
      phone,
      challenge,
      ip,
      subjectType: caller.subject.type,
      subjectId: caller.subject.id || null,
      kind: "resend",
      ok: false,
      errorCode: result.code,
    });
    const mapped = mapFcargoAuthError(result.code, result.status);
    return NextResponse.json(
      { error: mapped.error, message: result.message },
      { status: mapped.status },
    );
  }

  await storeOtpChallenge({
    phone,
    challenge: result.data.challenge,
    expiresAt: result.data.expiresAt,
    expiresInSec: result.data.expiresInSec,
    subjectType: caller.subject.type,
    subjectId: caller.subject.id || null,
    ip,
  });

  await logOtpAttempt({
    phone,
    challenge: result.data.challenge,
    ip,
    subjectType: caller.subject.type,
    subjectId: caller.subject.id || null,
    kind: "resend",
    ok: true,
  });

  return NextResponse.json({
    ok: true,
    challenge: result.data.challenge,
    expiresAt: result.data.expiresAt,
    expiresInSec: result.data.expiresInSec,
    resendAfterSeconds: result.data.resendAfterSeconds,
    phone,
  });
}
