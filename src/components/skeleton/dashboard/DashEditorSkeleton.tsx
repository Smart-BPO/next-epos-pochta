import { SkeletonRoot } from "@/components/skeleton/SkeletonRoot";
import { PulseBlock } from "@/components/skeleton/PulseBlock";
import { dashCard, dashCardPad } from "@/styles/dashboard";
import { cn } from "@/lib/cn";

export function DashEditorSkeleton() {
  return (
    <SkeletonRoot
      className={cn(
        "space-y-5",
        "pb-28 lg:pb-24",
      )}
    >
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <PulseBlock key={i} variant="muted" className="h-4 w-14" />
        ))}
      </div>

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-2">
          <PulseBlock className="h-8 w-64 max-w-full" />
          <PulseBlock variant="muted" className="h-4 w-48" />
        </div>
        <div className="hidden gap-2 lg:flex">
          <PulseBlock className="h-10 w-24" />
          <PulseBlock className="h-10 w-28" />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_18rem] xl:grid-cols-[1fr_20rem]">
        <div className="space-y-4">
          <div className="flex gap-2">
            <PulseBlock className="h-9 w-12 rounded-lg" />
            <PulseBlock className="h-9 w-12 rounded-lg" />
          </div>
          <section className={cn(dashCardPad, "space-y-3")}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="grid gap-1.5">
                <PulseBlock variant="muted" className="h-3 w-20" />
                <PulseBlock className="h-10 w-full" />
              </div>
            ))}
          </section>
          <section className={cn(dashCard, "min-h-[20rem] p-4")}>
            <div className="mb-3 flex gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <PulseBlock key={i} className="size-8 rounded-lg" />
              ))}
            </div>
            <PulseBlock className="h-[16rem] w-full rounded-xl" />
          </section>
        </div>

        <aside className={cn(dashCardPad, "space-y-3 lg:sticky lg:top-4 lg:self-start")}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="grid gap-1.5">
              <PulseBlock variant="muted" className="h-3 w-16" />
              <PulseBlock className="h-10 w-full" />
            </div>
          ))}
        </aside>
      </div>
    </SkeletonRoot>
  );
}
