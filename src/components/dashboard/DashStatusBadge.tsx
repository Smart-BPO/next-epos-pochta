import { cn } from "@/lib/cn";
import { dashBadgeBase } from "@/styles/dashboard";

type Tone = {
  label: string;
  className: string;
};

const LEAD: Record<string, Tone> = {
  new: { label: "Новая", className: "bg-[#fee2e2] text-[#b91c1c]" },
  in_progress: { label: "В работе", className: "bg-[#fef3c7] text-[#b45309]" },
  done: { label: "Готово", className: "bg-[#dcfce7] text-[#15803d]" },
  spam: { label: "Спам", className: "bg-black/[0.06] text-black/50" },
};

const SHIPMENT: Record<string, Tone> = {
  draft: { label: "Черновик", className: "bg-black/[0.06] text-black/50" },
  pending_manager: {
    label: "Ждёт менеджера",
    className: "bg-[#fef3c7] text-[#b45309]",
  },
  confirmed: { label: "Подтверждено", className: "bg-[#dbeafe] text-[#1d4ed8]" },
  cancelled: { label: "Отменено", className: "bg-black/[0.06] text-black/45" },
};

const NEWS: Record<string, Tone> = {
  draft: { label: "Черновик", className: "bg-black/[0.06] text-black/50" },
  published: { label: "Опубликовано", className: "bg-[#dcfce7] text-[#15803d]" },
};

const ROLE: Record<string, Tone> = {
  owner: { label: "Owner", className: "bg-primary-soft text-primary" },
  editor: { label: "Editor", className: "bg-[#dbeafe] text-[#1d4ed8]" },
  crm: { label: "CRM", className: "bg-[#fef3c7] text-[#b45309]" },
  viewer: { label: "Viewer", className: "bg-black/[0.06] text-black/50" },
};

const SOURCE: Record<string, Tone> = {
  telegram_contact: {
    label: "Telegram",
    className: "bg-[#e0f2fe] text-[#0369a1]",
  },
  manual: { label: "Вручную", className: "bg-black/[0.06] text-black/50" },
};

export function DashStatusBadge({
  kind,
  value,
}: {
  kind: "lead" | "shipment" | "news" | "role" | "source";
  value: string;
}) {
  const map =
    kind === "lead"
      ? LEAD
      : kind === "shipment"
        ? SHIPMENT
        : kind === "news"
          ? NEWS
          : kind === "role"
            ? ROLE
            : SOURCE;
  const tone = map[value] ?? {
    label: value,
    className: "bg-black/[0.06] text-black/50",
  };
  return (
    <span className={cn(dashBadgeBase, tone.className)}>{tone.label}</span>
  );
}

export const LEAD_STATUS_LABELS: Record<string, string> = Object.fromEntries(
  Object.entries(LEAD).map(([k, v]) => [k, v.label]),
);

export const SHIPMENT_STATUS_LABELS: Record<string, string> =
  Object.fromEntries(Object.entries(SHIPMENT).map(([k, v]) => [k, v.label]));
