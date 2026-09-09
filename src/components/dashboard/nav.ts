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
  { href: "/dashboard/", label: "Обзор", area: "overview", group: "ops" },
  { href: "/dashboard/leads/", label: "Заявки", area: "leads", group: "ops" },
  {
    href: "/dashboard/webapp/contacts/",
    label: "WebApp контакты",
    area: "webapp",
    group: "ops",
  },
  {
    href: "/dashboard/webapp/shipments/",
    label: "WebApp отправления",
    area: "webapp",
    group: "ops",
  },
  { href: "/dashboard/news/", label: "Новости", area: "news", group: "content" },
  {
    href: "/dashboard/delivery/",
    label: "Хабы доставки",
    area: "delivery",
    group: "content",
  },
  { href: "/dashboard/media/", label: "Медиа", area: "media", group: "content" },
  {
    href: "/dashboard/settings/",
    label: "Настройки",
    area: "settings",
    group: "system",
  },
  {
    href: "/dashboard/settings/telegram/",
    label: "Telegram",
    area: "settings",
    group: "system",
  },
  {
    href: "/dashboard/users/",
    label: "Сотрудники",
    area: "users",
    group: "system",
  },
];
