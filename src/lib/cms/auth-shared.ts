export type AdminRole = "owner" | "editor" | "crm" | "viewer";

export type AdminUser = {
  id: string;
  email: string;
  role: AdminRole;
  displayName: string;
};

export type AdminPermissionArea =
  | "overview"
  | "leads"
  | "webapp"
  | "news"
  | "settings"
  | "media"
  | "delivery"
  | "users";

export type AdminMutation =
  | "leads"
  | "webapp"
  | "news"
  | "delivery"
  | "media"
  | "settings"
  | "telegram_webhook"
  | "messaging_secrets"
  | "users";

const CONTENT_AREAS: AdminPermissionArea[] = [
  "news",
  "delivery",
  "media",
  "settings",
];

const OPS_AREAS: AdminPermissionArea[] = ["overview", "leads", "webapp"];

/**
 * Roles:
 * - owner — всё + сотрудники + Telegram webhook
 * - editor — контент (новости, хабы, медиа, настройки сайта)
 * - crm — заявки и WebApp (операции)
 * - viewer — только чтение overview / заявки / WebApp
 */
export function canAccess(role: AdminRole, area: AdminPermissionArea): boolean {
  if (role === "owner") return true;
  if (role === "viewer") return OPS_AREAS.includes(area);
  if (role === "crm") return OPS_AREAS.includes(area);
  // editor
  return area === "overview" || CONTENT_AREAS.includes(area);
}

export function canMutate(role: AdminRole, action: AdminMutation): boolean {
  if (role === "viewer") return false;
  if (role === "owner") return true;
  if (role === "crm") return action === "leads" || action === "webapp";
  // editor — content only
  return (
    action === "news" ||
    action === "delivery" ||
    action === "media" ||
    action === "settings"
  );
}

export function isAdminRole(value: string): value is AdminRole {
  return (
    value === "owner" ||
    value === "editor" ||
    value === "crm" ||
    value === "viewer"
  );
}
