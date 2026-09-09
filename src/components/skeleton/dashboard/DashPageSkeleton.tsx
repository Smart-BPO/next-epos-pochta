import { DashAuthSkeleton } from "@/components/skeleton/dashboard/DashAuthSkeleton";
import { DashDetailSkeleton } from "@/components/skeleton/dashboard/DashDetailSkeleton";
import { DashEditorSkeleton } from "@/components/skeleton/dashboard/DashEditorSkeleton";
import { DashFormSkeleton } from "@/components/skeleton/dashboard/DashFormSkeleton";
import { DashListSkeleton } from "@/components/skeleton/dashboard/DashListSkeleton";
import { DashMessagingHubSkeleton } from "@/components/skeleton/dashboard/DashMessagingHubSkeleton";
import { DashOverviewSkeleton } from "@/components/skeleton/dashboard/DashOverviewSkeleton";

export type DashPageSkeletonVariant =
  | "list"
  | "overview"
  | "form"
  | "detail"
  | "editor"
  | "messaging"
  | "auth";

export function DashPageSkeleton({
  variant = "list",
  listVariant = "auto",
  formColumns = 1,
  formSections = 1,
  formMaxWidth = "full",
  formWithSubnav = false,
}: {
  variant?: DashPageSkeletonVariant;
  listVariant?: "auto" | "table" | "cards";
  formColumns?: 1 | 2;
  formSections?: number;
  formMaxWidth?: "full" | "xl" | "3xl";
  formWithSubnav?: boolean;
}) {
  switch (variant) {
    case "overview":
      return <DashOverviewSkeleton />;
    case "form":
      return (
        <DashFormSkeleton
          columns={formColumns}
          sections={formSections}
          maxWidth={formMaxWidth}
          withSubnav={formWithSubnav}
        />
      );
    case "detail":
      return <DashDetailSkeleton />;
    case "editor":
      return <DashEditorSkeleton />;
    case "messaging":
      return <DashMessagingHubSkeleton />;
    case "auth":
      return <DashAuthSkeleton />;
    default:
      return <DashListSkeleton variant={listVariant} />;
  }
}
