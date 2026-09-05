import Link from "next/link";
import type { AdminUser } from "@/lib/cms/auth";
import { canAccess } from "@/lib/cms/auth";
import { DASHBOARD_NAV } from "@/components/dashboard/nav";

export function DashboardChrome({
  admin,
  children,
}: {
  admin: AdminUser;
  children: React.ReactNode;
}) {
  const items = DASHBOARD_NAV.filter((item) => canAccess(admin.role, item.area));

  return (
    <div className="min-h-dvh bg-[#f6f6f7] text-ink">
      <div className="mx-auto flex min-h-dvh w-full max-w-7xl">
        <aside className="hidden w-56 shrink-0 border-r border-black/8 bg-white p-4 lg:block">
          <p className="m-0 font-display text-sm font-bold uppercase tracking-wide text-primary">
            EPOS CMS
          </p>
          <p className="m-0 mt-1 truncate text-xs text-black/45">{admin.email}</p>
          <nav className="mt-6 flex flex-col gap-1">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-black/70 hover:bg-black/[0.04] hover:text-black"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <form action="/api/dashboard/logout/" method="post" className="mt-8">
            <button
              type="submit"
              className="w-full rounded-lg border border-black/10 px-3 py-2 text-left text-sm text-black/55 hover:bg-black/[0.03]"
            >
              Выйти
            </button>
          </form>
        </aside>
        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-10 border-b border-black/8 bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
            <div className="flex items-center justify-between gap-3">
              <p className="m-0 font-display text-sm font-bold uppercase text-primary">
                EPOS CMS
              </p>
              <form action="/api/dashboard/logout/" method="post">
                <button type="submit" className="text-xs font-semibold text-black/50">
                  Выйти
                </button>
              </form>
            </div>
            <nav className="mt-2 flex gap-2 overflow-x-auto pb-1">
              {items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="shrink-0 rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-medium text-black/65"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </header>
          <main className="p-4 sm:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
