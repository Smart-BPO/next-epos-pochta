import { SkeletonRoot } from "@/components/skeleton/SkeletonRoot";
import { DashPageHeaderSkeleton } from "@/components/skeleton/dashboard/DashPageHeaderSkeleton";
import { PulseBlock } from "@/components/skeleton/PulseBlock";
import { dashCardPad } from "@/styles/dashboard";

export function DashDetailSkeleton() {
  return (
    <SkeletonRoot className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <PulseBlock key={i} variant="muted" className="h-4 w-16" />
        ))}
      </div>
      <DashPageHeaderSkeleton withActions />

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <section className={`${dashCardPad} space-y-4`}>
          <PulseBlock className="h-5 w-32" />
          <div className="grid gap-3 sm:grid-cols-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-1">
                <PulseBlock variant="muted" className="h-3 w-20" />
                <PulseBlock className="h-4 w-full" />
              </div>
            ))}
          </div>
          <PulseBlock className="h-24 w-full rounded-xl" />
        </section>
        <aside className={`${dashCardPad} space-y-3`}>
          <PulseBlock className="h-5 w-28" />
          <PulseBlock className="h-10 w-full" />
          <PulseBlock className="h-10 w-full" />
        </aside>
      </div>
    </SkeletonRoot>
  );
}
