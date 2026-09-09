import type { ReactNode } from "react";
import { SkeletonRoot } from "@/components/skeleton/SkeletonRoot";
import { PulseBlock } from "@/components/skeleton/PulseBlock";
import { pageContainer, pageIntro } from "@/styles/ui";
import { cn } from "@/lib/cn";

export function PublicPageIntroBlocks() {
  return (
    <>
      <PulseBlock className="h-10 w-[min(100%,28rem)] max-w-full" />
      <PulseBlock
        variant="muted"
        className="h-5 w-[min(100%,36rem)] max-w-xl"
      />
    </>
  );
}

export function PublicPageIntroSection({ children }: { children: ReactNode }) {
  return (
    <section className={pageIntro}>
      <div className={cn(pageContainer, "space-y-4")}>{children}</div>
    </section>
  );
}

export function PublicPageIntroSkeleton() {
  return (
    <PublicPageIntroSection>
      <SkeletonRoot className="space-y-4">
        <PublicPageIntroBlocks />
      </SkeletonRoot>
    </PublicPageIntroSection>
  );
}
