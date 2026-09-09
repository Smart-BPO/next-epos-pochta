export type DashboardNavArea =
  | "overview"
  | "leads"
  | "webapp"
  | "news"
  | "settings"
  | "delivery"
  | "users"
  | "media";

export type DashboardNavItem = {
  href: string;
  label: string;
  /** Compact label for mobile tab bar. */
  shortLabel: string;
  area: DashboardNavArea;
  group: "ops" | "content" | "system";
};

export const NAV_GROUPS: Array<{
  id: DashboardNavItem["group"];
  label: string;
}> = [
  { id: "ops", label: "Операции" },
  { id: "content", label: "Контент" },
  { id: "system", label: "Система" },
];

export const DASHBOARD_NAV: DashboardNavItem[] = [
  {
    href: "/dashboard/",
    label: "Обзор",
    shortLabel: "Обзор",
    area: "overview",
    group: "ops",
  },
  {
    href: "/dashboard/leads/",
    label: "Заявки",
    shortLabel: "Заявки",
    area: "leads",
    group: "ops",
  },
  {
    href: "/dashboard/webapp/contacts/",
    label: "WebApp контакты",
    shortLabel: "Контакты",
    area: "webapp",
    group: "ops",
  },
  {
    href: "/dashboard/webapp/shipments/",
    label: "WebApp отправления",
    shortLabel: "Отправления",
    area: "webapp",
    group: "ops",
  },
  {
    href: "/dashboard/news/",
    label: "Новости",
    shortLabel: "Новости",
    area: "news",
    group: "content",
  },
  {
    href: "/dashboard/delivery/",
    label: "Хабы доставки",
    shortLabel: "Хабы",
    area: "delivery",
    group: "content",
  },
  {
    href: "/dashboard/media/",
    label: "Медиа",
    shortLabel: "Медиа",
    area: "media",
    group: "content",
  },
  {
    href: "/dashboard/settings/",
    label: "Настройки",
    shortLabel: "Настройки",
    area: "settings",
    group: "system",
  },
  {
    href: "/dashboard/settings/telegram/",
    label: "Telegram",
    shortLabel: "Telegram",
    area: "settings",
    group: "system",
  },
  {
    href: "/dashboard/users/",
    label: "Сотрудники",
    shortLabel: "Сотрудники",
    area: "users",
    group: "system",
  },
];
