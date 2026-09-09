import { NextResponse } from "next/server";
import {
  answerCallbackQuery,
  editMessageText,
  getTelegramChatId,
  getTelegramWebhookSecret,
  hasTelegramBotToken,
  leadStatusInlineKeyboard,
  sendMessage,
} from "@/lib/telegram/bot";
import { getCanonicalSiteUrl } from "@/utils/seo/indexing";
import { safeEqual } from "@/lib/security/secrets";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { hasSupabaseAdminConfig } from "@/lib/supabase/env";

export const runtime = "nodejs";

const LEAD_STATUSES = ["new", "in_progress", "done", "spam"] as const;

type TelegramUpdate = {
  update_id?: number;
  message?: {
    message_id: number;
    text?: string;
    chat: { id: number; type: string };
    from?: { id: number; username?: string; first_name?: string };
  };
  callback_query?: {
    id: string;
    data?: string;
    from?: { id: number };
    message?: {
      message_id: number;
      chat: { id: number };
      text?: string;
    };
  };
};

function unauthorized() {
  return NextResponse.json({ ok: false }, { status: 401 });
}

function isAllowedNotifyChat(chatId: number | string): boolean {
  const allowed = getTelegramChatId();
  if (!allowed) return false;
  return String(chatId) === String(allowed);
}

const STATUS_LABEL: Record<string, string> = {
  new: "Новая",
  in_progress: "В работе",
  done: "Готово",
  spam: "Спам",
};

async function handleLeadCallback(query: NonNullable<TelegramUpdate["callback_query"]>) {
  const chatId = query.message?.chat.id;
  const messageId = query.message?.message_id;
  const data = query.data ?? "";

  if (chatId == null || !isAllowedNotifyChat(chatId)) {
    await answerCallbackQuery({
      callbackQueryId: query.id,
      text: "Чат не авторизован",
      showAlert: true,
    });
    return;
  }

  const match = /^lead:([^:]+):(new|in_progress|done|spam)$/.exec(data);
  if (!match) {
    await answerCallbackQuery({
      callbackQueryId: query.id,
      text: "Неизвестная кнопка",
    });
    return;
  }

  const [, leadId, status] = match;
  if (!leadId || !(LEAD_STATUSES as readonly string[]).includes(status)) {
    await answerCallbackQuery({
      callbackQueryId: query.id,
      text: "Некорректные данные",
    });
    return;
  }

  if (!hasSupabaseAdminConfig()) {
    await answerCallbackQuery({
      callbackQueryId: query.id,
      text: "CMS недоступна",
      showAlert: true,
    });
    return;
  }

  const admin = createSupabaseAdminClient();
  const { data: lead, error } = await admin
    .from("epos_leads")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", leadId)
    .select("id, type, status")
    .maybeSingle();

  if (error || !lead) {
    await answerCallbackQuery({
      callbackQueryId: query.id,
      text: "Заявка не найдена",
      showAlert: true,
    });
    return;
  }

  const label = STATUS_LABEL[status] ?? status;
  await answerCallbackQuery({
    callbackQueryId: query.id,
    text: `Статус: ${label}`,
  });

  if (messageId != null) {
    const baseText = (query.message?.text ?? `EPOS lead ${leadId}`).replace(
      /\n\n— Статус:[\s\S]*$/,
      "",
    );
    const nextText = `${baseText}\n\n— Статус: ${label}`;
    await editMessageText({
      chatId,
      messageId,
      text: nextText,
      replyMarkup: status === "done" || status === "spam"
        ? null
        : leadStatusInlineKeyboard(leadId),
    });
  }
}

/**
 * Telegram Bot webhook receiver.
 * Register via Dashboard → Settings → Telegram.
 */
export async function POST(request: Request) {
  if (!hasTelegramBotToken()) {
    return NextResponse.json({ ok: false, error: "bot_not_configured" }, { status: 503 });
  }

  const expectedSecret = getTelegramWebhookSecret();
  if (expectedSecret) {
    const provided = request.headers.get("x-telegram-bot-api-secret-token") ?? "";
    if (!safeEqual(provided, expectedSecret)) {
      return unauthorized();
    }
  }

  let update: TelegramUpdate;
  try {
    update = (await request.json()) as TelegramUpdate;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  if (update.callback_query) {
    try {
      await handleLeadCallback(update.callback_query);
    } catch {
      // still ack Telegram
    }
    return NextResponse.json({ ok: true });
  }

  const text = update.message?.text?.trim() ?? "";
  const chatId = update.message?.chat.id;

  if (chatId != null && text) {
    const lower = text.toLowerCase();
    if (lower === "/start" || lower.startsWith("/start ")) {
      const site = getCanonicalSiteUrl();
      const webapp = `${site}/webapp/`;
      await sendMessage({
        chatId,
        text: [
          "EPOS POCHTA bot.",
          "",
          `Mini-app: ${webapp}`,
          `Сайт: ${site}`,
          "",
          "Заявки с сайта приходят в чат уведомлений (TELEGRAM_CHAT_ID).",
          "Кнопки под заявкой меняют статус в CMS.",
        ].join("\n"),
      });
    } else if (lower === "/id" || lower === "/chatid") {
      await sendMessage({
        chatId,
        text: `chat_id: ${chatId}`,
      });
    } else if (lower === "/ping") {
      await sendMessage({ chatId, text: "pong" });
    }
  }

  return NextResponse.json({ ok: true });
}

/** Health / probe — no secrets. */
export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "telegram-webhook",
    configured: hasTelegramBotToken(),
    notifyChatConfigured: Boolean(getTelegramChatId()),
  });
}
