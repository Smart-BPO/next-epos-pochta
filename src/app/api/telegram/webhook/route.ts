import { NextResponse } from "next/server";
import {
  answerCallbackQuery,
  defaultTelegramWebAppUrl,
  editMessageText,
  getTelegramChatId,
  getTelegramWebhookSecret,
  hasTelegramBotToken,
  leadStatusInlineKeyboard,
  sendMessage,
  webAppInlineKeyboard,
} from "@/lib/telegram/bot";
import {
  botOnboardingCopy,
  clearOnboardingSession,
  getOnboardingSession,
  languageKeyboard,
  normalizeBotPhone,
  setOnboardingLocale,
  shareContactKeyboard,
  type BotLocale,
} from "@/lib/telegram/onboarding";
import { safeEqual } from "@/lib/security/secrets";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { hasSupabaseAdminConfig } from "@/lib/supabase/env";
import { upsertWebAppContact } from "@/lib/webapp/contact";

export const runtime = "nodejs";

const LEAD_STATUSES = ["draft", "new", "in_progress", "done", "spam"] as const;

type TelegramUpdate = {
  update_id?: number;
  message?: {
    message_id: number;
    text?: string;
    chat: { id: number; type: string };
    from?: {
      id: number;
      username?: string;
      first_name?: string;
      last_name?: string;
      language_code?: string;
    };
    contact?: {
      phone_number: string;
      first_name?: string;
      last_name?: string;
      user_id?: number;
    };
  };
  callback_query?: {
    id: string;
    data?: string;
    from?: { id: number; username?: string; first_name?: string };
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

function webAppUrl(locale: BotLocale) {
  const base = defaultTelegramWebAppUrl("https://epos-pochta.uz").replace(
    /\/?$/,
    "/",
  );
  return `${base}?lang=${locale}`;
}

const STATUS_LABEL: Record<string, string> = {
  new: "Новая",
  in_progress: "В работе",
  done: "Готово",
  spam: "Спам",
};

async function persistBotContact(params: {
  phone: string;
  firstName: string;
  lastName: string;
  locale: BotLocale;
  telegramUserId: number;
  telegramUsername: string | null;
  /** True when onboarding Map missed locale (serverless); keep DB locale on update. */
  preserveExistingLocale: boolean;
}) {
  const result = await upsertWebAppContact({
    telegramUserId: params.telegramUserId,
    phone: params.phone,
    firstName: params.firstName,
    lastName: params.lastName,
    locale: params.locale,
    source: "telegram_contact",
    telegramUsername: params.telegramUsername,
    initDataOk: false,
    preserveExistingLocale: params.preserveExistingLocale,
  });
  return result.sessionId;
}

async function handleLeadCallback(
  query: NonNullable<TelegramUpdate["callback_query"]>,
) {
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
      replyMarkup:
        status === "done" || status === "spam"
          ? null
          : leadStatusInlineKeyboard(leadId),
    });
  }
}

async function handleOnboardLangCallback(
  query: NonNullable<TelegramUpdate["callback_query"]>,
) {
  const chatId = query.message?.chat.id;
  const data = query.data ?? "";
  const match = /^onboard:lang:(uz|ru)$/.exec(data);
  if (chatId == null || !match) {
    await answerCallbackQuery({
      callbackQueryId: query.id,
      text: "OK",
    });
    return;
  }

  const locale = match[1] as BotLocale;
  setOnboardingLocale(chatId, locale);
  const copy = botOnboardingCopy[locale];

  await answerCallbackQuery({
    callbackQueryId: query.id,
    text: locale === "uz" ? "Oʻzbekcha" : "Русский",
  });

  if (query.message?.message_id != null) {
    await editMessageText({
      chatId,
      messageId: query.message.message_id,
      text: copy.langPicked,
      replyMarkup: null,
    });
  }

  await sendMessage({
    chatId,
    text: copy.shareContactBtn + " 👇",
    replyMarkup: shareContactKeyboard(locale),
  });
}

async function startOnboarding(chatId: number) {
  clearOnboardingSession(chatId);
  // Bilingual intro (same body in both copy blocks by design)
  await sendMessage({
    chatId,
    text: botOnboardingCopy.uz.welcome.replace(/\*/g, ""),
    replyMarkup: languageKeyboard(),
  });
}

