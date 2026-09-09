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
  callback_data: string;
};

export type TelegramInlineKeyboardMarkup = {
  inline_keyboard: TelegramInlineKeyboardButton[][];
};

export function sendMessage(params: {
  chatId: string | number;
  text: string;
  disableWebPagePreview?: boolean;
  replyMarkup?: TelegramInlineKeyboardMarkup;
}) {
  const body: Record<string, unknown> = {
    chat_id: params.chatId,
    text: params.text.slice(0, 3900),
    disable_web_page_preview: params.disableWebPagePreview ?? true,
  };
  if (params.replyMarkup) {
    body.reply_markup = params.replyMarkup;
  }
  return callTelegramApi<{ message_id: number }>("sendMessage", body);
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
