export type DashboardNavItem = {
  href: string;
  label: string;
  area: "overview" | "leads" | "webapp" | "news" | "settings" | "delivery" | "users" | "media";
};

export const DASHBOARD_NAV: DashboardNavItem[] = [
  { href: "/dashboard/", label: "Обзор", area: "overview" },
  { href: "/dashboard/leads/", label: "Заявки", area: "leads" },
  { href: "/dashboard/webapp/contacts/", label: "WebApp контакты", area: "webapp" },
  { href: "/dashboard/webapp/shipments/", label: "WebApp отправления", area: "webapp" },
  { href: "/dashboard/news/", label: "Новости", area: "news" },
  { href: "/dashboard/delivery/", label: "Хабы доставки", area: "delivery" },
  { href: "/dashboard/settings/", label: "Настройки", area: "settings" },
  { href: "/dashboard/media/", label: "Медиа", area: "media" },
  { href: "/dashboard/users/", label: "Сотрудники", area: "users" },
];
