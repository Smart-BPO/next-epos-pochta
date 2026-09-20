import "server-only";

import {
  applyFcargoStatusUpdate,
  normalizeFcargoStatusLabel,
  parseFcargoWebhookPayload,
} from "@/lib/fcargo/sync-status";
import {
  normalizeUzPhone,
  upsertFcargoPackage,
  type FcargoPackageRow,
} from "@/lib/fcargo/packages-store";
import { findFcargoOrder } from "@/lib/fcargo/orders-store";
import { syncShipmentMirrorFromPackage } from "@/lib/fcargo/link-contact";

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : null;
}

function pickString(...values: unknown[]): string | null {
  for (const v of values) {
    if (typeof v === "string" && v.trim()) return v.trim();
    if (typeof v === "number" && Number.isFinite(v)) return String(v);
  }
  return null;
}

function phoneFromChange(value: unknown): string | null {
  if (typeof value === "string") return value;
  const o = asRecord(value);
  if (!o) return null;
  if (typeof o.new === "string") return o.new;
  if (typeof o.old === "string") return o.old;
  return null;
}

function collectPhones(root: Record<string, unknown>): string[] {
  const out = new Set<string>();
  const add = (raw: unknown) => {
    if (typeof raw !== "string") return;
    const n = normalizeUzPhone(raw);
    if (n) out.add(n);
  };

  const walk = (obj: Record<string, unknown> | null) => {
    if (!obj) return;
    add(obj.phone);
    add(obj.sender_phone);
    add(obj.receiver_phone);
    add(obj.customer_phone);
    const sender = asRecord(obj.sender);
    const receiver = asRecord(obj.receiver);
    const customer = asRecord(obj.customer);
    const pkg = asRecord(obj.package);
    if (sender) add(sender.phone);
    if (receiver) add(receiver.phone);
    if (customer) add(customer.phone);
    if (pkg) {
      add(pkg.phone);
      const ps = asRecord(pkg.sender);
      const pr = asRecord(pkg.receiver);
      if (ps) add(ps.phone);
      if (pr) add(pr.phone);
    }
    // Official payload: data.changes.{receiver_phone,sender_phone}.{old,new}
    const changes = asRecord(obj.changes);
    if (changes) {
      add(phoneFromChange(changes.receiver_phone));
      add(phoneFromChange(changes.sender_phone));
      add(phoneFromChange(changes.phone));
      add(phoneFromChange(changes.customer_phone));
    }
    const data = asRecord(obj.data);
    if (data && data !== obj) walk(data);
  };

  walk(root);
  return Array.from(out);
}

export type IngestFcargoResult = {
  package: FcargoPackageRow | null;
  leadApplied: boolean;
  leadId?: string;
  fcargoStatus?: string | null;
  crmStatus?: string | null;
  message?: string;
  eventType?: string | null;
};

/** Ingest any FCargo webhook: catalog upsert + optional lead CRM sync. */
export async function ingestFcargoWebhook(
  body: unknown,
): Promise<IngestFcargoResult> {
  const root =
    typeof body === "string"
      ? (() => {
          try {
            return JSON.parse(body) as unknown;
          } catch {
            return { raw: body };
          }
        })()
      : body;

  const o = asRecord(root) ?? {};
  // Unwrap single form field JSON
  const keys = Object.keys(o);
  let payload = o;
  if (keys.length === 1 && typeof o[keys[0]!] === "string") {
    const maybe = String(o[keys[0]!]).trim();
    if (maybe.startsWith("{")) {
      try {
        payload = asRecord(JSON.parse(maybe)) ?? o;
      } catch {
        // keep
      }
    }
  }

  const data = asRecord(payload.data) ?? payload;
  const pkg = asRecord(data.package) ?? asRecord(payload.package);
  const order = asRecord(data.order) ?? asRecord(payload.order) ?? data;

  const eventType = pickString(
    payload.event,
    payload.type,
    payload.event_type,
    data.event,
    data.type,
  );

  const orderId = pickString(
    order.order_id,
    order.id,
    data.order_id,
    payload.order_id,
    pkg?.order_id,
  );
  const packageId = pickString(
    pkg?.id,
    pkg?.package_id,
    data.package_id,
    payload.package_id,
  );
  const tracking = pickString(
    pkg?.tracking_number,
    pkg?.tracking,
    pkg?.barcode,
    data.tracking_number,
    data.tracking,
    data.barcode,
    payload.tracking_number,
    payload.barcode,
    order.tracking_number,
  );
  const barcode = pickString(pkg?.barcode, data.barcode, payload.barcode);
  const status =
    normalizeFcargoStatusLabel(
      data.current_status ??
        pkg?.status ??
        data.status ??
        order.status ??
        payload.status,
    ) ?? null;
  const externalOrderId = pickString(
    order.external_order_id,
    data.external_order_id,
    payload.external_order_id,
    order.externalOrderId,
  );
  const phones = collectPhones(payload);

  // Resolve lead_id hint from our orders table if known
  let leadId: string | null = externalOrderId;
  const known = await findFcargoOrder({
    orderId,
    leadId: externalOrderId,
    tracking,
  });
  if (known) leadId = known.lead_id;

  const catalog = await upsertFcargoPackage({
    fcargoOrderId: orderId,
    fcargoPackageId: packageId,
    trackingNumber: tracking,
    barcode,
    status,
    statusRaw: pkg?.status ?? data.status ?? order.status ?? payload.status,
    eventType,
    phones,
    externalOrderId,
    leadId,
    rawLast: payload,
  });

  // Mirror shipment if already linked to Mini App
  if (catalog?.contact_session_id) {
    await syncShipmentMirrorFromPackage(catalog).catch((e) => {
      console.warn("[fcargo:ingest:mirror]", e);
    });
  }

  // Lead CRM path only when we can match an EPOS lead
  const parsed = parseFcargoWebhookPayload(payload);
  const leadResult = await applyFcargoStatusUpdate({
    ...parsed,
    orderId: orderId ?? parsed.orderId,
    externalOrderId: leadId ?? parsed.externalOrderId,
    tracking: tracking ?? parsed.tracking,
    status: status ?? parsed.status,
    raw: payload,
  });

  // If lead applied, backfill lead_id on catalog
  if (leadResult.ok && leadResult.leadId && catalog) {
    await upsertFcargoPackage({
      fcargoOrderId: catalog.fcargo_order_id,
      fcargoPackageId: catalog.fcargo_package_id,
      trackingNumber: catalog.tracking_number,
      leadId: leadResult.leadId,
      status: leadResult.fcargoStatus,
      rawLast: payload,
      eventType,
    });
  }

  return {
    package: catalog,
    leadApplied: leadResult.ok,
    leadId: leadResult.leadId,
    fcargoStatus: leadResult.fcargoStatus ?? status,
    crmStatus: leadResult.crmStatus,
    message: leadResult.ok ? undefined : leadResult.message,
    eventType,
  };
}
