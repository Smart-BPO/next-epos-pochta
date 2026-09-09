/**
 * Telegram Bot API helpers (server-only).
 * Token stays in env — never expose to the browser.
 */

export type TelegramApiResult<T> =
  | { ok: true; result: T }
  | { ok: false; description: string; errorCode?: number };

export type TelegramWebhookInfo = {
  url: string;
  has_custom_certificate: boolean;
  pending_update_count: number;
  ip_address?: string;
  last_error_date?: number;
  last_error_message?: string;
  last_synchronization_error_date?: number;
  max_connections?: number;
  allowed_updates?: string[];
};

export type TelegramBotUser = {
  id: number;
  is_bot: boolean;
  first_name: string;
  username?: string;
  can_join_groups?: boolean;
  can_read_all_group_messages?: boolean;
  supports_inline_queries?: boolean;
  has_main_web_app?: boolean;
};

function botToken(): string {
  return (process.env.TELEGRAM_BOT_TOKEN ?? "").trim();
}

export function hasTelegramBotToken(): boolean {
  return Boolean(botToken());
}

export function getTelegramChatId(): string {
  return (process.env.TELEGRAM_CHAT_ID ?? "").trim();
}

export function getTelegramWebhookSecret(): string {
  return (process.env.TELEGRAM_WEBHOOK_SECRET ?? "").trim();
}

export function defaultTelegramWebhookUrl(siteOrigin: string): string {
  const base = siteOrigin.replace(/\/+$/, "");
  return `${base}/api/telegram/webhook/`;
}

/** Public Mini App URL (HTTPS). Override with TELEGRAM_WEBAPP_URL if needed. */
export function defaultTelegramWebAppUrl(siteOrigin?: string): string {
  const fromEnv = env("TELEGRAM_WEBAPP_URL");
  if (fromEnv) return fromEnv.replace(/\/?$/, "/");
  // Live production host (epos-pochta.uz).
  const base = (siteOrigin || "https://epos-pochta.uz").replace(/\/+$/, "");
  return `${base}/webapp/`;
}

function env(name: string): string {
  return (process.env[name] ?? "").trim();
}

async function callTelegramApi<T>(
  method: string,
  body?: Record<string, unknown>,
): Promise<TelegramApiResult<T>> {
  const token = botToken();
  if (!token) {
    return { ok: false, description: "TELEGRAM_BOT_TOKEN не задан" };
  }

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${token}/${method}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body ?? {}),
        cache: "no-store",
      },
    );
    const json = (await response.json()) as {
      ok?: boolean;
      result?: T;
      description?: string;
      error_code?: number;
    };
    if (!json.ok || json.result === undefined) {
      return {
        ok: false,
        description: json.description || `telegram_${response.status}`,
        errorCode: json.error_code,
      };
    }
    return { ok: true, result: json.result };
  } catch (error) {
    return {
      ok: false,
      description: error instanceof Error ? error.message : "telegram_network_error",
    };
  }
}

export function getMe() {
  return callTelegramApi<TelegramBotUser>("getMe");
}

export function getWebhookInfo() {
  return callTelegramApi<TelegramWebhookInfo>("getWebhookInfo");
}

export function setWebhook(params: {
  url: string;
  secretToken?: string;
  dropPendingUpdates?: boolean;
}) {
  const body: Record<string, unknown> = {
    url: params.url,
    allowed_updates: ["message", "callback_query"],
    drop_pending_updates: Boolean(params.dropPendingUpdates),
  };
  if (params.secretToken) {
    body.secret_token = params.secretToken;
  }
  return callTelegramApi<true>("setWebhook", body);
}

export function deleteWebhook(dropPendingUpdates = true) {
  return callTelegramApi<true>("deleteWebhook", {
    drop_pending_updates: dropPendingUpdates,
  });
}

export type TelegramInlineKeyboardButton = {
  text: string;
  callback_data?: string;
  web_app?: { url: string };
  url?: string;
};

export type TelegramInlineKeyboardMarkup = {
  inline_keyboard: TelegramInlineKeyboardButton[][];
};

export type TelegramMenuButton =
  | { type: "commands" }
  | { type: "default" }
  | { type: "web_app"; text: string; web_app: { url: string } };

export type TelegramReplyMarkup =
  | TelegramInlineKeyboardMarkup
  | {
      keyboard: Array<
        Array<{
          text: string;
          request_contact?: boolean;
          request_location?: boolean;
        }>
      >;
      resize_keyboard?: boolean;
      one_time_keyboard?: boolean;
      selective?: boolean;
    }
  | { remove_keyboard: true; selective?: boolean };

