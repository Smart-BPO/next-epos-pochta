import { SkeletonRoot } from "@/components/skeleton/SkeletonRoot";
import { DashPageHeaderSkeleton } from "@/components/skeleton/dashboard/DashPageHeaderSkeleton";
import { PulseBlock } from "@/components/skeleton/PulseBlock";
import { dashCard } from "@/styles/dashboard";
import { cn } from "@/lib/cn";

export function DashListSkeleton({
  variant = "auto",
}: {
  /** auto: table sm+, cards below sm */
  variant?: "auto" | "table" | "cards";
}) {
  const showTable = variant === "table" || variant === "auto";
  const showCards = variant === "cards" || variant === "auto";

  return (
    <SkeletonRoot className="space-y-5">
      <DashPageHeaderSkeleton withActions />

      <div className="flex flex-wrap items-end gap-2">
        <div className="grid min-w-[12rem] flex-1 gap-1.5">
          <PulseBlock variant="muted" className="h-3 w-12" />
          <PulseBlock className="h-10 w-full" />
        </div>
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="grid gap-1.5">
            <PulseBlock variant="muted" className="h-3 w-14" />
            <PulseBlock className="h-10 w-[8rem]" />
          </div>
        ))}
        <div className="grid gap-1.5">
          <PulseBlock variant="muted" className="h-3 w-10" />
          <PulseBlock className="h-10 w-[5rem]" />
        </div>
        <PulseBlock className="h-10 w-24" />
      </div>

      {showTable ? (
        <div className={cn(dashCard, "hidden min-h-[16rem] overflow-hidden sm:block")}>
          <div className="border-b border-black/[0.06] px-4 py-3">
            <div className="flex gap-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <PulseBlock key={i} variant="muted" className="h-3 w-20" />
              ))}
            </div>
          </div>
          <div className="space-y-0 divide-y divide-black/[0.04] p-0">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-4 py-3">
                <PulseBlock variant="muted" className="h-4 flex-1" />
                <PulseBlock variant="muted" className="hidden h-4 w-24 md:block" />
                <PulseBlock variant="muted" className="h-4 w-16" />
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {showCards ? (
        <ul
          className={cn(
            "grid list-none gap-3 p-0",
            variant === "auto" ? "sm:hidden" : "",
            "sm:grid-cols-2 xl:grid-cols-3",
          )}
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <li key={i} className={cn(dashCard, "flex min-h-[9rem] flex-col p-4")}>
              <PulseBlock className="h-5 w-3/4 max-w-[12rem]" />
              <PulseBlock variant="muted" className="mt-2 h-3 w-full" />
              <PulseBlock variant="muted" className="mt-1 h-3 w-2/3" />
              <div className="mt-auto flex justify-end gap-1 pt-4">
                <PulseBlock className="h-7 w-16" />
                <PulseBlock className="h-7 w-16" />
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </SkeletonRoot>
  );
}
