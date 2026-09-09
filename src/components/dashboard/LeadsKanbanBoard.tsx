"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { toast } from "react-toastify";
import { updateLeadBoardAction } from "@/app/dashboard/(app)/leads/actions";
import { DashStatusBadge } from "@/components/dashboard/DashStatusBadge";
import { LeadsKanbanCard, LeadsKanbanCardPreview } from "@/components/dashboard/LeadsKanbanCard";
import type { LeadListRow } from "@/components/dashboard/LeadsListClient";
import { useDashT } from "@/components/dashboard/DashLocaleProvider";
import { cn } from "@/lib/cn";
import { dashCard } from "@/styles/dashboard";

export const LEAD_KANBAN_STATUSES = [
  "draft",
  "new",
  "in_progress",
  "done",
  "spam",
] as const;

export type LeadKanbanStatus = (typeof LEAD_KANBAN_STATUSES)[number];

function columnDropId(status: string) {
  return `column:${status}`;
}

function parseColumnId(id: string | number): LeadKanbanStatus | null {
  const raw = String(id);
  if (!raw.startsWith("column:")) return null;
  const status = raw.slice("column:".length);
  return (LEAD_KANBAN_STATUSES as readonly string[]).includes(status)
    ? (status as LeadKanbanStatus)
    : null;
}

function sortLeads(rows: LeadListRow[]) {
  return [...rows].sort((a, b) => {
    if (b.sort_order !== a.sort_order) return b.sort_order - a.sort_order;
    return b.created_at.localeCompare(a.created_at);
  });
}

function groupByStatus(rows: LeadListRow[]) {
  const map: Record<LeadKanbanStatus, LeadListRow[]> = {
    draft: [],
    new: [],
    in_progress: [],
    done: [],
    spam: [],
  };
  for (const row of sortLeads(rows)) {
    const status = (LEAD_KANBAN_STATUSES as readonly string[]).includes(
      row.status,
    )
      ? (row.status as LeadKanbanStatus)
      : "new";
    map[status].push(row);
  }
  return map;
}

function findStatusForId(
  columns: Record<LeadKanbanStatus, LeadListRow[]>,
  id: string,
): LeadKanbanStatus | null {
  for (const status of LEAD_KANBAN_STATUSES) {
    if (columns[status].some((r) => r.id === id)) return status;
  }
  return null;
}

function KanbanColumn({
  status,
  items,
  readOnly,
  typeLabels,
}: {
  status: LeadKanbanStatus;
  items: LeadListRow[];
  readOnly: boolean;
  typeLabels: { price: string; business: string; contact: string };
}) {
  const t = useDashT();
  const { setNodeRef, isOver } = useDroppable({
    id: columnDropId(status),
    data: { status },
  });

  return (
    <section
      className={cn(
        dashCard,
        "flex w-[17.5rem] shrink-0 flex-col",
        isOver && "ring-2 ring-primary/30",
      )}
    >
      <header className="sticky top-0 z-[1] flex items-center justify-between gap-2 border-b border-black/[0.06] bg-white/95 px-3 py-2.5 backdrop-blur">
        <DashStatusBadge kind="lead" value={status} />
        <span className="rounded-lg bg-black/[0.04] px-2 py-0.5 text-xs font-semibold text-black/45">
          {items.length}
        </span>
      </header>
      <div
        ref={setNodeRef}
        className="flex min-h-[12rem] flex-1 flex-col gap-2 overflow-y-auto p-2"
      >
        <SortableContext
          items={items.map((r) => r.id)}
          strategy={verticalListSortingStrategy}
        >
          {items.length === 0 ? (
            <p className="m-0 px-1 py-6 text-center text-xs text-black/35">
              {t.leads.kanbanEmpty}
            </p>
          ) : (
            items.map((row) => (
              <LeadsKanbanCard
                key={row.id}
                row={row}
                readOnly={readOnly}
                typeLabels={typeLabels}
              />
            ))
          )}
        </SortableContext>
      </div>
    </section>
  );
}

