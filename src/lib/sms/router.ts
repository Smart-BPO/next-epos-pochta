import {
  createSmsMessageId,
  normalizeUzMsisdn,
  sendSms as sendPlaymobileSms,
  type PlaymobileSmsResult,
} from "@/lib/sms/playmobile";
import { sendEskizSms } from "@/lib/sms/eskiz";
import {
  getProviderRow,
  getProviderSecrets,
  type MessagingProviderId,
} from "@/lib/messaging/providers";

export type SmsSendResult =
  | {
      ok: true;
      messageId: string;
      recipient: string;
      provider: "playmobile" | "eskiz";
    }
  | {
      ok: false;
      description: string;
      provider?: "playmobile" | "eskiz";
    };

async function sendViaPlaymobile(
  to: string,
  text: string,
): Promise<SmsSendResult> {
  const row = await getProviderRow("playmobile");
  const secrets = await getProviderSecrets("playmobile");
  if (!row?.enabled || !secrets?.login || !secrets?.password) {
    return { ok: false, description: "Playmobile not configured", provider: "playmobile" };
  }

  // Temporarily inject env for existing client (reads process.env)
  const prev = {
    base: process.env.PLAYMOBILE_BASE_URL,
    login: process.env.PLAYMOBILE_LOGIN,
    password: process.env.PLAYMOBILE_PASSWORD,
    originator: process.env.PLAYMOBILE_ORIGINATOR,
  };
  process.env.PLAYMOBILE_BASE_URL =
    row.config_public.base_url || prev.base || "https://send.smsxabar.uz/broker-api";
  process.env.PLAYMOBILE_LOGIN = secrets.login;
  process.env.PLAYMOBILE_PASSWORD = secrets.password;
  process.env.PLAYMOBILE_ORIGINATOR =
    row.config_public.originator || prev.originator || "";

  try {
    const result: PlaymobileSmsResult = await sendPlaymobileSms({
      to,
      text,
      messageId: createSmsMessageId("epos"),
    });
    if (!result.ok) {
      return {
        ok: false,
        description: result.description,
        provider: "playmobile",
      };
    }
    return {
      ok: true,
      messageId: result.messageId,
      recipient: result.recipient,
      provider: "playmobile",
    };
  } finally {
    if (prev.base === undefined) delete process.env.PLAYMOBILE_BASE_URL;
    else process.env.PLAYMOBILE_BASE_URL = prev.base;
    if (prev.login === undefined) delete process.env.PLAYMOBILE_LOGIN;
    else process.env.PLAYMOBILE_LOGIN = prev.login;
    if (prev.password === undefined) delete process.env.PLAYMOBILE_PASSWORD;
    else process.env.PLAYMOBILE_PASSWORD = prev.password;
    if (prev.originator === undefined) delete process.env.PLAYMOBILE_ORIGINATOR;
    else process.env.PLAYMOBILE_ORIGINATOR = prev.originator;
  }
}

async function sendViaEskiz(to: string, text: string): Promise<SmsSendResult> {
  const row = await getProviderRow("eskiz");
  const secrets = await getProviderSecrets("eskiz");
  if (!row?.enabled || !secrets?.email || !secrets?.password) {
    return { ok: false, description: "Eskiz not configured", provider: "eskiz" };
  }
  const result = await sendEskizSms({
    email: secrets.email,
    password: secrets.password,
    to,
    message: text,
    from: row.config_public.from || undefined,
  });
  if (!result.ok) {
    return { ok: false, description: result.description, provider: "eskiz" };
  }
  return {
    ok: true,
    messageId: result.messageId,
    recipient: result.recipient,
    provider: "eskiz",
  };
}

async function resolvePrimary(): Promise<"playmobile" | "eskiz" | null> {
  const pm = await getProviderRow("playmobile");
  const ez = await getProviderRow("eskiz");
  if (pm?.is_primary_sms && pm.enabled) return "playmobile";
  if (ez?.is_primary_sms && ez.enabled) return "eskiz";
  if (pm?.enabled) return "playmobile";
  if (ez?.enabled) return "eskiz";
  return null;
}

export async function sendRoutedSms(params: {
  to: string;
  text: string;
  mode?: "primary" | "playmobile" | "eskiz" | "failover";
}): Promise<SmsSendResult> {
  const msisdn = normalizeUzMsisdn(params.to);
  if (!msisdn) {
    return { ok: false, description: `Invalid phone: ${params.to}` };
  }

  const mode = params.mode ?? "primary";
  const primary = (await resolvePrimary()) ?? "playmobile";
  const secondary: "playmobile" | "eskiz" =
    primary === "playmobile" ? "eskiz" : "playmobile";

  const order: Array<"playmobile" | "eskiz"> =
    mode === "playmobile"
      ? ["playmobile"]
      : mode === "eskiz"
        ? ["eskiz"]
        : mode === "failover"
          ? [primary, secondary]
          : [primary];

  let last: SmsSendResult = { ok: false, description: "No SMS provider" };
  for (const provider of order) {
    last =
      provider === "playmobile"
        ? await sendViaPlaymobile(msisdn, params.text)
        : await sendViaEskiz(msisdn, params.text);
    if (last.ok) return last;
  }
  return last;
}

export type { MessagingProviderId };
