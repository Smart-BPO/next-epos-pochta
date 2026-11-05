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
import { eposOtpStart } from "@/lib/fcargo/epos-client";
import { hasMessagingSecretsKey } from "@/lib/crypto/secrets";

const PHONE_WINDOW_MS = 15 * 60_000;
const PHONE_LIMIT = 5;
const IP_WINDOW_MS = 15 * 60_000;
const IP_LIMIT = 20;

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
  if (!phone) {
    return NextResponse.json({ error: "invalid_phone" }, { status: 400 });
  }

  const caller = await resolveAccountCaller(request, body);
  if (!caller.ok) return caller.response;

  const ip = clientIp(request);
  const [byPhone, byIp] = await Promise.all([
    countRecentOtpAttempts({
      phone,
      kind: ["start", "resend"],
      windowMs: PHONE_WINDOW_MS,
    }),
    countRecentOtpAttempts({
      ip,
      kind: ["start", "resend"],
      windowMs: IP_WINDOW_MS,
    }),
  ]);
  if (byPhone >= PHONE_LIMIT || byIp >= IP_LIMIT) {
    await logOtpAttempt({
      phone,
      ip,
      subjectType: caller.subject.type,
      subjectId: caller.subject.id || null,
      kind: "start",
      ok: false,
      errorCode: "rate_limited",
    });
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const result = await eposOtpStart(phone);
  if (!result.ok) {
    await logOtpAttempt({
      phone,
      ip,
      subjectType: caller.subject.type,
      subjectId: caller.subject.id || null,
      kind: "start",
      ok: false,
      errorCode: result.code,
    });
    const mapped = mapFcargoAuthError(result.code, result.status);
    const details = result.details as Record<string, unknown> | undefined;
    return NextResponse.json(
      {
        error: mapped.error,
        message: result.message,
        contactUrl:
          typeof details?.contact_url === "string"
            ? details.contact_url
            : undefined,
      },
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
    kind: "start",
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
