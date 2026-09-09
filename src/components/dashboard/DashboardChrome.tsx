import type { AdminUser } from "@/lib/cms/auth";
import { canAccess } from "@/lib/cms/auth";
import { DASHBOARD_NAV } from "@/components/dashboard/nav";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { DashboardToaster } from "@/components/dashboard/DashboardToaster";
import { DashStatusBadge } from "@/components/dashboard/DashStatusBadge";
import {
  DashMobileNav,
  DashMobileTopBar,
} from "@/components/dashboard/mobile/DashMobileNav";
import { IconLogout } from "@/components/dashboard/icons";
import { logoutAction } from "@/app/dashboard/(auth)/logout/actions";
import {
  dashAside,
  dashMainMobilePad,
  dashShell,
} from "@/styles/dashboard";
import { cn } from "@/lib/cn";

function initials(admin: AdminUser) {
  const raw = (admin.displayName || admin.email || "?").trim();
  const parts = raw.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
  }
  return raw.slice(0, 2).toUpperCase();
}

export function DashboardChrome({
  admin,
  children,
}: {
  admin: AdminUser;
  children: React.ReactNode;
}) {
  const items = DASHBOARD_NAV.filter((item) => canAccess(admin.role, item.area));
  const name = admin.displayName || admin.email.split("@")[0] || "Admin";

  return (
    <div className={dashShell}>
      <DashboardToaster />
      <div className="flex min-h-dvh w-full">
        <aside className={dashAside}>
          <div className="px-5 pt-5 pb-3">
            <p className="m-0 font-display text-[0.95rem] font-bold tracking-[-0.02em] text-primary">
              EPOS CMS
            </p>
            <p className="m-0 mt-0.5 truncate text-xs text-black/40">{admin.email}</p>
          </div>

          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto py-2">
            <DashboardNav items={items} />
          </div>

          <div className="mt-auto border-t border-black/[0.06] p-3">
            <form action={logoutAction} className="mb-2">
              <button
                type="submit"
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-black/50 transition hover:bg-black/[0.03] hover:text-black"
              >
                <IconLogout />
                Выйти
              </button>
            </form>
            <div className="flex items-center gap-2.5 rounded-xl bg-[#f7f8fa] px-2.5 py-2">
              <span className="grid size-9 place-items-center rounded-full bg-primary text-xs font-bold text-white">
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
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <DashMobileTopBar admin={admin} />
          <main className={cn("p-4 sm:p-5 lg:p-6", dashMainMobilePad)}>
            {children}
          </main>
          <DashMobileNav admin={admin} items={items} />
        </div>
      </div>
    </div>
  );
}
