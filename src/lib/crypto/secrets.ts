import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

const ALGO = "aes-256-gcm";

function getKey(): Buffer | null {
  const raw = (process.env.MESSAGING_SECRETS_KEY ?? "").trim();
  if (!raw) return null;
  // Accept base64 32-byte key, or derive from any passphrase
  try {
    const buf = Buffer.from(raw, "base64");
    if (buf.length === 32) return buf;
  } catch {
    // fall through
  }
  return createHash("sha256").update(raw, "utf8").digest();
}

export function hasMessagingSecretsKey(): boolean {
  return Boolean((process.env.MESSAGING_SECRETS_KEY ?? "").trim());
}

export function encryptJson(value: unknown): string {
  const key = getKey();
  if (!key) throw new Error("MESSAGING_SECRETS_KEY is not set");
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGO, key, iv);
  const plaintext = Buffer.from(JSON.stringify(value), "utf8");
  const enc = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `v1:${iv.toString("base64")}:${tag.toString("base64")}:${enc.toString("base64")}`;
}

export function decryptJson<T = Record<string, string>>(cipherText: string): T {
  const key = getKey();
  if (!key) throw new Error("MESSAGING_SECRETS_KEY is not set");
  const parts = cipherText.split(":");
  if (parts.length !== 4 || parts[0] !== "v1") {
    throw new Error("Invalid ciphertext");
  }
  const iv = Buffer.from(parts[1]!, "base64");
  const tag = Buffer.from(parts[2]!, "base64");
  const data = Buffer.from(parts[3]!, "base64");
  const decipher = createDecipheriv(ALGO, key, iv);
  decipher.setAuthTag(tag);
  const dec = Buffer.concat([decipher.update(data), decipher.final()]);
  return JSON.parse(dec.toString("utf8")) as T;
}

export function maskSecret(value: string | undefined | null): string {
  const v = (value ?? "").trim();
  if (!v) return "";
  if (v.length <= 4) return "••••";
  return `••••${v.slice(-4)}`;
}

export function last4(value: string | undefined | null): string {
  const v = (value ?? "").trim();
  if (!v) return "";
  return v.slice(-4);
}