export function sendMessage(params: {
  chatId: string | number;
  text: string;
  disableWebPagePreview?: boolean;
  /** Telegram parse_mode, e.g. Markdown or HTML */
  parseMode?: "Markdown" | "MarkdownV2" | "HTML";
  replyMarkup?: TelegramReplyMarkup;
}) {
  const body: Record<string, unknown> = {
    chat_id: params.chatId,
    text: params.text.slice(0, 3900),
    disable_web_page_preview: params.disableWebPagePreview ?? true,
  };
  if (params.parseMode) body.parse_mode = params.parseMode;
  if (params.replyMarkup) {
    body.reply_markup = params.replyMarkup;
  }
  return callTelegramApi<{ message_id: number }>("sendMessage", body);
}

export function getChatMenuButton(chatId?: string | number) {
  const body: Record<string, unknown> = {};
  if (chatId != null && chatId !== "") body.chat_id = chatId;
  return callTelegramApi<TelegramMenuButton>("getChatMenuButton", body);
}

/** Default menu button for all private chats (omit chatId). */
export function setChatMenuButton(params: {
  menuButton: TelegramMenuButton;
  chatId?: string | number;
}) {
  const body: Record<string, unknown> = {
    menu_button: params.menuButton,
  };
  if (params.chatId != null && params.chatId !== "") {
    body.chat_id = params.chatId;
  }
  return callTelegramApi<true>("setChatMenuButton", body);
}

export function setWebAppMenuButton(params?: {
  url?: string;
  text?: string;
  siteOrigin?: string;
  chatId?: string | number;
}) {
  const url = params?.url || defaultTelegramWebAppUrl(params?.siteOrigin);
  const text = (params?.text || "EPOS").slice(0, 16);
  return setChatMenuButton({
    chatId: params?.chatId,
    menuButton: {
      type: "web_app",
      text,
      web_app: { url },
    },
  });
}

export function setMyCommands(
  commands: Array<{ command: string; description: string }>,
) {
  return callTelegramApi<true>("setMyCommands", { commands });
}

export function webAppInlineKeyboard(
  url: string,
  label = "EPOS Mini App",
): TelegramInlineKeyboardMarkup {
  return {
    inline_keyboard: [[{ text: label, web_app: { url } }]],
  };
}

export function answerCallbackQuery(params: {
  callbackQueryId: string;
  text?: string;
  showAlert?: boolean;
}) {
  return callTelegramApi<true>("answerCallbackQuery", {
    callback_query_id: params.callbackQueryId,
    text: params.text,
    show_alert: params.showAlert,
  });
}

export function editMessageText(params: {
  chatId: string | number;
  messageId: number;
  text: string;
  replyMarkup?: TelegramInlineKeyboardMarkup | null;
}) {
  const body: Record<string, unknown> = {
    chat_id: params.chatId,
    message_id: params.messageId,
    text: params.text.slice(0, 3900),
    disable_web_page_preview: true,
  };
  if (params.replyMarkup === null) {
    body.reply_markup = { inline_keyboard: [] };
  } else if (params.replyMarkup) {
    body.reply_markup = params.replyMarkup;
  }
  return callTelegramApi<{ message_id: number }>("editMessageText", body);
}

export function leadStatusInlineKeyboard(leadId: string): TelegramInlineKeyboardMarkup {
  return {
    inline_keyboard: [
      [
        { text: "В работу", callback_data: `lead:${leadId}:in_progress` },
        { text: "Готово", callback_data: `lead:${leadId}:done` },
        { text: "Спам", callback_data: `lead:${leadId}:spam` },
      ],
    ],
  };
}

type TelegramPhotoSize = {
  file_id: string;
  file_unique_id: string;
  width: number;
  height: number;
  file_size?: number;
};

type TelegramUserProfilePhotos = {
  total_count: number;
  photos: TelegramPhotoSize[][];
};

type TelegramFile = {
  file_id: string;
  file_unique_id: string;
  file_size?: number;
  file_path?: string;
};

export function getUserProfilePhotos(params: {
  userId: number;
  limit?: number;
}) {
  return callTelegramApi<TelegramUserProfilePhotos>("getUserProfilePhotos", {
    user_id: params.userId,
    limit: params.limit ?? 1,
  });
}

export function getFile(fileId: string) {
  return callTelegramApi<TelegramFile>("getFile", { file_id: fileId });
}

/**
 * Resolve a fetchable profile photo URL for a Telegram user (server-only).
 * Uses Bot API; URL embeds the bot token — never send to the browser.
 */
export async function resolveTelegramProfilePhotoUrl(
  telegramUserId: number,
): Promise<string | null> {
  const photos = await getUserProfilePhotos({
    userId: telegramUserId,
    limit: 1,
  });
  if (!photos.ok || photos.result.total_count < 1) return null;
  const sizes = photos.result.photos[0] ?? [];
  const best = sizes[sizes.length - 1];
  if (!best?.file_id) return null;
  const file = await getFile(best.file_id);
  if (!file.ok || !file.result.file_path) return null;
  const token = botToken();
  if (!token) return null;
  return `https://api.telegram.org/file/bot${token}/${file.result.file_path}`;
}
