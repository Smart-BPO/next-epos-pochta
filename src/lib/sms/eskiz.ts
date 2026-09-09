/**
 * Eskiz.uz SMS API — server-only.
 * Base: https://notify.eskiz.uz
 */

export type EskizSmsResult =
  | { ok: true; messageId: string; recipient: string }
  | { ok: false; description: string; status?: number };

type TokenCache = { token: string; expiresAt: number };

const tokenByEmail = new Map<string, TokenCache>();

function baseUrl() {
  return "https://notify.eskiz.uz";
}

async function login(email: string, password: string): Promise<string> {
  const cached = tokenByEmail.get(email);
  if (cached && cached.expiresAt > Date.now() + 60_000) {
    return cached.token;
  }

  const body = new FormData();
  body.append("email", email);
  body.append("password", password);

  const res = await fetch(`${baseUrl()}/api/auth/login`, {
    method: "POST",
    body,
    cache: "no-store",
  });
  const json = (await res.json()) as {
    data?: { token?: string };
    message?: string;
  };
  const token = json.data?.token;
  if (!res.ok || !token) {
    throw new Error(json.message || `eskiz_login_${res.status}`);
  }
  // Tokens last ~30 days; refresh earlier
  tokenByEmail.set(email, {
    token,
    expiresAt: Date.now() + 24 * 60 * 60 * 1000,
  });
  return token;
}

export async function sendEskizSms(params: {
  email: string;
  password: string;
  to: string;
  message: string;
  from?: string;
}): Promise<EskizSmsResult> {
  try {
    const token = await login(params.email, params.password);
    const body = new FormData();
    body.append("mobile_phone", params.to);
    body.append("message", params.message);
    if (params.from) body.append("from", params.from);

    const res = await fetch(`${baseUrl()}/api/message/sms/send`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body,
      cache: "no-store",
    });
    const json = (await res.json()) as {
      id?: string | number;
      message?: string;
      status?: string;
    };
    if (!res.ok) {
      return {
        ok: false,
        description: json.message || `eskiz_${res.status}`,
        status: res.status,
      };
    }
    return {
      ok: true,
      messageId: String(json.id ?? `eskiz-${Date.now()}`),
      recipient: params.to,
    };
  } catch (err) {
    return {
      ok: false,
      description: err instanceof Error ? err.message : "eskiz_error",
    };
  }
}
