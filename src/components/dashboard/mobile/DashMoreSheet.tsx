"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { AdminUser } from "@/lib/cms/auth-shared";
import {
  NAV_GROUP_IDS,
  type DashboardNavItem,
} from "@/components/dashboard/nav";
import { resolveNavLabel } from "@/components/dashboard/DashboardNav";
import { useDashT } from "@/components/dashboard/DashLocaleProvider";
import { DashBottomSheet } from "@/components/dashboard/mobile/DashBottomSheet";
import { DashNavIcon } from "@/components/dashboard/mobile/DashNavIcon";
import { DashStatusBadge } from "@/components/dashboard/DashStatusBadge";
import { IconLogout } from "@/components/dashboard/icons";
import { logoutAction } from "@/app/dashboard/(auth)/logout/actions";
import { cn } from "@/lib/cn";

function isActive(pathname: string, href: string) {
  const path = pathname.endsWith("/") ? pathname : `${pathname}/`;
  if (href === "/dashboard/") return path === "/dashboard/";
  if (href === "/dashboard/settings/") {
    return path === "/dashboard/settings/" || path === "/dashboard/settings";
  }
  return path === href || path.startsWith(href);
}

function initials(admin: AdminUser) {
  const raw = (admin.displayName || admin.email || "?").trim();
  const parts = raw.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
  }
  return raw.slice(0, 2).toUpperCase();
}

export function DashMoreSheet({
  open,
  onOpenChange,
  rest,
  admin,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rest: DashboardNavItem[];
  admin: AdminUser;
}) {
  const pathname = usePathname() || "/dashboard/";
  const t = useDashT();
  const name = admin.displayName || admin.email.split("@")[0] || "Admin";

  return (
    <DashBottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title={t.common.moreMenu}
    >
      <div className="space-y-5">
        {NAV_GROUP_IDS.map((groupId) => {
          const groupItems = rest.filter((item) => item.group === groupId);
          if (groupItems.length === 0) return null;
          return (
            <div key={groupId}>
              <p className="m-0 mb-1.5 px-2 text-[0.65rem] font-semibold uppercase tracking-wide text-black/30">
                {t.nav.groups[groupId]}
              </p>
              <ul className="m-0 grid list-none gap-0.5 p-0">
                {groupItems.map((item) => {
                  const active = isActive(pathname, item.href);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => onOpenChange(false)}
                        className={cn(
                          "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors",
                          active
                            ? "bg-primary-soft text-primary"
                            : "text-black/65 hover:bg-black/[0.03]",
                        )}
                      >
                        <span
                          className={cn(
                            active ? "text-primary" : "text-black/35",
                          )}
                        >
                          <DashNavIcon href={item.href} className="size-5" />
                        </span>
                        {resolveNavLabel(item, t.nav)}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}

        <div className="border-t border-black/[0.06] pt-4">
          <div className="mb-3 flex items-center gap-2.5 rounded-xl bg-[#f7f8fa] px-3 py-2.5">
            <span className="grid size-10 place-items-center rounded-full bg-primary text-xs font-bold text-white">
              {initials(admin)}
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex flex-wrap items-center gap-1.5">
                <span className="block truncate text-sm font-semibold text-ink">
                  {name}
                </span>
                <DashStatusBadge kind="role" value={admin.role} />
              </span>
              <span className="block truncate text-[0.7rem] text-black/40">
                {admin.email}
              </span>
            </span>
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-3 text-sm font-medium text-black/55 transition hover:bg-black/[0.03] hover:text-black"
            >
              <IconLogout className="size-5" />
              {t.logout}
            </button>
          </form>
        </div>
      </div>
    </DashBottomSheet>
  );
}
