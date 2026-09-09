import { SkeletonRoot } from "@/components/skeleton/SkeletonRoot";
import { PulseBlock } from "@/components/skeleton/PulseBlock";
import { dashCardPad } from "@/styles/dashboard";

export function DashAuthSkeleton() {
  return (
    <SkeletonRoot className="grid min-h-dvh place-items-center p-4">
      <div className={`${dashCardPad} w-full max-w-sm space-y-4`}>
        <PulseBlock className="mx-auto h-8 w-40" />
        <PulseBlock variant="muted" className="mx-auto h-4 w-56" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="grid gap-1.5">
            <PulseBlock variant="muted" className="h-3 w-16" />
            <PulseBlock className="h-10 w-full" />
          </div>
        ))}
        <PulseBlock className="h-11 w-full rounded-xl" />
      </div>
    </SkeletonRoot>
  );
}