export function LeadsKanbanBoard({
  rows,
  readOnly,
}: {
  rows: LeadListRow[];
  readOnly: boolean;
}) {
  const t = useDashT();
  const typeLabels = {
    price: t.leads.typePrice,
    business: t.leads.typeBusiness,
    contact: t.leads.typeContact,
  };

  const [columns, setColumns] = useState(() => groupByStatus(rows));
  const [activeId, setActiveId] = useState<string | null>(null);
  const columnsRef = useRef(columns);

  useEffect(() => {
    const next = groupByStatus(rows);
    setColumns(next);
    columnsRef.current = next;
  }, [rows]);

  const setColumnsBoth = (
    next:
      | Record<LeadKanbanStatus, LeadListRow[]>
      | ((
          prev: Record<LeadKanbanStatus, LeadListRow[]>,
        ) => Record<LeadKanbanStatus, LeadListRow[]>),
  ) => {
    setColumns((prev) => {
      const resolved = typeof next === "function" ? next(prev) : next;
      columnsRef.current = resolved;
      return resolved;
    });
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
  );

  const activeRow = useMemo(() => {
    if (!activeId) return null;
    for (const status of LEAD_KANBAN_STATUSES) {
      const found = columns[status].find((r) => r.id === activeId);
      if (found) return found;
    }
    return null;
  }, [activeId, columns]);

  const persistColumn = async (
    status: LeadKanbanStatus,
    ordered: LeadListRow[],
    snapshot: Record<LeadKanbanStatus, LeadListRow[]>,
  ) => {
    try {
      await updateLeadBoardAction({
        status,
        orderedIds: ordered.map((r) => r.id),
      });
      toast.success(t.leads.moved);
    } catch {
      setColumnsBoth(snapshot);
      toast.error(t.errors.saveFailed);
    }
  };

  const onDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  };

  const onDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeLeadId = String(active.id);
    const overId = String(over.id);

    setColumnsBoth((prev) => {
      const fromStatus = findStatusForId(prev, activeLeadId);
      if (!fromStatus) return prev;

      const overColumn = parseColumnId(overId);
      const toStatus =
        overColumn ?? findStatusForId(prev, overId) ?? fromStatus;

      if (fromStatus === toStatus) {
        const fromItems = [...prev[fromStatus]];
        const oldIndex = fromItems.findIndex((r) => r.id === activeLeadId);
        if (oldIndex < 0) return prev;

        let newIndex = fromItems.findIndex((r) => r.id === overId);
        if (parseColumnId(overId)) newIndex = fromItems.length - 1;
        if (newIndex < 0) newIndex = fromItems.length - 1;
        if (oldIndex === newIndex) return prev;

        const [moved] = fromItems.splice(oldIndex, 1);
        if (!moved) return prev;
        fromItems.splice(newIndex, 0, moved);
        return { ...prev, [fromStatus]: fromItems };
      }

      const fromItems = [...prev[fromStatus]];
      const toItems = [...prev[toStatus]];
      const oldIndex = fromItems.findIndex((r) => r.id === activeLeadId);
      if (oldIndex < 0) return prev;
      const [moved] = fromItems.splice(oldIndex, 1);
      if (!moved) return prev;

      const updated = { ...moved, status: toStatus };
      let newIndex = toItems.findIndex((r) => r.id === overId);
      if (parseColumnId(overId) || newIndex < 0) newIndex = toItems.length;
      toItems.splice(newIndex, 0, updated);

      return {
        ...prev,
        [fromStatus]: fromItems,
        [toStatus]: toItems,
      };
    });
  };

  const onDragEnd = async (event: DragEndEvent) => {
    setActiveId(null);
    const { active } = event;
    const activeLeadId = String(active.id);
    const snapshot = groupByStatus(rows);
    const latest = columnsRef.current;

    const status = findStatusForId(latest, activeLeadId);
    if (!status) {
      setColumnsBoth(snapshot);
      return;
    }

    const ordered = latest[status].map((row, index) => ({
      ...row,
      status,
      sort_order: orderedSortBase() - index,
    }));

    setColumnsBoth((prev) => ({ ...prev, [status]: ordered }));
    await persistColumn(status, ordered, snapshot);
  };

  const onDragCancel = () => {
    setActiveId(null);
    setColumnsBoth(groupByStatus(rows));
  };

  if (readOnly) {
    return (
      <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-2">
        {LEAD_KANBAN_STATUSES.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            items={columns[status]}
            readOnly
            typeLabels={typeLabels}
          />
        ))}
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      onDragCancel={onDragCancel}
    >
      <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-2">
        {LEAD_KANBAN_STATUSES.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            items={columns[status]}
            readOnly={false}
            typeLabels={typeLabels}
          />
        ))}
      </div>
      <DragOverlay>
        {activeRow ? (
          <div className="w-[16.5rem]">
            <LeadsKanbanCardPreview
              row={activeRow}
              typeLabels={typeLabels}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

function orderedSortBase() {
  return Math.floor(Date.now() / 1000);
}
