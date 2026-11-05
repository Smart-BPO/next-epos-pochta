import { NextResponse } from "next/server";
import { requireLinkedAccount } from "@/lib/fcargo/epos-account-auth";
import { continueAccountSession } from "@/lib/fcargo/epos-account-session";

/**
 * Explicit cabinet session refresh.
 *
 * FCargo Client API has no auth/refresh; OTP bearer has no refresh_token.
 * This endpoint slides the local idle `epos_acct` session and only rarely
 * probes FCargo. A dead bearer does **not** force OTP — local session stays.
 */
export async function POST(request: Request) {
  let body: Record<string, unknown> = {};
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    body = {};
  }

  const linked = await requireLinkedAccount(request, body);
  if (!linked.ok) return linked.response;

  const continued = await continueAccountSession({
    link: linked.link,
    token: linked.token,
  });

  return NextResponse.json({
    ok: true,
    refreshed: true,
    linked: continued.linked,
    sessionExpiresAt: continued.sessionExpiresAt,
    bearerProbed: continued.bearerAlive !== null,
    bearerAlive: continued.bearerAlive,
    profile: continued.profile
      ? {
          name: continued.profile.name,
          phone: continued.profile.phone,
          email: continued.profile.email,
          id: continued.profile.id,
        }
      : null,
  });
}
