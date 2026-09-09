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
import {
  LeadsKanbanCard,
  LeadsKanbanCardPreview,
} from "@/components/dashboard/LeadsKanbanCard";
import { useDashT } from "@/components/dashboard/DashLocaleProvider";
import type { InboxRow } from "@/lib/cms/inbox";
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

function sortRows(rows: InboxRow[]) {
  return [...rows].sort((a, b) => {
    if (b.sort_order !== a.sort_order) return b.sort_order - a.sort_order;
    return b.created_at.localeCompare(a.created_at);
  });
}

function groupByStatus(rows: InboxRow[]) {
  const map: Record<LeadKanbanStatus, InboxRow[]> = {
    draft: [],
    new: [],
    in_progress: [],
    done: [],
    spam: [],
  };
  for (const row of sortRows(rows)) {
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
  columns: Record<LeadKanbanStatus, InboxRow[]>,
  id: string,
): LeadKanbanStatus | null {
  for (const status of LEAD_KANBAN_STATUSES) {
    if (columns[status].some((r) => r.id === id)) return status;
  }
  return null;
}

function findRow(
  columns: Record<LeadKanbanStatus, InboxRow[]>,
  id: string,
): InboxRow | null {
  for (const status of LEAD_KANBAN_STATUSES) {
    const found = columns[status].find((r) => r.id === id);
    if (found) return found;
  }
  return null;
}

type TypeLabels = {
  price: string;
  business: string;
  contact: string;
  shipment: string;
};

function KanbanColumn({
  status,
  items,
  leadReadOnly,
  shipmentReadOnly,
  typeLabels,
}: {
  status: LeadKanbanStatus;
  items: InboxRow[];
  leadReadOnly: boolean;
  shipmentReadOnly: boolean;
  typeLabels: TypeLabels;
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
                key={`${row.kind}:${row.id}`}
                row={row}
                dragDisabled={
                  row.kind === "lead" ? leadReadOnly : shipmentReadOnly
                }
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
  shipmentReadOnly = true,
  updateShipmentStatusAction,
}: {
  rows: InboxRow[];
  readOnly: boolean;
  shipmentReadOnly?: boolean;
  updateShipmentStatusAction: (formData: FormData) => Promise<void>;
}) {
  const t = useDashT();
  const typeLabels: TypeLabels = {
    price: t.leads.typePrice,
    business: t.leads.typeBusiness,
    contact: t.leads.typeContact,
    shipment: t.leads.typeShipment,
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
      | Record<LeadKanbanStatus, InboxRow[]>
      | ((
          prev: Record<LeadKanbanStatus, InboxRow[]>,
        ) => Record<LeadKanbanStatus, InboxRow[]>),
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
    return findRow(columns, activeId);
  }, [activeId, columns]);

  const persistLeadColumn = async (
    status: LeadKanbanStatus,
    ordered: InboxRow[],
    snapshot: Record<LeadKanbanStatus, InboxRow[]>,
  ) => {
    const leadIds = ordered
      .filter((r) => r.kind === "lead")
      .map((r) => r.id);
    if (leadIds.length === 0) return;
    try {
      await updateLeadBoardAction({
        status,
        orderedIds: leadIds,
      });
      toast.success(t.leads.moved);
    } catch {
      setColumnsBoth(snapshot);
      toast.error(t.errors.saveFailed);
    }
  };

  const persistShipmentOutcome = async (
    id: string,
    shipmentStatus: "confirmed" | "cancelled",
    snapshot: Record<LeadKanbanStatus, InboxRow[]>,
  ) => {
    const fd = new FormData();
    fd.set("id", id);
    fd.set("status", shipmentStatus);
    try {
      await updateShipmentStatusAction(fd);
      toast.success(t.leads.moved);
      // Remove from board — no longer pending.
      setColumnsBoth((prev) => {
        const next = { ...prev };
        for (const key of LEAD_KANBAN_STATUSES) {
          next[key] = prev[key].filter((r) => r.id !== id);
        }
        return next;
      });
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
    const row = findRow(latest, activeLeadId);
    if (!status || !row) {
      setColumnsBoth(snapshot);
      return;
    }

    if (row.kind === "webapp_shipment") {
      if (status === "done") {
        await persistShipmentOutcome(row.id, "confirmed", snapshot);
        return;
      }
      if (status === "spam") {
        await persistShipmentOutcome(row.id, "cancelled", snapshot);
        return;
      }
      // in_progress / draft / reorder in new — revert (no shipment sort_order).
      setColumnsBoth(snapshot);
      if (status !== "new") {
        toast.error(t.errors.saveFailed);
      }
      return;
    }

    const ordered = latest[status].map((item, index) => ({
      ...item,
      status,
      sort_order: orderedSortBase() - index,
    }));

    setColumnsBoth((prev) => ({ ...prev, [status]: ordered }));
    await persistLeadColumn(status, ordered, snapshot);
  };

  const onDragCancel = () => {
    setActiveId(null);
    setColumnsBoth(groupByStatus(rows));
  };

  const board = (
    <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-2">
      {LEAD_KANBAN_STATUSES.map((status) => (
        <KanbanColumn
          key={status}
          status={status}
          items={columns[status]}
          leadReadOnly={readOnly}
          shipmentReadOnly={shipmentReadOnly}
          typeLabels={typeLabels}
        />
      ))}
    </div>
  );

  if (readOnly && shipmentReadOnly) {
    return board;
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
      {board}
      <DragOverlay>
        {activeRow ? (
          <div className="w-[16.5rem]">
            <LeadsKanbanCardPreview row={activeRow} typeLabels={typeLabels} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

function orderedSortBase() {
  return Math.floor(Date.now() / 1000);
}
