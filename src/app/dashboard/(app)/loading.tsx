import { dashCard } from "@/styles/dashboard";

export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="space-y-2">
        <div className="h-8 w-56 rounded-lg bg-black/[0.06]" />
        <div className="h-4 w-80 max-w-full rounded bg-black/[0.04]" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className={`${dashCard} h-32 p-5`}>
            <div className="size-10 rounded-xl bg-black/[0.05]" />
            <div className="mt-4 h-3 w-24 rounded bg-black/[0.05]" />
            <div className="mt-2 h-7 w-16 rounded bg-black/[0.06]" />
          </div>
        ))}
      </div>
      <div className={`${dashCard} h-64`} />
    </div>
  );
}
