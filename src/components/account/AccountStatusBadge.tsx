import { cn } from "@/lib/cn";

const STAGE_TONE: Record<string, string> = {
  created: "bg-black/[0.05] text-black/65",
  accepted: "bg-sky-50 text-sky-700",
  in_transit: "bg-amber-50 text-amber-700",
  out_for_delivery: "bg-amber-50 text-amber-700",
  delivery_attempt: "bg-orange-50 text-orange-700",
  delivered: "bg-emerald-50 text-emerald-700",
  cancelled: "bg-black/[0.05] text-black/45",
  returned: "bg-black/[0.05] text-black/45",
};

export function AccountStatusBadge({
  stage,
  label,
  className,
}: {
  stage: string;
  label: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-[11px] font-semibold",
        STAGE_TONE[stage] ?? "bg-black/[0.05] text-black/65",
        className,
      )}
    >
      {label}
    </span>
  );
}
