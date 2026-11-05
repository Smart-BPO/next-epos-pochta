import "server-only";

import {
  decryptLinkToken,
  listLinksNeedingValidation,
  markLinkValidated,
  revokeLink,
} from "@/lib/fcargo/epos-account";
import { eposProfile } from "@/lib/fcargo/epos-client";

export type ValidateHotLinksResult = {
  checked: number;
  validated: number;
  revoked: number;
  skipped: number;
};

/**
 * Periodic health check for recently-used client links.
 * Client API has no auth/refresh; customer OTP has no refresh_token.
 * We probe GET /profile and revoke on 401 (cabinet also uses POST /api/account/refresh/).
 */
export async function validateHotClientLinks(opts?: {
  limit?: number;
}): Promise<ValidateHotLinksResult> {
  const links = await listLinksNeedingValidation(opts?.limit ?? 20);
  let validated = 0;
  let revoked = 0;
  let skipped = 0;

  for (const link of links) {
    const token = await decryptLinkToken(link);
    if (!token) {
      await revokeLink(link);
      revoked += 1;
      continue;
    }

    const profile = await eposProfile(token);
    if (profile.ok) {
      await markLinkValidated(link, {
        displayName: profile.data.name,
        phone: profile.data.phone,
        fcargoClientId: profile.data.id,
      });
      validated += 1;
      continue;
    }

    if (profile.status === 401) {
      await revokeLink(link);
      revoked += 1;
      continue;
    }

    skipped += 1;
  }

  return {
    checked: links.length,
    validated,
    revoked,
    skipped,
  };
}
