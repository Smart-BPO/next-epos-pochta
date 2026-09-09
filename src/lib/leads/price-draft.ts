import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { hasSupabaseAdminConfig } from "@/lib/supabase/env";
import { isValidUzPhone, normalizePhone } from "@/lib/form/utils";

export type PriceDraftData = Record<string, unknown>;

export type LeadRow = {
  id: string;
  type: string;
  status: string;
  resume_token: string;
  request_id: string | null;
  payload: {
    pageUrl?: string;
    data?: PriceDraftData;
    meta?: { step?: number; complete?: boolean };
  };
  utm?: Record<string, string>;
  locale: string;
};

export function createLeadId() {
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, "0");
  const d = String(now.getUTCDate()).padStart(2, "0");
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `EP-${y}${m}${d}-${rand}`;
}

export function normalizeDraftData(data: PriceDraftData): PriceDraftData {
  const next = { ...data };
  if (typeof next.phone === "string") {
    next.phone = normalizePhone(next.phone);
  }
  if (typeof next.needApi === "string") {
    next.needApi = next.needApi === "true";
  }
  if (typeof next.regularPickup === "string") {
    next.regularPickup = next.regularPickup === "true";
  }
  if (typeof next.needCod === "string") {
    next.needCod = next.needCod === "true";
  }
  if (
    next.monthlyVolume === "" ||
    next.monthlyVolume === undefined ||
    next.monthlyVolume === null
  ) {
    next.monthlyVolume = null;
  } else if (typeof next.monthlyVolume === "string") {
    const n = Number(next.monthlyVolume);
    next.monthlyVolume = Number.isFinite(n) ? n : null;
  }
  return next;
}

export function validateDraftContact(data: PriceDraftData): string | null {
  const company = typeof data.company === "string" ? data.company.trim() : "";
  const name = typeof data.name === "string" ? data.name.trim() : "";
  const phone = typeof data.phone === "string" ? data.phone : "";
  if (!company) return "company_required";
  if (!name) return "name_required";
  if (!isValidUzPhone(phone)) return "invalid_phone";
  return null;
}

export function validateFinalize(data: PriceDraftData): string | null {
  const contactErr = validateDraftContact(data);
  if (contactErr) return contactErr;
  if (data.consent !== true) return "consent_required";
  return null;
}

export async function findLeadByResumeToken(
  uid: string,
): Promise<LeadRow | null> {
  if (!hasSupabaseAdminConfig() || !uid.trim()) return null;
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("epos_leads")
    .select("id, type, status, resume_token, request_id, payload, utm, locale")
    .eq("resume_token", uid.trim())
    .maybeSingle();
  if (error || !data) return null;
  return data as LeadRow;
}

export async function findLeadByRequestId(
  requestId: string,
): Promise<LeadRow | null> {
  if (!hasSupabaseAdminConfig() || !requestId.trim()) return null;
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("epos_leads")
    .select("id, type, status, resume_token, request_id, payload, utm, locale")
    .eq("request_id", requestId.trim())
    .maybeSingle();
  if (error || !data) return null;
  return data as LeadRow;
}

export function publicDraftPayload(row: LeadRow) {
  const data = { ...(row.payload?.data ?? {}) };
  // Never expose honeypot
  delete data.website;
  return {
    id: row.id,
    uid: row.resume_token,
    status: row.status,
    step: Number(row.payload?.meta?.step) || 1,
    complete: Boolean(row.payload?.meta?.complete) || row.status !== "draft",
    data,
    locale: row.locale,
  };
}

export function mergePayload(
  existing: LeadRow["payload"] | undefined,
  pageUrl: string,
  data: PriceDraftData,
  step: number,
  complete = false,
) {
  return {
    pageUrl: pageUrl || existing?.pageUrl || "",
    data: {
      ...(existing?.data ?? {}),
      ...data,
    },
    meta: {
      ...(existing?.meta ?? {}),
      step,
      complete,
    },
  };
}
