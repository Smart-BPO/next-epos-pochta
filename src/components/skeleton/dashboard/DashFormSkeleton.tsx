import { SkeletonRoot } from "@/components/skeleton/SkeletonRoot";
import { DashPageHeaderSkeleton } from "@/components/skeleton/dashboard/DashPageHeaderSkeleton";
import { PulseBlock } from "@/components/skeleton/PulseBlock";
import { dashCardPad } from "@/styles/dashboard";
import { cn } from "@/lib/cn";

export function DashFormSkeleton({
  columns = 1,
  sections = 1,
  maxWidth = "full",
  withSubnav = false,
}: {
  columns?: 1 | 2;
  sections?: number;
  maxWidth?: "full" | "xl" | "3xl";
  withSubnav?: boolean;
}) {
  const maxW =
    maxWidth === "xl"
      ? "max-w-xl"
      : maxWidth === "3xl"
        ? "max-w-3xl"
        : "max-w-none";

  return (
    <SkeletonRoot className="space-y-5">
      <DashPageHeaderSkeleton />

      {withSubnav ? (
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <PulseBlock key={i} className="h-9 w-24 rounded-xl" />
          ))}
        </div>
      ) : null}

      <div
        className={cn(
          "grid gap-4",
          columns === 2 ? "lg:grid-cols-2" : "",
          maxW,
        )}
      >
        {Array.from({ length: sections }).map((_, s) => (
          <section key={s} className={cn(dashCardPad, "space-y-3")}>
            <PulseBlock className="h-5 w-36" />
            {Array.from({ length: columns === 2 ? 4 : 6 }).map((_, i) => (
              <div key={i} className="grid gap-1.5">
                <PulseBlock variant="muted" className="h-3 w-24" />
                <PulseBlock className="h-10 w-full" />
              </div>
            ))}
            <PulseBlock className="h-10 w-28" />
          </section>
        ))}
      </div>
    </SkeletonRoot>
  );
}
