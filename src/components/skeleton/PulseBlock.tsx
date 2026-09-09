import { cn } from "@/lib/cn";
import { skelBlock, skelCircle, skelLine, skelMuted } from "@/styles/skeleton";

type PulseBlockProps = {
  className?: string;
  variant?: "block" | "line" | "circle" | "muted";
};

export function PulseBlock({
  className,
  variant = "block",
}: PulseBlockProps) {
  const base =
    variant === "line"
      ? skelLine
      : variant === "circle"
        ? skelCircle
        : variant === "muted"
          ? skelMuted
          : skelBlock;
  return <div className={cn(base, className)} aria-hidden />;
}
