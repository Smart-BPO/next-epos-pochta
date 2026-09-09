import { SkeletonRoot } from "@/components/skeleton/SkeletonRoot";
import { PulseBlock } from "@/components/skeleton/PulseBlock";
import { dashCard, dashCardPad } from "@/styles/dashboard";
import { cn } from "@/lib/cn";

export function DashOverviewSkeleton() {
  return (
    <SkeletonRoot className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-2">
          <PulseBlock className="h-9 w-72 max-w-full" />
          <PulseBlock variant="muted" className="h-4 w-96 max-w-full" />
        </div>
        <PulseBlock className={cn(dashCard, "h-10 w-44")} />
      </div>

      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <li key={i} className={cn(dashCardPad, "min-h-[8.5rem]")}>
            <PulseBlock className="size-10 rounded-xl" />
            <PulseBlock variant="muted" className="mt-4 h-3 w-24" />
            <PulseBlock className="mt-2 h-8 w-16" />
            <PulseBlock variant="muted" className="mt-2 h-3 w-28" />
          </li>
        ))}
      </ul>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(16rem,0.8fr)_minmax(14rem,0.7fr)]">
        <section className={cn(dashCardPad, "min-h-[14rem]")}>
          <div className="flex items-center justify-between gap-3">
            <PulseBlock className="h-5 w-40" />
            <PulseBlock className="h-7 w-16 rounded-lg" />
          </div>
          <PulseBlock className="mt-4 h-[11rem] w-full rounded-xl" />
        </section>
        <section className={cn(dashCardPad, "min-h-[14rem]")}>
          <PulseBlock className="h-5 w-36" />
          <div className="mt-4 space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i}>
                <PulseBlock variant="muted" className="h-3 w-full" />
                <PulseBlock className="mt-1.5 h-1.5 w-full rounded-full" />
              </div>
            ))}
          </div>
        </section>
        <section className={cn(dashCardPad, "min-h-[14rem]")}>
          <PulseBlock className="h-5 w-32" />
          <div className="mt-4 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <PulseBlock key={i} variant="muted" className="h-10 w-full" />
            ))}
          </div>
        </section>
      </div>

      <section className={cn(dashCard, "min-h-[16rem] p-4")}>
        <PulseBlock className="mb-4 h-5 w-40" />
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <PulseBlock key={i} variant="muted" className="h-10 w-full" />
          ))}
        </div>
      </section>
    </SkeletonRoot>
  );
}
