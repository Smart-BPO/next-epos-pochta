export type DashboardNavArea =
  | "overview"
  | "leads"
  | "webapp"
  | "news"
  | "settings"
  | "delivery"
  | "users"
  | "media";

export type DashboardNavLabelKey =
  | "overview"
  | "leads"
  | "contacts"
  | "shipments"
  | "news"
  | "delivery"
  | "media"
  | "settings"
  | "telegram"
  | "messaging"
  | "users";

export type DashboardNavItem = {
  href: string;
  labelKey: DashboardNavLabelKey;
  /** Compact label key for mobile tab bar (optional override). */
  shortLabelKey?: "contactsShort" | "shipmentsShort" | "deliveryShort";
  area: DashboardNavArea;
  group: "ops" | "content" | "system";
};

export const NAV_GROUP_IDS = ["ops", "content", "system"] as const;

export const DASHBOARD_NAV: DashboardNavItem[] = [
  {
    href: "/dashboard/",
    labelKey: "overview",
    area: "overview",
    group: "ops",
  },
  {
    href: "/dashboard/leads/",
    labelKey: "leads",
    area: "leads",
    group: "ops",
  },
  {
    href: "/dashboard/webapp/contacts/",
    labelKey: "contacts",
    shortLabelKey: "contactsShort",
    area: "webapp",
    group: "ops",
  },
  {
    href: "/dashboard/webapp/shipments/",
    labelKey: "shipments",
    shortLabelKey: "shipmentsShort",
    area: "webapp",
    group: "ops",
  },
  {
    href: "/dashboard/news/",
    labelKey: "news",
    area: "news",
    group: "content",
  },
  {
    href: "/dashboard/delivery/",
    labelKey: "delivery",
    shortLabelKey: "deliveryShort",
    area: "delivery",
    group: "content",
  },
  {
    href: "/dashboard/media/",
    labelKey: "media",
    area: "media",
    group: "content",
  },
  {
    href: "/dashboard/settings/",
    labelKey: "settings",
    area: "settings",
    group: "system",
  },
  {
    href: "/dashboard/settings/telegram/",
    labelKey: "telegram",
    area: "settings",
    group: "system",
  },
  {
    href: "/dashboard/messaging/",
    labelKey: "messaging",
    area: "settings",
    group: "system",
  },
  {
    href: "/dashboard/users/",
    labelKey: "users",
    area: "users",
    group: "system",
  },
];
