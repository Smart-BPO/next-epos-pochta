"use client";

import { cn } from "@/lib/cn";
import {
  IconLeads,
  IconMap,
  IconMedia,
  IconNews,
  IconOverview,
  IconPackage,
  IconSettings,
  IconStaff,
  IconTelegram,
  IconUsers,
} from "@/components/dashboard/icons";

export function DashNavIcon({
  href,
  className,
}: {
  href: string;
  className?: string;
}) {
  const props = { className: cn("size-[1.125rem] shrink-0", className) };
  if (href === "/dashboard/") return <IconOverview {...props} />;
  if (href.startsWith("/dashboard/leads")) return <IconLeads {...props} />;
  if (href.includes("/webapp/contacts")) return <IconUsers {...props} />;
  if (href.includes("/webapp/shipments")) return <IconPackage {...props} />;
  if (href.startsWith("/dashboard/news")) return <IconNews {...props} />;
  if (href.startsWith("/dashboard/delivery")) return <IconMap {...props} />;
  if (href.includes("/telegram")) return <IconTelegram {...props} />;
  if (href.startsWith("/dashboard/settings")) return <IconSettings {...props} />;
  if (href.startsWith("/dashboard/media")) return <IconMedia {...props} />;
  if (href.startsWith("/dashboard/users")) return <IconStaff {...props} />;
  return <IconOverview {...props} />;
}
