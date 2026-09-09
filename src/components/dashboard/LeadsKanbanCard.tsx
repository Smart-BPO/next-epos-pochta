"use client";

import type { HTMLAttributes } from "react";
import Link from "next/link";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { useDashLocale, useDashT } from "@/components/dashboard/DashLocaleProvider";
import type { LeadListRow } from "@/components/dashboard/LeadsListClient";
import { dashIntlLocale } from "@/i18n/dashboard";
import {
  formatDashDate,
  leadClientLabel,
  leadDraftStep,
  leadRouteLabel,
  leadTypeLabel,
} from "@/lib/cms/lead-display";
import { cn } from "@/lib/cn";

function LeadKanbanCardBody({
  row,
  typeLabels,
  showHandle,
  handleProps,
}: {
  row: LeadListRow;
  typeLabels: { price: string; business: string; contact: string };
  showHandle?: boolean;
  handleProps?: HTMLAttributes<HTMLButtonElement>;
}) {
  const t = useDashT();
  const { locale } = useDashLocale();
  const intlLocale = dashIntlLocale(locale);
  const step = row.status === "draft" ? leadDraftStep(row.payload) : null;

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
        <Link
          href={`/dashboard/leads/${row.id}/`}
          className="block truncate text-sm font-semibold text-ink hover:text-primary hover:underline"
        >
          {leadClientLabel(row.payload)}
        </Link>
        <p className="m-0 mt-1 truncate text-xs text-black/50">
          {leadRouteLabel(row.type, row.payload)}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.7rem] text-black/40">
          <span>{leadTypeLabel(row.type, typeLabels)}</span>
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
          href={`/dashboard/leads/${row.id}/`}
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
  row: LeadListRow;
  typeLabels: { price: string; business: string; contact: string };
}) {
  return (
    <article className="rounded-xl border border-black/[0.08] bg-white p-3 shadow-[0_12px_28px_rgb(15_18_24/0.14)]">
      <LeadKanbanCardBody row={row} typeLabels={typeLabels} />
    </article>
  );
}

export function LeadsKanbanCard({
  row,
  readOnly,
  typeLabels,
}: {
  row: LeadListRow;
  readOnly: boolean;
  typeLabels: { price: string; business: string; contact: string };
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
    disabled: readOnly,
    data: { status: row.status },
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
        readOnly ? "cursor-default" : null,
      )}
    >
      <LeadKanbanCardBody
        row={row}
        typeLabels={typeLabels}
        showHandle={!readOnly}
        handleProps={{ ...attributes, ...listeners }}
      />
    </article>
  );
}
