/**
 * Play Mobile (playmobile.uz) SMS Broker API — server-only.
 * Docs: https://playmobile.uz/storage/2022/08/http.pdf
 *
 * Env:
 *   PLAYMOBILE_BASE_URL   — broker base without trailing slash (e.g. https://send.smsxabar.uz/broker-api)
 *   PLAYMOBILE_LOGIN
 *   PLAYMOBILE_PASSWORD
 *   PLAYMOBILE_ORIGINATOR — approved sender name / short code
 */

export type PlaymobileSmsResult =
  | { ok: true; messageId: string; recipient: string }
  | {
      ok: false;
      description: string;
      errorCode?: string;
      status?: number;
    };

export type PlaymobileSmsMessage = {
  /** MSISDN or free-form phone; normalized to 998XXXXXXXXX */
  to: string;
  text?: string;
  messageId?: string;
  /** Template id from Play Mobile cabinet */
  templateId?: string;
  /** Template variables, e.g. { NAME: "Ivan" } */
  variables?: Record<string, string>;
  originator?: string;
  ttl?: number | string;
  priority?: "low" | "normal" | "high" | "realtime";
};

function env(name: string): string {
  return (process.env[name] ?? "").trim();
}

export function getPlaymobileBaseUrl(): string {
  return env("PLAYMOBILE_BASE_URL").replace(/\/+$/, "");
}

export function getPlaymobileOriginator(): string {
  return env("PLAYMOBILE_ORIGINATOR");
}

export function hasPlaymobileConfig(): boolean {
  return Boolean(
    getPlaymobileBaseUrl() &&
      env("PLAYMOBILE_LOGIN") &&
      env("PLAYMOBILE_PASSWORD") &&
      getPlaymobileOriginator(),
  );
}

/**
 * Normalize UZ mobile to Play Mobile MSISDN: 998XXXXXXXXX (no + / spaces).
 */
export function normalizeUzMsisdn(raw: string): string | null {
  let digits = raw.replace(/[^\d]/g, "");
  if (digits.startsWith("8") && digits.length === 12) {
    // 8 998 … → drop trunk 8
    digits = digits.slice(1);
  }
  if (digits.startsWith("0") && digits.length === 10) {
    digits = `998${digits.slice(1)}`;
  }
  if (digits.length === 9 && digits.startsWith("9")) {
    digits = `998${digits}`;
  }
  if (!/^998\d{9}$/.test(digits)) return null;
  return digits;
}

/** Unique message-id ≤ 20 chars (Play Mobile requirement). */
export function createSmsMessageId(prefix = "epos"): string {
  const safe = prefix.replace(/[^a-zA-Z0-9]/g, "").slice(0, 4) || "epos";
  const stamp = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 6);
  return `${safe}${stamp}${rand}`.slice(0, 20);
}

function basicAuthHeader(): string | null {
  const login = env("PLAYMOBILE_LOGIN");
  const password = env("PLAYMOBILE_PASSWORD");
  if (!login || !password) return null;
  const token = Buffer.from(`${login}:${password}`, "utf8").toString("base64");
  return `Basic ${token}`;
}

type BrokerMessage = {
  recipient: string;
  "message-id": string;
  "template-id"?: string;
  priority?: string;
  variables?: Record<string, string>;
  sms?: {
    originator?: string;
    ttl?: string;
    content?: { text: string };
  };
};

