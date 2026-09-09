import { SkeletonRoot } from "@/components/skeleton/SkeletonRoot";
import {
  PublicPageIntroBlocks,
  PublicPageIntroSection,
} from "@/components/skeleton/public/PublicPageIntroSkeleton";
import { PulseBlock } from "@/components/skeleton/PulseBlock";
import { pageContainer, section } from "@/styles/ui";
import { cn } from "@/lib/cn";

export function PublicCardGridSkeleton({
  columns = "3",
}: {
  columns?: "3" | "4";
}) {
  return (
    <SkeletonRoot>
      <PublicPageIntroSection>
        <PublicPageIntroBlocks />
      </PublicPageIntroSection>
      <section className={section}>
        <div
          className={cn(
            pageContainer,
            "grid grid-cols-2 gap-3 sm:gap-6",
            columns === "4" ? "lg:grid-cols-4" : "lg:grid-cols-3",
          )}
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <article
              key={i}
              className="flex min-h-[12rem] flex-col overflow-hidden rounded-2xl border border-black/10 bg-white"
            >
              <PulseBlock className="aspect-[16/10] w-full rounded-none" />
              <div className="flex flex-1 flex-col gap-2 p-4">
                <PulseBlock className="h-4 w-3/4" />
                <PulseBlock variant="muted" className="h-3 w-full" />
                <PulseBlock variant="muted" className="mt-auto h-3 w-20" />
              </div>
            </article>
          ))}
        </div>
      </section>
    </SkeletonRoot>
  );
}
