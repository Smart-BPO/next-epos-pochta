import { SkeletonRoot } from "@/components/skeleton/SkeletonRoot";
import { DashPageHeaderSkeleton } from "@/components/skeleton/dashboard/DashPageHeaderSkeleton";
import { PulseBlock } from "@/components/skeleton/PulseBlock";
import { dashCardPad } from "@/styles/dashboard";
import { cn } from "@/lib/cn";

export function DashMessagingHubSkeleton() {
  return (
    <SkeletonRoot className="space-y-5">
      <DashPageHeaderSkeleton />

      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <PulseBlock key={i} className="h-9 w-28 rounded-xl" />
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <section key={i} className={cn(dashCardPad, "min-h-[8rem] space-y-3")}>
            <PulseBlock className="h-5 w-24" />
            <PulseBlock variant="muted" className="h-3 w-full" />
            <PulseBlock variant="muted" className="h-3 w-2/3" />
            <PulseBlock className="h-8 w-20" />
          </section>
        ))}
      </div>

      <section className={cn(dashCardPad, "min-h-[12rem] space-y-2")}>
        <PulseBlock className="h-5 w-40" />
        {Array.from({ length: 4 }).map((_, i) => (
          <PulseBlock key={i} variant="muted" className="h-10 w-full" />
        ))}
      </section>
    </SkeletonRoot>
  );
}
