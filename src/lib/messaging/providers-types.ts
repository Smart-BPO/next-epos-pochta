/** Client-safe messaging provider view types (no decrypt / DB). */

export type MessagingProviderId = "playmobile" | "eskiz" | "resend";

export type ProviderPublicView = {
  id: MessagingProviderId;
  enabled: boolean;
  isPrimarySms: boolean;
  config: Record<string, string>;
  hasSecrets: boolean;
  secretsHint: string;
  masterKeyOk: boolean;
  lastTestAt: string | null;
  lastTestOk: boolean | null;
  lastError: string | null;
};