async function handleContactMessage(
  message: NonNullable<TelegramUpdate["message"]>,
) {
  const chatId = message.chat.id;
  const contact = message.contact;
  if (!contact?.phone_number) return;

  // Only accept contact that belongs to the user (not a forwarded stranger)
  if (
    contact.user_id != null &&
    message.from?.id != null &&
    contact.user_id !== message.from.id
  ) {
    const session = getOnboardingSession(chatId);
    const locale = session?.locale ?? "uz";
    await sendMessage({
      chatId,
      text: botOnboardingCopy[locale].needShare,
      replyMarkup: shareContactKeyboard(locale),
    });
    return;
  }

  const session = getOnboardingSession(chatId);
  const hadOnboardingLocale = Boolean(session?.locale);
  const locale = session?.locale ?? "uz";
  const copy = botOnboardingCopy[locale];
  const phone = normalizeBotPhone(contact.phone_number);
  if (!phone) {
    await sendMessage({
      chatId,
      text: copy.needShare,
      replyMarkup: shareContactKeyboard(locale),
    });
    return;
  }

  const telegramUserId = message.from?.id ?? contact.user_id ?? null;
  if (telegramUserId == null) {
    await sendMessage({
      chatId,
      text: copy.needShare,
      replyMarkup: shareContactKeyboard(locale),
    });
    return;
  }

  const firstName =
    contact.first_name || message.from?.first_name || "Telegram";
  const lastName = contact.last_name || message.from?.last_name || "";

  try {
    await persistBotContact({
      phone,
      firstName,
      lastName,
      locale,
      telegramUserId,
      telegramUsername: message.from?.username ?? null,
      preserveExistingLocale: !hadOnboardingLocale,
    });
  } catch {
    await sendMessage({
      chatId,
      text:
        locale === "ru"
          ? "Не удалось сохранить контакт. Попробуйте /start ещё раз."
          : "Kontaktni saqlab boʻlmadi. /start ni qayta bosing.",
      replyMarkup: { remove_keyboard: true },
    });
    return;
  }

  const appUrl = webAppUrl(locale);
  await sendMessage({
    chatId,
    text: copy.contactThanks(firstName, phone),
    replyMarkup: { remove_keyboard: true },
  });
  await sendMessage({
    chatId,
    text: locale === "ru" ? "Mini App →" : "Mini App →",
    replyMarkup: webAppInlineKeyboard(appUrl, copy.openApp),
  });
}

/**
 * Telegram Bot webhook receiver.
 * Register via Dashboard → Settings → Telegram.
 */
export async function POST(request: Request) {
  if (!hasTelegramBotToken()) {
    return NextResponse.json(
      { ok: false, error: "bot_not_configured" },
      { status: 503 },
    );
  }

  const expectedSecret = getTelegramWebhookSecret();
  if (expectedSecret) {
    const provided =
      request.headers.get("x-telegram-bot-api-secret-token") ?? "";
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
      const data = update.callback_query.data ?? "";
      if (data.startsWith("onboard:lang:")) {
        await handleOnboardLangCallback(update.callback_query);
      } else if (data.startsWith("lead:")) {
        await handleLeadCallback(update.callback_query);
      } else {
        await answerCallbackQuery({
          callbackQueryId: update.callback_query.id,
        });
      }
    } catch {
      // still ack Telegram
    }
    return NextResponse.json({ ok: true });
  }

  const message = update.message;
  const chatId = message?.chat.id;

  if (chatId != null && message?.contact) {
    try {
      await handleContactMessage(message);
    } catch {
      // ack
    }
    return NextResponse.json({ ok: true });
  }

  const text = message?.text?.trim() ?? "";

  if (chatId != null && text) {
    const lower = text.toLowerCase();
    if (lower === "/start" || lower.startsWith("/start ")) {
      await startOnboarding(chatId);
    } else if (lower === "/id" || lower === "/chatid") {
      await sendMessage({
        chatId,
        text: `chat_id: ${chatId}`,
      });
    } else if (lower === "/ping") {
      await sendMessage({ chatId, text: "pong" });
    } else if (
      text.includes("Raqamni ulashish") ||
      text.includes("Поделиться номером")
    ) {
      // User tapped label without sharing — re-prompt
      const session = getOnboardingSession(chatId);
      const locale = session?.locale ?? "uz";
      await sendMessage({
        chatId,
        text: botOnboardingCopy[locale].needShare,
        replyMarkup: shareContactKeyboard(locale),
      });
    } else {
      const session = getOnboardingSession(chatId);
      if (session) {
        await sendMessage({
          chatId,
          text: botOnboardingCopy[session.locale].needShare,
          replyMarkup: shareContactKeyboard(session.locale),
        });
      } else {
        await sendMessage({
          chatId,
          text: `${botOnboardingCopy.uz.restart}\n${botOnboardingCopy.ru.restart}`,
        });
      }
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
