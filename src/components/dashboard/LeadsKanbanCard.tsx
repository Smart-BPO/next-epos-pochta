"use client";

import type { HTMLAttributes } from "react";
import Link from "next/link";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { DashStatusBadge } from "@/components/dashboard/DashStatusBadge";
import { useDashLocale, useDashT } from "@/components/dashboard/DashLocaleProvider";
import type { InboxRow } from "@/lib/cms/inbox";
import { dashIntlLocale } from "@/i18n/dashboard";
import { formatDashDate, leadDraftStep } from "@/lib/cms/lead-display";
import { cn } from "@/lib/cn";

type TypeLabels = {
  price: string;
  business: string;
  contact: string;
  shipment: string;
};

function typeLabel(type: string, labels: TypeLabels) {
  if (type === "shipment") return labels.shipment;
  if (type === "price") return labels.price;
  if (type === "business") return labels.business;
  if (type === "contact") return labels.contact;
  return type;
}

function detailHref(row: InboxRow) {
  return row.kind === "lead"
    ? `/dashboard/leads/${row.id}/`
    : `/dashboard/webapp/shipments/?id=${encodeURIComponent(row.id)}`;
}

function LeadKanbanCardBody({
  row,
  typeLabels,
  showHandle,
  handleProps,
}: {
  row: InboxRow;
  typeLabels: TypeLabels;
  showHandle?: boolean;
  handleProps?: HTMLAttributes<HTMLButtonElement>;
}) {
  const t = useDashT();
  const { locale } = useDashLocale();
  const intlLocale = dashIntlLocale(locale);
  const step =
    row.kind === "lead" && row.status === "draft"
      ? leadDraftStep(row.payload)
      : null;

  return (
    <div className="flex items-start gap-2">
      {showHandle ? (
        <button
          type="button"
          className="mt-0.5 inline-flex shrink-0 cursor-grab touch-none rounded-md p-0.5 text-black/30 hover:bg-black/[0.04] hover:text-black/55 active:cursor-grabbing"
          aria-label="Drag"
          {...handleProps}
        >
          <GripVertical className="size-4" />
        </button>
      ) : null}
      <div className="min-w-0 flex-1">
        <div className="mb-1.5">
          <DashStatusBadge kind="source" value={row.source} />
        </div>
        <Link
          href={detailHref(row)}
          className="block truncate text-sm font-semibold text-ink hover:text-primary hover:underline"
        >
          {row.clientLabel}
        </Link>
        <p className="m-0 mt-1 truncate text-xs text-black/50">{row.routeLabel}</p>
        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.7rem] text-black/40">
          <span>{typeLabel(row.type, typeLabels)}</span>
          <span>·</span>
          <span>/{row.locale}</span>
          <span>·</span>
          <span>{formatDashDate(row.created_at, intlLocale)}</span>
          {step ? (
            <>
              <span>·</span>
              <span className="font-semibold uppercase tracking-wide">
                {t.leads.draftStep.replace("{step}", String(step))}
              </span>
            </>
          ) : null}
        </div>
        <Link
          href={detailHref(row)}
          className="mt-2 inline-block text-xs font-semibold text-primary hover:underline"
        >
          {t.common.open} →
        </Link>
      </div>
    </div>
  );
}

export function LeadsKanbanCardPreview({
  row,
  typeLabels,
}: {
  row: InboxRow;
  typeLabels: TypeLabels;
}) {
  return (
    <article className="rounded-xl border border-black/[0.08] bg-white p-3 shadow-[0_12px_28px_rgb(15_18_24/0.14)]">
      <LeadKanbanCardBody row={row} typeLabels={typeLabels} />
    </article>
  );
}

export function LeadsKanbanCard({
  row,
  dragDisabled,
  typeLabels,
}: {
  row: InboxRow;
  dragDisabled: boolean;
  typeLabels: TypeLabels;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: row.id,
    disabled: dragDisabled,
    data: { status: row.status, kind: row.kind },
  });

  return (
    <article
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={cn(
        "rounded-xl border border-black/[0.08] bg-white p-3 shadow-[0_1px_2px_rgb(15_18_24/0.04)]",
        isDragging && "z-10 opacity-40",
        dragDisabled ? "cursor-default" : null,
      )}
    >
      <LeadKanbanCardBody
        row={row}
        typeLabels={typeLabels}
        showHandle={!dragDisabled}
        handleProps={{ ...attributes, ...listeners }}
      />
    </article>
  );
}
