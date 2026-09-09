import type { AdminRole } from "@/lib/cms/auth-shared";
import type { DashboardNavItem } from "@/components/dashboard/nav";

function byHref(items: DashboardNavItem[], href: string) {
  return items.find((item) => item.href === href);
}

/**
 * Role-based primary mobile tabs (max 3) + remaining items for the More sheet.
 */
export function pickPrimaryTabs(
  role: AdminRole,
  items: DashboardNavItem[],
): { primary: DashboardNavItem[]; rest: DashboardNavItem[] } {
  const preferredHrefs: string[] =
    role === "editor"
      ? ["/dashboard/", "/dashboard/news/", "/dashboard/delivery/"]
      : role === "crm" || role === "viewer"
        ? [
            "/dashboard/",
            "/dashboard/leads/",
            "/dashboard/webapp/shipments/",
          ]
        : ["/dashboard/", "/dashboard/leads/", "/dashboard/news/"];

  const primary: DashboardNavItem[] = [];
  const used = new Set<string>();

  for (const href of preferredHrefs) {
    const item = byHref(items, href);
    if (!item) continue;
    primary.push(item);
    used.add(item.href);
    if (primary.length >= 3) break;
  }

  // Fill gaps if role filter removed some preferred slots.
  if (primary.length < 3) {
    for (const item of items) {
      if (used.has(item.href)) continue;
      primary.push(item);
      used.add(item.href);
      if (primary.length >= 3) break;
    }
  }

  const rest = items.filter((item) => !used.has(item.href));
  return { primary, rest };
}
