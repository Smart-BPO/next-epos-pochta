import "server-only";

import {
  markLinkValidated,
  refreshWebAccountSession,
  toPublicLink,
  type EposClientLinkRow,
  type EposLinkPublic,
} from "@/lib/fcargo/epos-account";
import { eposBearerAlive } from "@/lib/fcargo/epos-client";
import type { EposClientProfile } from "@/lib/fcargo/types";

/** How often /me and /refresh re-check the FCargo OTP bearer. */
export const EPOS_BEARER_PROBE_MAX_AGE_MS = 6 * 60 * 60_000;

export function linkNeedsBearerProbe(
  row: EposClientLinkRow,
  now = Date.now(),
): boolean {
  if (!row.last_validated_at) return true;
  const ms = Date.parse(row.last_validated_at);
  if (!Number.isFinite(ms)) return true;
  return now - ms >= EPOS_BEARER_PROBE_MAX_AGE_MS;
}

export type ContinuedAccountSession = {
  linked: EposLinkPublic;
  sessionExpiresAt: string;
  profile: EposClientProfile | null;
  /** null = FCargo not probed this request */
  bearerAlive: boolean | null;
};

/**
 * Keep the local cabinet session alive.
 *
 * Local `epos_acct` + link row are the source of truth for "logged in".
 * FCargo OTP bearer has no refresh_token — we only probe it occasionally
 * and never revoke the local session from a probe failure (catalog / Client
 * API still work; forcing OTP on every profile 401 was the bug).
 */
export async function continueAccountSession(params: {
  link: EposClientLinkRow;
  token: string;
  /** Force a bearer probe even if recently validated. */
  forceProbe?: boolean;
}): Promise<ContinuedAccountSession> {
  const { link, token } = params;
  const shouldProbe =
    params.forceProbe === true || linkNeedsBearerProbe(link);

  let profile: EposClientProfile | null = null;
  let bearerAlive: boolean | null = null;

  if (shouldProbe) {
    const probe = await eposBearerAlive(token);
    if (probe.alive === true) {
      bearerAlive = true;
      profile = probe.profile;
      await markLinkValidated(
        link,
        profile
          ? {
              displayName: profile.name,
              phone: profile.phone,
              fcargoClientId: profile.id,
            }
          : undefined,
      );
    } else if (probe.alive === false) {
      bearerAlive = false;
      // Keep local session — do not revoke. Next data call uses fallbacks.
      console.warn(
        "[epos-account:session] bearer dead; keeping local session",
        link.id,
        link.phone,
      );
    } else {
      bearerAlive = null;
      // Transient FCargo error — leave last_validated_at as-is.
    }
  }

  const sessionExpiresAt = await refreshWebAccountSession(link);
  return {
    linked: toPublicLink(link),
    sessionExpiresAt,
    profile,
    bearerAlive,
  };
}
