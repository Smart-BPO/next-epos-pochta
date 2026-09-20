"use client";

import { useState } from "react";
import { useDashT } from "@/components/dashboard/DashLocaleProvider";
import type { FcargoLogRow } from "@/lib/fcargo/log";
import { dashCardPad, dashSectionTitle } from "@/styles/dashboard";

function pickEventType(row: FcargoLogRow): string | null {
  const fromRes = row.response_body;
  if (fromRes && typeof fromRes === "object") {
    const o = fromRes as Record<string, unknown>;
    if (typeof o.eventType === "string" && o.eventType.trim()) {
      return o.eventType.trim();
    }
  }
  const fromReq = row.request_body;
  if (fromReq && typeof fromReq === "object") {
    const o = fromReq as Record<string, unknown>;
    for (const key of ["type", "event", "event_type"] as const) {
      const v = o[key];
      if (typeof v === "string" && v.trim()) return v.trim();
    }
    const data = o.data;
    if (data && typeof data === "object") {
      const d = data as Record<string, unknown>;
      if (typeof d.event === "string" && d.event.trim()) return d.event.trim();
    }
  }
  return null;
}

function JsonBlock({
  label,
  value,
}: {
  label: string;
  value: unknown;
}) {
  if (value == null) return null;
  return (
    <div className="mt-2">
      <p className="m-0 mb-1 text-[10px] font-semibold uppercase tracking-wide text-black/40">
        {label}
      </p>
      <pre className="m-0 max-h-64 overflow-auto rounded-lg bg-black/[0.04] p-3 text-[11px] leading-relaxed text-ink">
        {typeof value === "string"
          ? value
          : JSON.stringify(value, null, 2)}
      </pre>
    </div>
  );
}

export function FcargoLogList({
  rows,
  variant,
  title,
  lead,
}: {
  rows: FcargoLogRow[];
  variant: "api" | "webhook";
  title: string;
  lead: string;
}) {
  const t = useDashT();
  const f = t.fcargo;
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <section className={`${dashCardPad} grid max-w-3xl gap-3`}>
      <h2 className={dashSectionTitle}>{title}</h2>
      {lead ? <p className="m-0 text-sm text-black/55">{lead}</p> : null}

      {rows.length === 0 ? (
        <p className="m-0 text-sm text-black/45">{f.logEmpty}</p>
      ) : (
        <ul className="m-0 grid list-none gap-2 p-0 text-xs text-black/70">
          {rows.map((row) => {
            const eventType =
              variant === "webhook" ? pickEventType(row) : null;
            const expanded = openId === row.id;
            const hasDetail =
              row.request_headers != null ||
              row.response_headers != null ||
              row.request_body != null ||
              row.response_body != null ||
              Boolean(row.url);

            return (
              <li
                key={row.id}
                className="rounded-lg border border-black/[0.06] px-3 py-2"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-ink">
                    {variant === "webhook" ? f.logIn : f.logOut}
                  </span>
                  {eventType ? (
                    <span className="rounded bg-black/[0.04] px-1.5 py-0.5 font-medium text-ink">
                      {eventType}
                    </span>
                  ) : null}
                  <span>
                    {row.method} {row.path}
                  </span>
                  {row.http_status != null ? (
                    <span className="text-black/40">{row.http_status}</span>
                  ) : null}
                  {row.ok === false ? (
                    <span className="text-primary">
                      {row.error_message || "err"}
                    </span>
                  ) : null}
                </div>
                <div className="mt-0.5 text-[11px] text-black/40">
                  {new Date(row.created_at).toLocaleString()}
                  {row.tracking_number ? ` · ${row.tracking_number}` : ""}
                  {row.lead_id ? ` · ${row.lead_id}` : ""}
                  {row.order_id ? ` · #${row.order_id}` : ""}
                  {row.duration_ms != null ? ` · ${row.duration_ms}ms` : ""}
                </div>
                {hasDetail ? (
                  <button
                    type="button"
                    className="mt-1 text-[11px] font-semibold text-primary"
                    onClick={() => setOpenId(expanded ? null : row.id)}
                  >
                    {expanded ? f.logCollapse : f.logExpand}
                  </button>
                ) : null}
                {expanded ? (
                  <div className="grid gap-1">
                    {row.url ? (
                      <JsonBlock label={f.logUrl} value={row.url} />
                    ) : null}
                    <JsonBlock
                      label={f.logRequestHeaders}
                      value={row.request_headers}
                    />
                    <JsonBlock
                      label={f.logRequestBody}
                      value={row.request_body}
                    />
                    <JsonBlock
                      label={f.logResponseHeaders}
                      value={row.response_headers}
                    />
                    <JsonBlock
                      label={f.logResponseBody}
                      value={row.response_body}
                    />
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
