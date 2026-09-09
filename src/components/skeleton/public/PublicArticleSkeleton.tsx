import { SkeletonRoot } from "@/components/skeleton/SkeletonRoot";
import {
  PublicPageIntroBlocks,
  PublicPageIntroSection,
} from "@/components/skeleton/public/PublicPageIntroSkeleton";
import { PulseBlock } from "@/components/skeleton/PulseBlock";
import { pageContainer, section } from "@/styles/ui";
import { cn } from "@/lib/cn";

export function PublicArticleSkeleton() {
  return (
    <SkeletonRoot>
      <PublicPageIntroSection>
        <PublicPageIntroBlocks />
      </PublicPageIntroSection>
      <section className="pb-[var(--section-y)]">
        <div className={pageContainer}>
          <PulseBlock className="aspect-[21/9] w-full rounded-3xl" />
        </div>
      </section>
      <section className={section}>
        <div className={cn(pageContainer, "max-w-3xl space-y-3")}>
          {Array.from({ length: 8 }).map((_, i) => (
            <PulseBlock
              key={i}
              variant="muted"
              className={cn("h-4 w-full", i % 3 === 2 ? "w-2/3" : "")}
            />
          ))}
        </div>
      </section>
    </SkeletonRoot>
  );
}
