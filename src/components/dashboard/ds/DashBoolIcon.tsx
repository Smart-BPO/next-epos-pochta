import { BadgeCheck, Link2, Minus } from "lucide-react";
import { cn } from "@/lib/cn";

type Tone = "success" | "info" | "neutral";

const TONE: Record<
  Tone,
  { icon: typeof BadgeCheck; className: string }
> = {
  success: {
    icon: BadgeCheck,
    className: "text-emerald-600",
  },
  info: {
    icon: Link2,
    className: "text-sky-600",
  },
  neutral: {
    icon: Minus,
    className: "text-black/25",
  },
};

/**
 * Compact yes/no indicator for table cells (Telegram verified, FCargo linked, …).
 */
export function DashBoolIcon({
  value,
  trueTone = "success",
  trueLabel,
  falseLabel,
  className,
}: {
  value: boolean;
  trueTone?: Exclude<Tone, "neutral">;
  trueLabel?: string;
  falseLabel?: string;
  className?: string;
}) {
  const tone = value ? trueTone : "neutral";
  const { icon: Icon, className: toneClass } = TONE[tone];
  const label = value ? trueLabel : falseLabel;

  return (
    <span
      className={cn(
        "inline-flex size-7 items-center justify-center",
        toneClass,
        className,
      )}
      title={label}
      aria-label={label}
      role="img"
    >
      <Icon className="size-4" strokeWidth={1.75} aria-hidden />
    </span>
  );
}
