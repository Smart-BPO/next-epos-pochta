import { SkeletonRoot } from "@/components/skeleton/SkeletonRoot";
import {
  PublicPageIntroBlocks,
  PublicPageIntroSection,
} from "@/components/skeleton/public/PublicPageIntroSkeleton";
import { PulseBlock } from "@/components/skeleton/PulseBlock";
import { pageContainer, section } from "@/styles/ui";
import { cn } from "@/lib/cn";

export function PublicFormPageSkeleton() {
  return (
    <SkeletonRoot>
      <PublicPageIntroSection>
        <PublicPageIntroBlocks />
      </PublicPageIntroSection>
      <section className={section}>
        <div className={cn(pageContainer, "max-w-3xl space-y-4")}>
          <div className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="grid gap-1.5">
                <PulseBlock variant="muted" className="h-3 w-24" />
                <PulseBlock className="h-11 w-full rounded-xl" />
              </div>
            ))}
          </div>
          <PulseBlock className="h-24 w-full rounded-2xl" />
          <div className="flex flex-wrap gap-3">
            <PulseBlock className="h-11 w-36 rounded-xl" />
            <PulseBlock variant="muted" className="h-11 w-28 rounded-xl" />
          </div>
        </div>
      </section>
    </SkeletonRoot>
  );
}
