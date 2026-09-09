"use client";

import type { AdminUser } from "@/lib/cms/auth-shared";
import type { DashNotificationsSnapshot } from "@/lib/cms/notifications";
import { DashHeaderActions } from "@/components/dashboard/chrome/DashHeaderActions";
import { useDashT } from "@/components/dashboard/DashLocaleProvider";
import { dashTopBar } from "@/styles/dashboard";
import { cn } from "@/lib/cn";

export function DashTopBar({
  admin,
  notifications,
}: {
  admin: AdminUser;
  notifications: DashNotificationsSnapshot;
}) {
  const t = useDashT();

  return (
    <header className={dashTopBar}>
      <p
        className={cn(
          "m-0 min-w-0 flex-1 truncate font-display text-sm font-bold text-primary lg:invisible lg:pointer-events-none",
        )}
      >
        {t.brand}
      </p>
      <DashHeaderActions admin={admin} notifications={notifications} />
    </header>
  );
}
