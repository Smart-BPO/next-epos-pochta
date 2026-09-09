import { toast } from "react-toastify";
import type { Locale } from "@/i18n/config";
import { trackEvent } from "@/lib/analytics/events";
import { formErrorMessage, readUtm } from "./utils";

export type LeadType = "price" | "business" | "contact";

interface SubmitLeadOptions {
  type: LeadType;
  locale: Locale;
  requestId: string;
  website?: string;
  data: Record<string, unknown>;
  successTitle: string;
  successText: string;
  eventPrefix: string;
}

type DraftResponse = {
  id?: string;
  uid?: string;
  ok?: boolean;
  step?: number;
  status?: string;
  complete?: boolean;
  error?: string;
};

function pageUrl() {
  return typeof window !== "undefined" ? window.location.href : "";
}

export async function submitLead({
  type,
  locale,
  requestId,
  website = "",
  data,
  successTitle,
  successText,
  eventPrefix,
}: SubmitLeadOptions): Promise<{ id: string } | null> {
  trackEvent(`${eventPrefix}_submit_attempt`);

  try {
    const res = await fetch("/api/leads/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type,
        locale,
        pageUrl: pageUrl(),
        utm: readUtm(),
        requestId,
        website,
        data,
      }),
    });
    const json = (await res.json()) as { id?: string; error?: string };
    if (!res.ok || !json.id) {
      throw new Error(json.error || "submit_failed");
    }

    trackEvent(`${eventPrefix}_submit_success`);
    toast.success(`${successTitle}. ID: ${json.id}\n${successText}`);
    return { id: json.id };
  } catch {
    trackEvent(`${eventPrefix}_submit_error`);
    toast.error(formErrorMessage(locale));
    return null;
  }
}

export async function savePriceDraft(opts: {
  locale: Locale;
  requestId: string;
  uid?: string;
  step: number;
  website?: string;
  data: Record<string, unknown>;
}): Promise<DraftResponse | null> {
  try {
    const mode = opts.uid ? "update" : "draft";
    const res = await fetch("/api/leads/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "price",
        mode,
        locale: opts.locale,
        pageUrl: pageUrl(),
        utm: readUtm(),
        requestId: opts.requestId,
        uid: opts.uid,
        step: opts.step,
        website: opts.website ?? "",
        data: opts.data,
      }),
    });
    const json = (await res.json()) as DraftResponse;
    if (!res.ok || !json.id) {
      throw new Error(json.error || "draft_failed");
    }
    return json;
  } catch {
    toast.error(formErrorMessage(opts.locale));
    return null;
  }
}

export async function finalizePriceLead(opts: {
  locale: Locale;
  requestId: string;
  uid?: string;
  website?: string;
  data: Record<string, unknown>;
  successTitle: string;
  successText: string;
}): Promise<{ id: string; uid?: string } | null> {
  trackEvent("price_form_submit_attempt");
  try {
    const res = await fetch("/api/leads/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "price",
        mode: "finalize",
        locale: opts.locale,
        pageUrl: pageUrl(),
        utm: readUtm(),
        requestId: opts.requestId,
        uid: opts.uid,
        step: 4,
        website: opts.website ?? "",
        data: opts.data,
      }),
    });
    const json = (await res.json()) as DraftResponse;
    if (!res.ok || !json.id) {
      throw new Error(json.error || "finalize_failed");
    }
    trackEvent("price_form_submit_success");
    toast.success(`${opts.successTitle}. ID: ${json.id}\n${opts.successText}`);
    return { id: json.id, uid: json.uid };
  } catch {
    trackEvent("price_form_submit_error");
    toast.error(formErrorMessage(opts.locale));
    return null;
  }
}

export async function loadPriceDraft(uid: string): Promise<{
  id: string;
  uid: string;
  step: number;
  status: string;
  complete: boolean;
  data: Record<string, unknown>;
  locale: string;
} | null> {
  try {
    const res = await fetch(
      `/api/leads/resume/?uid=${encodeURIComponent(uid)}`,
      { method: "GET", cache: "no-store" },
    );
    if (!res.ok) return null;
    return (await res.json()) as {
      id: string;
      uid: string;
      step: number;
      status: string;
      complete: boolean;
      data: Record<string, unknown>;
      locale: string;
    };
  } catch {
    return null;
  }
}

export const PRICE_DRAFT_STORAGE_KEY = "epos_price_draft_v1";

export type PriceDraftLocal = {
  uid: string;
  leadId: string;
  step: number;
  locale: string;
  requestId: string;
};

export function readPriceDraftLocal(): PriceDraftLocal | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(PRICE_DRAFT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PriceDraftLocal;
    if (!parsed?.uid || !parsed?.leadId) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writePriceDraftLocal(value: PriceDraftLocal) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PRICE_DRAFT_STORAGE_KEY, JSON.stringify(value));
}

export function clearPriceDraftLocal() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(PRICE_DRAFT_STORAGE_KEY);
}
