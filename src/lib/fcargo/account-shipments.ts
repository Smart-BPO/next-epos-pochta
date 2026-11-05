import "server-only";

import type { Locale } from "@/i18n/config";
import {
  decryptLinkToken,
  type EposClientLinkRow,
} from "@/lib/fcargo/epos-account";
import { eposPackages } from "@/lib/fcargo/epos-client";
import {
  fcargoGetPackage,
  fcargoListPackages,
  fcargoPackageTimeline,
} from "@/lib/fcargo/client";
import { toFcargoPhone } from "@/lib/fcargo/create-order";
import { normalizeUzPhone } from "@/lib/fcargo/packages-store";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { hasSupabaseAdminConfig } from "@/lib/supabase/env";
import { fcargoStatusCopy } from "@/lib/tracking/fcargo-status";
import type { TrackingEvent } from "@/lib/tracking/types";
import { mapFcargoTrackEvent } from "@/lib/tracking/lookup";

export type AccountShipmentFilter = "all" | "active" | "done";

export type AccountShipment = {
  trackingNumber: string;
  packageId: string | number | null;
  statusCode: string | null;
  statusLabel: string;
  stage: string;
  isTerminal: boolean;
  fromLabel: string | null;
  toLabel: string | null;
  createdAt: string | null;
  estimatedDeliveryAt: string | null;
  deliveredAt: string | null;
  origin: "api" | "crm" | "catalog";
  hasTimeline: boolean;
  weight: number | null;
  seats: number | null;
  externalOrderId: string | null;
};

export type AccountShipmentDetail = AccountShipment & {
  timeline: TrackingEvent[];
};

