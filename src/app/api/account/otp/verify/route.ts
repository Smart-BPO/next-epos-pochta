import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import {
  clientIp,
  consumeOtpChallengeRow,
  countRecentOtpAttempts,
  findValidOtpChallenge,
  logOtpAttempt,
  normalizeAccountPhone,
  setWebAccountCookie,
  toPublicLink,
  upsertClientLink,
} from "@/lib/fcargo/epos-account";
import {
  mapFcargoAuthError,
  resolveAccountCaller,
} from "@/lib/fcargo/epos-account-auth";
import { eposOtpVerify } from "@/lib/fcargo/epos-client";
import { hasMessagingSecretsKey } from "@/lib/crypto/secrets";

const VERIFY_WINDOW_MS = 15 * 60_000;
const VERIFY_LIMIT = 10;

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
  const code = typeof body.code === "string" ? body.code.trim() : "";
  if (!phone || challenge.length < 16 || !/^\d{6}$/.test(code)) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }

  const caller = await resolveAccountCaller(request, body);
  if (!caller.ok) return caller.response;

  const ip = clientIp(request);
  const fails = await countRecentOtpAttempts({
    phone,
    kind: ["verify_fail"],
    windowMs: VERIFY_WINDOW_MS,
  });
  if (fails >= VERIFY_LIMIT) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const bound = await findValidOtpChallenge({ phone, challenge });
  if (!bound.ok) {
    await logOtpAttempt({
      phone,
      challenge,
      ip,
      subjectType: caller.subject.type,
      subjectId: caller.subject.id || null,
      kind: "verify_fail",
      ok: false,
      errorCode: bound.error,
    });
    return NextResponse.json(
      { error: bound.error },
      { status: bound.error === "expired_challenge" ? 410 : 400 },
    );
  }

  const result = await eposOtpVerify(challenge, code);
  if (!result.ok) {
    await logOtpAttempt({
      phone,
      challenge,
      ip,
      subjectType: caller.subject.type,
      subjectId: caller.subject.id || null,
      kind: "verify_fail",
      ok: false,
      errorCode: result.code,
    });
    const mapped = mapFcargoAuthError(result.code, result.status);
    return NextResponse.json(
      { error: mapped.error, message: result.message },
      { status: mapped.status },
    );
  }

  await consumeOtpChallengeRow(bound.row);

  const subjectType = caller.subject.type;
  let subjectId = caller.subject.id;
  if (subjectType === "web" && !subjectId) {
    subjectId = `web_${randomBytes(16).toString("hex")}`;
  }

  const displayName = result.data.name;
  const clientId = result.data.clientId;
  const profilePhone =
    normalizeAccountPhone(result.data.phone || "") || phone;

  const link = await upsertClientLink({
    subjectType,
    subjectId,
    phone: profilePhone,
    accessToken: result.data.accessToken,
    fcargoClientId: clientId,
    displayName,
    avatarUrl: result.data.avatarUrl,
  });
  if (!link) {
    return NextResponse.json({ error: "link_store_failed" }, { status: 503 });
  }

  if (subjectType === "web") {
    await setWebAccountCookie(link.session_token);
  }

  await logOtpAttempt({
    phone: profilePhone,
    challenge,
    ip,
    subjectType,
    subjectId,
    kind: "verify",
    ok: true,
  });

  return NextResponse.json({
    ok: true,
    linked: toPublicLink(link),
  });
}
