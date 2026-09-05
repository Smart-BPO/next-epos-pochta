export function getEnv(...keys: string[]): string {
  for (const key of keys) {
    const value = process.env[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

export function requireEnv(...keys: string[]): string {
  const value = getEnv(...keys);
  if (!value) {
    throw new Error(`Missing required env: ${keys.join(" | ")}`);
  }
  return value;
}

export function getPublicEnv(key: string, fallback = ""): string {
  return getEnv(key) || fallback;
}