export type AccountShipmentsPage = {
  items: AccountShipment[];
  page: number;
  lastPage: number;
  total: number;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function pickString(
  obj: Record<string, unknown> | null,
  keys: string[],
): string | null {
  if (!obj) return null;
  for (const key of keys) {
    const v = obj[key];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return null;
}

function originFromCreationSource(source: string | null | undefined): "api" | "crm" {
  const s = (source ?? "").toLowerCase();
  return s === "api" || s === "client" ? "api" : "crm";
}

function matchesFilter(
  item: AccountShipment,
  filter: AccountShipmentFilter,
): boolean {
  if (filter === "all") return true;
  if (filter === "done") return item.isTerminal || item.stage === "delivered";
  return !item.isTerminal && item.stage !== "delivered" && item.stage !== "cancelled";
}

function toAccountShipment(
  input: {
    trackingNumber: string | null;
    packageId?: string | number | null;
    statusCode: string | null;
    statusName?: string | null;
    isTerminal?: boolean;
    fromLabel?: string | null;
    toLabel?: string | null;
    createdAt?: string | null;
    estimatedDeliveryAt?: string | null;
    deliveredAt?: string | null;
    creationSource?: string | null;
    origin?: AccountShipment["origin"];
    weight?: number | null;
    seats?: number | null;
    externalOrderId?: string | null;
  },
  locale: Locale,
): AccountShipment | null {
  const tracking = (input.trackingNumber ?? "").trim();
  if (!tracking) return null;
  const copy = fcargoStatusCopy(input.statusCode, locale, input.statusName);
  const isTerminal =
    input.isTerminal === true ||
    copy.stage === "delivered" ||
    (input.statusCode ?? "").toUpperCase() === "CANCELLED" ||
    (input.statusCode ?? "").toUpperCase() === "RETURNED_TO_SENDER";
  const origin =
    input.origin ??
    originFromCreationSource(input.creationSource);
  return {
    trackingNumber: tracking,
    packageId: input.packageId ?? null,
    statusCode: input.statusCode,
    statusLabel: copy.label,
    stage: copy.stage,
    isTerminal,
    fromLabel: input.fromLabel ?? null,
    toLabel: input.toLabel ?? null,
    createdAt: input.createdAt ?? null,
    estimatedDeliveryAt: input.estimatedDeliveryAt ?? null,
    deliveredAt: input.deliveredAt ?? null,
    origin,
    hasTimeline: origin === "api",
    weight: input.weight ?? null,
    seats: input.seats ?? null,
    externalOrderId: input.externalOrderId ?? null,
  };
}

function customerScope(link: EposClientLinkRow) {
  if (link.fcargo_client_id?.trim()) {
    return { customerId: link.fcargo_client_id.trim() };
  }
  return { customerPhone: link.phone };
}

function phoneKey(raw: string | null | undefined): string {
  if (!raw) return "";
  return toFcargoPhone(raw) || normalizeUzPhone(raw) || "";
}

function linkPhoneKey(link: EposClientLinkRow): string {
  return phoneKey(link.phone);
}

/**
 * Cabinet ownership: linked account must be the *sender/customer*, not merely
 * the receiver. Catalog `phones` stores both parties for CRM notify — that must
 * not grant receiver read access in /cabinet.
 *
 * When `strict` is false and no ownership signals exist on the payload, trust
 * the upstream token/customer scope (EPOS / Client API list).
 */
function ownedByLinkedAccount(
  link: EposClientLinkRow,
  meta: {
    senderPhone?: string | null;
    customerId?: string | number | null;
    customerPhone?: string | null;
  },
  opts?: { strict?: boolean },
): boolean {
  const mine = linkPhoneKey(link);
  const sender = phoneKey(meta.senderPhone);
  const customerPhone = phoneKey(meta.customerPhone);
  const linkCustomer = (link.fcargo_client_id ?? "").trim();
  const pkgCustomer =
    meta.customerId != null ? String(meta.customerId).trim() : "";

  const hasSignal = Boolean(sender || customerPhone || pkgCustomer);
  if (!hasSignal) return opts?.strict !== true;

  if (mine && sender && mine === sender) return true;
  if (mine && customerPhone && mine === customerPhone) return true;
  if (linkCustomer && pkgCustomer && linkCustomer === pkgCustomer) return true;
  return false;
}

function senderPhoneFromRaw(raw: Record<string, unknown> | null): string | null {
  if (!raw) return null;
  return (
    pickString(raw, ["sender_phone", "customer_phone"]) ||
    pickString(asRecord(raw.sender), ["phone"]) ||
    null
  );
}

function customerIdFromRaw(
  raw: Record<string, unknown> | null,
): string | number | null {
  if (!raw) return null;
  const nested = asRecord(raw.customer) ?? asRecord(raw.sender_customer);
  const fromNested = nested
    ? nested.id ?? nested.customer_id ?? nested.client_id
    : null;
  if (typeof fromNested === "number" || typeof fromNested === "string") {
    return fromNested;
  }
  const direct = raw.sender_customer_id ?? raw.customer_id ?? raw.client_id;
  if (typeof direct === "number" || typeof direct === "string") return direct;
  return null;
}

async function listFromEpos(
  link: EposClientLinkRow,
  token: string,
  locale: Locale,
  page: number,
): Promise<AccountShipmentsPage | null> {
  const result = await eposPackages(token, { page });
  if (!result.ok) {
    if (result.status === 401) throw Object.assign(new Error("relink_required"), { status: 401 });
    return null;
  }
  const items = result.data.items
    .filter((pkg) =>
      ownedByLinkedAccount(link, {
        senderPhone: senderPhoneFromRaw(pkg.raw),
        customerId: customerIdFromRaw(pkg.raw),
        customerPhone: pickString(pkg.raw, ["customer_phone"]),
      }),
    )
    .map((pkg) =>
      toAccountShipment(
        {
          trackingNumber: pkg.trackingNumber,
          packageId: pkg.id,
          statusCode: pkg.statusCode,
          statusName: pkg.statusName,
          isTerminal: pkg.isTerminal,
          fromLabel: pkg.fromLabel,
          toLabel: pkg.toLabel,
          createdAt: pkg.createdAt,
          estimatedDeliveryAt: pkg.estimatedDeliveryAt,
          deliveredAt: pkg.deliveredAt,
          creationSource: pkg.creationSource,
          weight: pkg.weight,
          seats: pkg.seats,
          externalOrderId: pkg.externalOrderId,
        },
        locale,
      ),
    )
    .filter((x): x is AccountShipment => Boolean(x));

  return {
    items,
    page: result.data.page,
    lastPage: result.data.lastPage,
    total: items.length,
  };
}

async function listFromClientApi(
  link: EposClientLinkRow,
  locale: Locale,
  page: number,
): Promise<AccountShipmentsPage | null> {
  const result = await fcargoListPackages({
    ...customerScope(link),
    direction: "all",
    page,
    perPage: 50,
  });
  if (!result.ok) return null;
  const pageData = result.data;
  const rawItems = Array.isArray(pageData?.items) ? pageData.items : [];
  const items = rawItems
    .map((row) => {
      const rec = row as Record<string, unknown>;
      if (
        !ownedByLinkedAccount(link, {
          senderPhone: senderPhoneFromRaw(rec),
          customerId: customerIdFromRaw(rec),
          customerPhone: pickString(rec, ["customer_phone"]),
        })
      ) {
        return null;
      }
      const status = asRecord(rec.status);
      return toAccountShipment(
        {
          trackingNumber: pickString(rec, [
            "tracking_number",
            "tracking_code",
            "barcode",
          ]),
          packageId:
            typeof rec.id === "number" || typeof rec.id === "string"
              ? rec.id
              : null,
          statusCode:
            pickString(status, ["code"]) ||
            pickString(rec, ["status_code", "status"]),
          statusName: pickString(status, ["name", "localized_name"]),
          isTerminal: rec.is_terminal === true || status?.is_terminal === true,
          fromLabel: pickString(rec, ["from_label", "sender_address"]),
          toLabel: pickString(rec, ["to_label", "receiver_address"]),
          createdAt: pickString(rec, ["created_at"]),
          estimatedDeliveryAt: pickString(rec, ["estimated_delivery_at"]),
          deliveredAt: pickString(rec, ["delivered_at"]),
          origin: "api",
          externalOrderId: pickString(rec, ["external_order_id"]),
        },
        locale,
      );
    })
    .filter((x): x is AccountShipment => Boolean(x));

  return {
    items,
    page: pageData?.meta?.page ?? page,
    lastPage: pageData?.meta?.last_page ?? page,
    total: items.length,
  };
}

async function listFromCatalog(
  link: EposClientLinkRow,
  locale: Locale,
  page: number,
): Promise<AccountShipmentsPage> {
  if (!hasSupabaseAdminConfig()) {
    return { items: [], page: 1, lastPage: 1, total: 0 };
  }
  const admin = createSupabaseAdminClient();
  // Fetch a wider window then keep only sender/customer-owned rows.
  // `phones` includes receiver for CRM notify — must not grant cabinet access.
  const fetchSize = 100;
  const { data } = await admin
    .from("epos_fcargo_packages")
    .select(
      "id, tracking_number, status, status_raw, raw_last, created_at, external_order_id, fcargo_package_id",
    )
    .contains("phones", [link.phone])
    .not("tracking_number", "is", null)
    .order("created_at", { ascending: false })
    .limit(fetchSize);

  const owned = (data ?? []).filter((row) => {
    const rawLast = asRecord(row.raw_last);
    return ownedByLinkedAccount(
      link,
      {
        senderPhone: senderPhoneFromRaw(rawLast),
        customerId: customerIdFromRaw(rawLast),
        customerPhone: pickString(rawLast, ["customer_phone"]),
      },
      { strict: true },
    );
  });

  const perPage = 50;
  const total = owned.length;
  const lastPage = Math.max(1, Math.ceil(total / perPage));
  const start = (page - 1) * perPage;
  const slice = owned.slice(start, start + perPage);

  const items = slice
    .map((row) => {
      const statusRaw = asRecord(row.status_raw);
      const rawLast = asRecord(row.raw_last);
      const sender = asRecord(rawLast?.sender);
      const receiver = asRecord(rawLast?.receiver);
      return toAccountShipment(
        {
          trackingNumber: row.tracking_number as string | null,
          packageId: (row.fcargo_package_id as string | null) ?? (row.id as string),
          statusCode:
            (row.status as string | null) ||
            pickString(statusRaw, ["code", "status"]),
          statusName: pickString(statusRaw, ["name", "localized_name"]),
          fromLabel:
            pickString(sender, ["address"]) ||
            pickString(rawLast, ["from_label"]),
          toLabel:
            pickString(receiver, ["address"]) ||
            pickString(rawLast, ["to_label"]),
          createdAt: row.created_at as string | null,
          origin: "catalog",
          externalOrderId: row.external_order_id as string | null,
        },
        locale,
      );
    })
    .filter((x): x is AccountShipment => Boolean(x));

  return { items, page, lastPage, total };
}

export type ListAccountShipmentsResult =
  | { ok: true; page: AccountShipmentsPage }
  | { ok: false; error: "relink_required" | "fcargo_failed"; message?: string };

export async function listAccountShipments(
  link: EposClientLinkRow,
  opts: {
    locale: Locale;
    page?: number;
    filter?: AccountShipmentFilter;
  },
): Promise<ListAccountShipmentsResult> {
  const page = opts.page && opts.page > 0 ? Math.floor(opts.page) : 1;
  const filter = opts.filter ?? "all";
  const token = await decryptLinkToken(link);

  let pageData: AccountShipmentsPage | null = null;
  if (token) {
    try {
      pageData = await listFromEpos(link, token, opts.locale, page);
    } catch (e) {
      if (e instanceof Error && e.message === "relink_required") {
        return { ok: false, error: "relink_required" };
      }
      throw e;
    }
  }
  if (!pageData) {
    pageData = await listFromClientApi(link, opts.locale, page);
  }
  if (!pageData) {
    pageData = await listFromCatalog(link, opts.locale, page);
  }

  const items = pageData.items.filter((item) => matchesFilter(item, filter));
  return { ok: true, page: { ...pageData, items } };
}

function parseTimeline(raw: unknown, locale: Locale): TrackingEvent[] {
  const list = Array.isArray(raw)
    ? raw
    : Array.isArray(asRecord(raw)?.items)
      ? ((asRecord(raw)!.items as unknown[]) ?? [])
      : Array.isArray(asRecord(raw)?.data)
        ? ((asRecord(raw)!.data as unknown[]) ?? [])
        : [];
  return list
    .map((item) => mapFcargoTrackEvent(item, locale))
    .filter((e): e is TrackingEvent => Boolean(e))
    .sort((a, b) => (a.occurredAt ?? "").localeCompare(b.occurredAt ?? ""));
}

export async function getAccountShipment(
  link: EposClientLinkRow,
  tracking: string,
  locale: Locale,
): Promise<AccountShipmentDetail | null> {
  const code = tracking.trim();
  if (!code) return null;

  // Prefer EPOS list match (covers CRM + API) then Client API detail/timeline for API pkgs.
  const listed = await listAccountShipments(link, {
    locale,
    page: 1,
    filter: "all",
  });
  if (!listed.ok) return null;
  let hit =
    listed.page.items.find(
      (item) => item.trackingNumber.toUpperCase() === code.toUpperCase(),
    ) ?? null;

  // Scan more EPOS pages if needed (first page miss).
  if (!hit && listed.page.lastPage > 1) {
    for (let p = 2; p <= Math.min(listed.page.lastPage, 5); p += 1) {
      const more = await listAccountShipments(link, {
        locale,
        page: p,
        filter: "all",
      });
      if (!more.ok) break;
      hit =
        more.page.items.find(
          (item) => item.trackingNumber.toUpperCase() === code.toUpperCase(),
        ) ?? null;
      if (hit) break;
    }
  }

  if (!hit) return null;

  let timeline: TrackingEvent[] = [];
  if (hit.origin === "api" && hit.packageId != null) {
    const scope = customerScope(link);
    const [detail, tl] = await Promise.all([
      fcargoGetPackage(hit.packageId, scope),
      fcargoPackageTimeline(hit.packageId, scope),
    ]);
    if (detail.ok) {
      const rec = detail.data as Record<string, unknown>;
      const status = asRecord(rec.status);
      const enriched = toAccountShipment(
        {
          trackingNumber:
            pickString(rec, ["tracking_number", "tracking_code"]) ||
            hit.trackingNumber,
          packageId: hit.packageId,
          statusCode:
            pickString(status, ["code"]) ||
            hit.statusCode,
          statusName: pickString(status, ["name", "localized_name"]),
          isTerminal: rec.is_terminal === true || hit.isTerminal,
          fromLabel: hit.fromLabel,
          toLabel: hit.toLabel,
          createdAt: pickString(rec, ["created_at"]) || hit.createdAt,
          estimatedDeliveryAt:
            pickString(rec, ["estimated_delivery_at"]) ||
            hit.estimatedDeliveryAt,
          deliveredAt: pickString(rec, ["delivered_at"]) || hit.deliveredAt,
          origin: "api",
          externalOrderId:
            pickString(rec, ["external_order_id"]) || hit.externalOrderId,
        },
        locale,
      );
      if (enriched) hit = enriched;
      if (Array.isArray(rec.timeline)) {
        timeline = parseTimeline(rec.timeline, locale);
      }
    }
    if (tl.ok) {
      timeline = parseTimeline(tl.data, locale);
    }
  }

  return { ...hit, timeline };
}