function buildSendBody(messages: PlaymobileSmsMessage[]): {
  body: Record<string, unknown>;
  resolved: Array<{ messageId: string; recipient: string }>;
} | { error: string } {
  const defaultOriginator = getPlaymobileOriginator();
  if (!defaultOriginator) {
    return { error: "PLAYMOBILE_ORIGINATOR не задан" };
  }

  const resolved: Array<{ messageId: string; recipient: string }> = [];
  const brokerMessages: BrokerMessage[] = [];
  let sharedText: string | undefined;
  let allShareSameText = true;

  for (const msg of messages) {
    const recipient = normalizeUzMsisdn(msg.to);
    if (!recipient) {
      return {
        error: `Некорректный номер: ${msg.to} (нужен формат 998XXXXXXXXX)`,
      };
    }
    if (!msg.text?.trim() && !msg.templateId) {
      return { error: "Нужен text или templateId" };
    }
    const messageId = (msg.messageId?.trim() || createSmsMessageId()).slice(
      0,
      20,
    );
    resolved.push({ messageId, recipient });

    const entry: BrokerMessage = {
      recipient,
      "message-id": messageId,
    };
    if (msg.templateId) entry["template-id"] = msg.templateId;
    if (msg.priority) entry.priority = msg.priority;
    if (msg.variables) entry.variables = msg.variables;

    const originator = msg.originator?.trim() || defaultOriginator;
    const ttl = msg.ttl != null ? String(msg.ttl) : undefined;
    const text = msg.text?.trim();

    if (text) {
      if (sharedText === undefined) sharedText = text;
      else if (sharedText !== text) allShareSameText = false;
      entry.sms = {
        originator,
        ...(ttl ? { ttl } : {}),
        content: { text },
      };
    } else if (msg.originator || ttl) {
      entry.sms = {
        originator,
        ...(ttl ? { ttl } : {}),
      };
    }

    brokerMessages.push(entry);
  }

  // Prefer top-level sms when all messages share the same free text (bulk style).
  const body: Record<string, unknown> = { messages: brokerMessages };
  if (
    allShareSameText &&
    sharedText &&
    brokerMessages.every((m) => !m["template-id"])
  ) {
    body.sms = {
      originator: defaultOriginator,
      content: { text: sharedText },
    };
    for (const m of brokerMessages) {
      delete m.sms;
    }
  }

  return { body, resolved };
}

async function postSend(
  body: Record<string, unknown>,
): Promise<
  | { ok: true }
  | { ok: false; description: string; errorCode?: string; status?: number }
> {
  const base = getPlaymobileBaseUrl();
  const auth = basicAuthHeader();
  if (!base) {
    return { ok: false, description: "PLAYMOBILE_BASE_URL не задан" };
  }
  if (!auth) {
    return {
      ok: false,
      description: "PLAYMOBILE_LOGIN / PLAYMOBILE_PASSWORD не заданы",
    };
  }

  try {
    const response = await fetch(`${base}/send`, {
      method: "POST",
      headers: {
        Authorization: auth,
        "Content-Type": "application/json; charset=UTF-8",
        Accept: "application/json, text/plain, */*",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const raw = (await response.text()).trim();

    if (response.ok) {
      // Spec: successful body is "Request is received"
      return { ok: true };
    }

    let errorCode: string | undefined;
    let description = raw || `playmobile_${response.status}`;
    if (raw.startsWith("{")) {
      try {
        const json = JSON.parse(raw) as {
          error_code?: string;
          error_description?: string;
        };
        errorCode = json.error_code;
        if (json.error_description) description = json.error_description;
      } catch {
        // keep raw
      }
    }

    return {
      ok: false,
      description,
      errorCode,
      status: response.status,
    };
  } catch (error) {
    return {
      ok: false,
      description:
        error instanceof Error ? error.message : "playmobile_network_error",
    };
  }
}

/** Send one SMS (free text and/or cabinet template). */
export async function sendSms(
  params: PlaymobileSmsMessage,
): Promise<PlaymobileSmsResult> {
  const built = buildSendBody([params]);
  if ("error" in built) {
    return { ok: false, description: built.error };
  }

  const result = await postSend(built.body);
  const first = built.resolved[0]!;
  if (!result.ok) {
    return {
      ok: false,
      description: result.description,
      errorCode: result.errorCode,
      status: result.status,
    };
  }
  return {
    ok: true,
    messageId: first.messageId,
    recipient: first.recipient,
  };
}

/**
 * Send several messages in one `/send` request (max keep reasonable for broker).
 * Returns per-message results; on broker-level failure all share the same error.
 */
export async function sendSmsBatch(
  messages: PlaymobileSmsMessage[],
): Promise<PlaymobileSmsResult[]> {
  if (messages.length === 0) return [];

  const built = buildSendBody(messages);
  if ("error" in built) {
    return messages.map(() => ({ ok: false as const, description: built.error }));
  }

  const result = await postSend(built.body);
  if (!result.ok) {
    return built.resolved.map(() => ({
      ok: false as const,
      description: result.description,
      errorCode: result.errorCode,
      status: result.status,
    }));
  }

  return built.resolved.map((r) => ({
    ok: true as const,
    messageId: r.messageId,
    recipient: r.recipient,
  }));
}
