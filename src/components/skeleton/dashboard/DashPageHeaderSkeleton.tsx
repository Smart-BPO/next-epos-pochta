import { PulseBlock } from "@/components/skeleton/PulseBlock";

export function DashPageHeaderSkeleton({
  withActions = false,
}: {
  withActions?: boolean;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0 space-y-2">
        <PulseBlock className="h-8 w-56 max-w-full" />
        <PulseBlock variant="muted" className="h-4 w-80 max-w-full" />
      </div>
      {withActions ? (
        <div className="flex gap-2">
          <PulseBlock className="h-10 w-24" />
          <PulseBlock className="h-10 w-28" />
        </div>
      ) : null}
    </div>
  );
}
