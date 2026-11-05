import { NextResponse } from "next/server";
import {
  markLinkValidated,
  refreshWebAccountSession,
  revokeLinkSession,
  toPublicLink,
} from "@/lib/fcargo/epos-account";
import { requireLinkedAccount } from "@/lib/fcargo/epos-account-auth";
import { eposProfile } from "@/lib/fcargo/epos-client";

/**
 * Explicit cabinet session refresh.
 *
 * FCargo Client API (`/api/client/v1`) has no auth/refresh — only X-API-Key scopes.
 * Customer OTP tokens are long-lived with no refresh_token. This endpoint:
 * 1) probes GET /web/clients/epos/profile with the stored bearer
 * 2) on 401 → revoke link + clear cookie → `relink_required`
 * 3) on OK → slide idle `session_expires_at` and re-issue `epos_acct`
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

  const profile = await eposProfile(linked.token);
  if (!profile.ok && profile.status === 401) {
    await revokeLinkSession(linked.link);
    return NextResponse.json(
      { error: "relink_required", linked: null, refreshed: false },
      { status: 401 },
    );
  }

  if (profile.ok) {
    await markLinkValidated(linked.link, {
      displayName: profile.data.name,
      phone: profile.data.phone,
      fcargoClientId: profile.data.id,
    });
  }

  const sessionExpiresAt = await refreshWebAccountSession(linked.link);

  return NextResponse.json({
    ok: true,
    refreshed: true,
    linked: toPublicLink(linked.link),
    sessionExpiresAt,
    profile: profile.ok
      ? {
          name: profile.data.name,
          phone: profile.data.phone,
          email: profile.data.email,
          id: profile.data.id,
        }
      : null,
  });
}
