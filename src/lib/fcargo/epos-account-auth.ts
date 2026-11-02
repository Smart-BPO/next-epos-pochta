import "server-only";

import { NextResponse } from "next/server";
import {
  decryptLinkToken,
  findActiveLinkBySession,
  findActiveLinkBySubject,
  readWebAccountCookie,
  revokeLink,
  touchLink,
  type EposClientLinkRow,
  type EposLinkSubjectType,
} from "@/lib/fcargo/epos-account";
import {
  isNextResponse,
  requireWebAppInitData,
} from "@/lib/webapp/auth";

export type AccountSubject = {
  type: EposLinkSubjectType;
  id: string;
};

export type ResolvedAccount =
  | { ok: true; subject: AccountSubject; link: EposClientLinkRow | null }
  | { ok: false; response: NextResponse };

/**
 * Resolve who is calling: Telegram initData (Mini App) or web cookie.
 * Body may include `initData` for Mini App.
 */
export async function resolveAccountCaller(
  request: Request,
  body?: Record<string, unknown> | null,
): Promise<ResolvedAccount> {
  const initData = body?.initData;
  if (typeof initData === "string" && initData.trim()) {
    const auth = requireWebAppInitData(initData);
    if (isNextResponse(auth)) return { ok: false, response: auth };
    const subject: AccountSubject = {
      type: "telegram",
      id: String(auth.userId),
    };
    const link = await findActiveLinkBySubject(subject.type, subject.id);
    return { ok: true, subject, link };
  }

  const cookie = await readWebAccountCookie();
  if (cookie) {
    const link = await findActiveLinkBySession(cookie);
    if (link) {
      return {
        ok: true,
        subject: { type: link.subject_type, id: link.subject_id },
        link,
      };
    }
  }

  // Anonymous web caller — subject id assigned at verify time.
  return {
    ok: true,
    subject: { type: "web", id: "" },
    link: null,
  };
}

export async function requireLinkedAccount(
  request: Request,
  body?: Record<string, unknown> | null,
): Promise<
  | { ok: true; subject: AccountSubject; link: EposClientLinkRow; token: string }
  | { ok: false; response: NextResponse }
> {
  const resolved = await resolveAccountCaller(request, body);
  if (!resolved.ok) return resolved;
  if (!resolved.link) {
    return {
      ok: false,
      response: NextResponse.json({ error: "not_linked" }, { status: 401 }),
    };
  }
  const token = await decryptLinkToken(resolved.link);
  if (!token) {
    await revokeLink(resolved.link);
    return {
      ok: false,
      response: NextResponse.json(
        { error: "relink_required" },
        { status: 401 },
      ),
    };
  }
  void touchLink(resolved.link);
  return {
    ok: true,
    subject: resolved.subject,
    link: resolved.link,
    token,
  };
}

export function mapFcargoAuthError(code: string, status: number) {
  if (code === "epos_customer_not_found" || status === 404) {
    return { error: "no_customer_card" as const, status: 404 as const };
  }
  if (status === 429 || code.includes("rate")) {
    return { error: "rate_limited" as const, status: 429 as const };
  }
  if (status === 401) {
    return { error: "relink_required" as const, status: 401 as const };
  }
  if (status === 422) {
    return { error: "invalid_input" as const, status: 422 as const };
  }
  if (status === 503 || code === "NOT_CONFIGURED") {
    return { error: "fcargo_unavailable" as const, status: 503 as const };
  }
  return { error: "fcargo_failed" as const, status: 502 as const };
}
