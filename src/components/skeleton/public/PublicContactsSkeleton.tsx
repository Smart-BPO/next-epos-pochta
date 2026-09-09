import { SkeletonRoot } from "@/components/skeleton/SkeletonRoot";
import {
  PublicPageIntroBlocks,
  PublicPageIntroSection,
} from "@/components/skeleton/public/PublicPageIntroSkeleton";
import { PulseBlock } from "@/components/skeleton/PulseBlock";
import { pageContainer, sectionMuted } from "@/styles/ui";
import { cn } from "@/lib/cn";

export function PublicContactsSkeleton() {
  return (
    <SkeletonRoot>
      <PublicPageIntroSection>
        <PublicPageIntroBlocks />
      </PublicPageIntroSection>
      <section className={sectionMuted}>
        <div
          className={cn(
            pageContainer,
            "grid gap-10 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:items-start lg:gap-12",
          )}
        >
          <div className="space-y-5">
            <PulseBlock className="h-6 w-40" />
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-1.5">
                <PulseBlock variant="muted" className="h-3 w-16" />
                <PulseBlock className="h-5 w-48 max-w-full" />
              </div>
            ))}
          </div>
          <PulseBlock className="min-h-[20rem] w-full rounded-3xl lg:min-h-[24rem]" />
        </div>
      </section>
    </SkeletonRoot>
  );
}
