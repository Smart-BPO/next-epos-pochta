"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { requireMutation } from "@/lib/cms/auth";
import {
  defaultTelegramWebhookUrl,
  defaultTelegramWebAppUrl,
  deleteWebhook,
  getChatMenuButton,
  getMe,
  getTelegramChatId,
  getTelegramWebhookSecret,
  getWebhookInfo,
  hasTelegramBotToken,
  sendMessage,
  setWebAppMenuButton,
  setWebhook,
} from "@/lib/telegram/bot";
import { getCanonicalSiteUrl } from "@/utils/seo/indexing";

export type TelegramActionState = {
  ok?: boolean;
  error?: string;
  message?: string;
};

async function requireTelegramAdmin(opts?: { ownerOnly?: boolean }) {
  if (opts?.ownerOnly) {
    return requireMutation("telegram_webhook");
  }
  return requireMutation("settings");
}

async function resolveSiteOrigin(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") || h.get("host");
  const proto = h.get("x-forwarded-proto") || "https";
  if (host && !host.includes("localhost") && !host.startsWith("127.")) {
    return `${proto}://${host}`;
  }
  return getCanonicalSiteUrl();
}

function revalidateTelegramSettings() {
  revalidatePath("/dashboard/settings/telegram/");
  revalidatePath("/dashboard/settings/");
}

export async function setTelegramWebhookAction(
  _prev: TelegramActionState | null,
  formData: FormData,
): Promise<TelegramActionState> {
  try {
    await requireTelegramAdmin({ ownerOnly: true });
  } catch {
    return { ok: false, error: "Подключение меняет только владелец" };
  }
  if (!hasTelegramBotToken()) {
    return { ok: false, error: "На сервере не задан токен бота" };
  }

  const customUrl = String(formData.get("webhook_url") ?? "").trim();
  const dropPending = formData.get("drop_pending") === "on";
  const origin = await resolveSiteOrigin();
  const url = customUrl || defaultTelegramWebhookUrl(origin);
  const secret = getTelegramWebhookSecret();

  const result = await setWebhook({
    url,
    secretToken: secret || undefined,
    dropPendingUpdates: dropPending,
  });

  revalidateTelegramSettings();
  if (!result.ok) {
    return { ok: false, error: result.description };
  }
  return {
    ok: true,
    message: secret
      ? `Подключено: ${url}`
      : `Подключено: ${url}. Задайте секрет подключения на сервере.`,
  };
}

export async function deleteTelegramWebhookAction(
  _prev: TelegramActionState | null,
  _formData: FormData,
): Promise<TelegramActionState> {
  try {
    await requireTelegramAdmin({ ownerOnly: true });
  } catch {
    return { ok: false, error: "Отключение меняет только владелец" };
  }
  if (!hasTelegramBotToken()) {
    return { ok: false, error: "На сервере не задан токен бота" };
  }

  const result = await deleteWebhook(true);
  revalidateTelegramSettings();
  if (!result.ok) {
    return { ok: false, error: result.description };
  }
  return { ok: true, message: "Отключено" };
}

export async function refreshTelegramWebhookAction(
  _prev: TelegramActionState | null,
  _formData: FormData,
): Promise<TelegramActionState> {
  await requireTelegramAdmin();
  revalidateTelegramSettings();
  const info = await getWebhookInfo();
  if (!info.ok) {
    return { ok: false, error: info.description };
  }
  return {
    ok: true,
    message: info.result.url
      ? `Активен: ${info.result.url}`
      : "Не подключено",
  };
}

export async function sendTelegramTestAction(
  _prev: TelegramActionState | null,
  _formData: FormData,
): Promise<TelegramActionState> {
  await requireTelegramAdmin();
  if (!hasTelegramBotToken()) {
    return { ok: false, error: "На сервере не задан токен бота" };
  }
  const chatId = getTelegramChatId();
  if (!chatId) {
    return {
      ok: false,
      error: "Чат для уведомлений не задан. Напишите боту /id и укажите номер чата на сервере.",
    };
  }

  const me = await getMe();
  const botName = me.ok ? me.result.username || me.result.first_name : "bot";
  const result = await sendMessage({
    chatId,
    text: `EPOS: проверка из панели (@${botName})\n${new Date().toISOString()}`,
  });
  if (!result.ok) {
    return { ok: false, error: result.description };
  }
  return { ok: true, message: `Тест отправлен в чат ${chatId}` };
}

export async function setTelegramWebAppMenuAction(
  _prev: TelegramActionState | null,
  formData: FormData,
): Promise<TelegramActionState> {
  try {
    await requireTelegramAdmin({ ownerOnly: true });
  } catch {
    return { ok: false, error: "Кнопку меняет только владелец" };
  }
  if (!hasTelegramBotToken()) {
    return { ok: false, error: "На сервере не задан токен бота" };
  }

  const origin = await resolveSiteOrigin();
  const customUrl = String(formData.get("webapp_url") ?? "").trim();
  const text = String(formData.get("button_text") ?? "EPOS").trim() || "EPOS";
  const url = customUrl || defaultTelegramWebAppUrl(origin);

  const result = await setWebAppMenuButton({ url, text });
  revalidateTelegramSettings();
  if (!result.ok) {
    return { ok: false, error: result.description };
  }

  const check = await getChatMenuButton();
  const checkLabel = check.ok
    ? check.result.type === "web_app"
      ? `web_app → ${check.result.web_app.url}`
      : check.result.type
    : check.description;

  return {
    ok: true,
    message: `Кнопка «${text.slice(0, 16)}» → ${url}. Статус: ${checkLabel}. Если не видно — в @BotFather укажите домен epos-pochta.uz`,
  };
}
