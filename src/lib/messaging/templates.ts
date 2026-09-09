export function renderTemplate(
  template: string,
  data: Record<string, string | number | null | undefined>,
): string {
  return template.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_, key: string) => {
    const v = data[key];
    if (v == null) return "";
    return String(v);
  });
}

export function estimateSmsSegments(text: string): {
  length: number;
  segments: number;
  encoding: "gsm" | "ucs2";
} {
  // Rough: if non-GSM char → UCS-2
  const gsm =
    /^[@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞÆæßÉ !"#¤%&'()*+,\-./0-9:;<=>?¡A-ZÄÖÑÜ§¿a-zäöñüà\r\n]*$/;
  const encoding = gsm.test(text) ? "gsm" : "ucs2";
  const len = text.length;
  if (encoding === "gsm") {
    if (len <= 160) return { length: len, segments: len === 0 ? 0 : 1, encoding };
    return { length: len, segments: Math.ceil(len / 153), encoding };
  }
  if (len <= 70) return { length: len, segments: len === 0 ? 0 : 1, encoding };
  return { length: len, segments: Math.ceil(len / 67), encoding };
}

export function maskRecipient(value: string): string {
  const v = value.trim();
  if (!v) return "";
  if (v.includes("@")) {
    const [user, domain] = v.split("@");
    if (!domain) return "•••";
    const u = user ?? "";
    return `${u.slice(0, 2)}•••@${domain}`;
  }
  const digits = v.replace(/\D/g, "");
  if (digits.length < 4) return "•••";
  return `•••${digits.slice(-4)}`;
}
