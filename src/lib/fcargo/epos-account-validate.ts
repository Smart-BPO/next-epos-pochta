import "server-only";

import {
  decryptLinkToken,
  listLinksNeedingValidation,
  markLinkValidated,
  revokeLink,
} from "@/lib/fcargo/epos-account";
import { eposBearerAlive } from "@/lib/fcargo/epos-client";

export type ValidateHotLinksResult = {
  checked: number;
  validated: number;
  revoked: number;
  skipped: number;
};

/**
 * Periodic health check for recently-used client links.
 * Updates last_validated_at on success. Never revokes on FCargo 401 —
 * local cabinet sessions must not force OTP from background probes.
 * (Decrypt failure still revokes — secrets/key corruption.)
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

    const probe = await eposBearerAlive(token);
    if (probe.alive === true) {
      await markLinkValidated(
        link,
        probe.profile
          ? {
              displayName: probe.profile.name,
              phone: probe.profile.phone,
              fcargoClientId: probe.profile.id,
            }
          : undefined,
      );
      validated += 1;
      continue;
    }

    // Dead or unknown bearer: keep the local link, try again later.
    skipped += 1;
  }

  return {
    checked: links.length,
    validated,
    revoked,
    skipped,
  };
}
