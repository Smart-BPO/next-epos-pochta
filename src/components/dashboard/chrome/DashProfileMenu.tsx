"use client";

import Link from "next/link";
import { DashPopover } from "@/components/dashboard/ds/DashPopover";
import { DashStatusBadge } from "@/components/dashboard/DashStatusBadge";
import { useDashT } from "@/components/dashboard/DashLocaleProvider";
import { IconLogout } from "@/components/dashboard/icons";
import { logoutAction } from "@/app/dashboard/(auth)/logout/actions";
import type { AdminUser } from "@/lib/cms/auth-shared";

function initials(admin: AdminUser) {
  const raw = (admin.displayName || admin.email || "?").trim();
  const parts = raw.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
  }
  return raw.slice(0, 2).toUpperCase();
}

export function DashProfileMenu({
  open,
  onOpenChange,
  admin,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  admin: AdminUser;
}) {
  const t = useDashT();
  const name = admin.displayName || admin.email.split("@")[0] || "Admin";

  return (
    <DashPopover
      open={open}
      onOpenChange={onOpenChange}
      panelWidth="16rem"
      trigger={({ ref, onClick, ...a11y }) => (
        <button
          type="button"
          ref={ref as React.RefCallback<HTMLButtonElement>}
          onClick={onClick}
          {...a11y}
          className="inline-flex size-9 items-center justify-center rounded-full bg-primary text-xs font-bold text-white shadow-[0_2px_8px_rgb(211_2_3/0.25)] transition hover:bg-primary-hover"
          aria-label={t.chrome.profile}
        >
          {initials(admin)}
        </button>
      )}
    >
      <div className="border-b border-black/[0.06] px-3.5 py-3">
        <p className="m-0 flex flex-wrap items-center gap-1.5 text-sm font-semibold text-ink">
          <span className="truncate">{name}</span>
          <DashStatusBadge kind="role" value={admin.role} />
        </p>
        <p className="m-0 mt-0.5 truncate text-xs text-black/40">{admin.email}</p>
      </div>
      <div className="space-y-0.5 p-1.5">
        <Link
          href="/dashboard/profile/"
          onClick={() => onOpenChange(false)}
          className="flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium text-ink transition hover:bg-black/[0.03]"
        >
          {t.profile.openProfile}
        </Link>
        <form action={logoutAction}>
          <button
            type="submit"
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-black/55 transition hover:bg-black/[0.03] hover:text-ink"
          >
            <IconLogout className="size-4" />
            {t.logout}
          </button>
        </form>
      </div>
    </DashPopover>
  );
}
