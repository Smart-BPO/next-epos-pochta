"use client";

import { useState } from "react";
import type { AdminUser } from "@/lib/cms/auth-shared";
import type { DashNotificationsSnapshot } from "@/lib/cms/notifications";
import { DashLocaleMenu } from "@/components/dashboard/chrome/DashLocaleMenu";
import { DashNotificationsMenu } from "@/components/dashboard/chrome/DashNotificationsMenu";
import { DashProfileMenu } from "@/components/dashboard/chrome/DashProfileMenu";

type MenuId = "locale" | "notifications" | "profile" | null;

export function DashHeaderActions({
  admin,
  notifications,
}: {
  admin: AdminUser;
  notifications: DashNotificationsSnapshot;
}) {
  const [open, setOpen] = useState<MenuId>(null);

  const bind = (id: Exclude<MenuId, null>) => ({
    open: open === id,
    onOpenChange: (next: boolean) => setOpen(next ? id : null),
  });

  return (
    <div className="flex items-center gap-1.5 sm:gap-2">
      <DashLocaleMenu {...bind("locale")} />
      <DashNotificationsMenu
        {...bind("notifications")}
        notifications={notifications}
      />
      <DashProfileMenu {...bind("profile")} admin={admin} />
    </div>
  );
}
