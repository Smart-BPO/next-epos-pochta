import {
  getTelegramChatId,
  hasTelegramBotToken,
  leadStatusInlineKeyboard,
  sendMessage,
} from "@/lib/telegram/bot";
import { sendRoutedSms } from "@/lib/sms/router";
import { sendResendEmail } from "@/lib/email/resend";
import {
  getProviderRow,
  getProviderSecrets,
} from "@/lib/messaging/providers";
import {
  getNotifyRule,
  getTemplateByKey,
  writeMessageLog,
  type NotifyEvent,
} from "@/lib/messaging/store";
import { maskRecipient, renderTemplate } from "@/lib/messaging/templates";

export type DispatchInput = {
  event: NotifyEvent;
  locale?: "uz" | "ru";
  data: Record<string, string | number | null | undefined>;
  /** Override recipients */
  to?: {
    emails?: string[];
    phones?: string[];
    telegramChatId?: string;
  };
  entityType?: string;
  entityId?: string;
  idempotencyKey?: string;
  /** For lead telegram keyboard */
  leadIdForTelegram?: string;
};

export type DispatchResult = {
  sent: Array<{ channel: string; ok: boolean; error?: string }>;
};

function resolveLocales(
  mode: string,
  customerLocale?: "uz" | "ru",
): Array<"uz" | "ru"> {
  if (mode === "uz") return ["uz"];
  if (mode === "ru") return ["ru"];
  if (mode === "both") return ["uz", "ru"];
  return [customerLocale === "ru" ? "ru" : "uz"];
}

async function sendEmailChannel(params: {
  to: string[];
  subject: string;
  text: string;
  html?: string;
}): Promise<{ ok: boolean; messageId?: string; error?: string; provider: string }> {
  const row = await getProviderRow("resend");
  const secrets = await getProviderSecrets("resend");
  if (!row?.enabled || !secrets?.api_key) {
    return { ok: false, error: "Resend not configured", provider: "resend" };
  }
  const fromEmail = row.config_public.from_email || "onboarding@resend.dev";
  const fromName = row.config_public.from_name || "EPOS POCHTA";
  const from = `${fromName} <${fromEmail}>`;
  const result = await sendResendEmail({
    apiKey: secrets.api_key,
    from,
    to: params.to,
    subject: params.subject,
    text: params.text,
    html: params.html,
  });
  if (!result.ok) {
    return { ok: false, error: result.description, provider: "resend" };
  }
  return { ok: true, messageId: result.messageId, provider: "resend" };
}

export async function dispatchNotification(
  input: DispatchInput,
): Promise<DispatchResult> {
  const rule = await getNotifyRule(input.event);
  const sent: DispatchResult["sent"] = [];

  if (!rule || !rule.enabled) {
    await writeMessageLog({
      event: input.event,
      channel: "email",
      to_masked: "",
      status: "skipped",
      error: "rule_disabled",
      entity_type: input.entityType,
      entity_id: input.entityId,
      idempotency_key: input.idempotencyKey
        ? `${input.idempotencyKey}:skipped`
        : undefined,
    });
    return { sent: [{ channel: "all", ok: false, error: "rule_disabled" }] };
  }

  const locales = resolveLocales(rule.locale_mode, input.locale);
  const primaryLocale = locales[0] ?? "uz";

  const staffEmails =
    input.to?.emails?.length
      ? input.to.emails
      : rule.staff_emails.filter(Boolean);
  const staffPhones =
    input.to?.phones?.length
      ? input.to.phones
      : rule.staff_phones.filter(Boolean);

  const customerPhone = String(input.data.phone ?? "").trim();
  const customerEmail = String(input.data.email ?? "").trim();

  const emails =
    rule.audience === "staff" || rule.audience === "custom"
      ? staffEmails
      : input.to?.emails?.length
        ? input.to.emails
        : customerEmail
          ? [customerEmail]
          : [];
  const phones =
    rule.audience === "staff" || rule.audience === "custom"
      ? staffPhones
      : input.to?.phones?.length
        ? input.to.phones
        : customerPhone
          ? [customerPhone]
          : [];

  // Fallback staff emails from resend config notify_to
  if (
    (rule.audience === "staff" || rule.audience === "custom") &&
    emails.length === 0 &&
    rule.channels.email
  ) {
    const resend = await getProviderRow("resend");
    const notify = resend?.config_public.notify_to?.trim();
    if (notify) emails.push(...notify.split(/[,;\s]+/).filter(Boolean));
  }

  // SMS
  if (rule.channels.sms && rule.template_sms_key) {
    const tpl = await getTemplateByKey({
      key: rule.template_sms_key,
      channel: "sms",
      locale: primaryLocale,
    });
    if (!tpl) {
      sent.push({ channel: "sms", ok: false, error: "template_missing" });
    } else if (phones.length === 0) {
      sent.push({ channel: "sms", ok: false, error: "no_recipients" });
      await writeMessageLog({
        event: input.event,
        channel: "sms",
        to_masked: "",
        template_key: rule.template_sms_key,
        locale: primaryLocale,
        status: "skipped",
        error: "no_recipients",
        entity_type: input.entityType,
        entity_id: input.entityId,
      });
    } else {
      const text = renderTemplate(tpl.body_text, input.data);
      for (const phone of phones) {
        const result = await sendRoutedSms({
          to: phone,
          text,
          mode: rule.sms_provider,
        });
        sent.push({
          channel: "sms",
          ok: result.ok,
          error: result.ok ? undefined : result.description,
        });
        await writeMessageLog({
          event: input.event,
          channel: "sms",
          provider: result.ok ? result.provider : result.provider,
          to_masked: maskRecipient(phone),
          template_key: rule.template_sms_key,
          locale: primaryLocale,
          status: result.ok ? "sent" : "failed",
          provider_message_id: result.ok ? result.messageId : undefined,
          error: result.ok ? undefined : result.description,
          payload_snapshot: { preview: text.slice(0, 200) },
          entity_type: input.entityType,
          entity_id: input.entityId,
          idempotency_key: input.idempotencyKey
            ? `${input.idempotencyKey}:sms:${phone}`
            : undefined,
        });
      }
    }
  }

  // Email
  if (rule.channels.email && rule.template_email_key) {
    const tpl = await getTemplateByKey({
      key: rule.template_email_key,
      channel: "email",
      locale: primaryLocale,
    });
    if (!tpl) {
      sent.push({ channel: "email", ok: false, error: "template_missing" });
    } else if (emails.length === 0) {
      sent.push({ channel: "email", ok: false, error: "no_recipients" });
      await writeMessageLog({
        event: input.event,
        channel: "email",
        to_masked: "",
        template_key: rule.template_email_key,
        locale: primaryLocale,
        status: "skipped",
        error: "no_recipients",
        entity_type: input.entityType,
        entity_id: input.entityId,
      });
    } else {
      const subject = renderTemplate(tpl.subject || tpl.name, input.data);
      const text = renderTemplate(tpl.body_text, input.data);
      const html = tpl.body_html
        ? renderTemplate(tpl.body_html, input.data)
        : undefined;
      const result = await sendEmailChannel({
        to: emails,
        subject,
        text,
        html,
      });
      sent.push({
        channel: "email",
        ok: result.ok,
        error: result.error,
      });
      await writeMessageLog({
        event: input.event,
        channel: "email",
        provider: "resend",
        to_masked: emails.map(maskRecipient).join(", "),
        template_key: rule.template_email_key,
        locale: primaryLocale,
        status: result.ok ? "sent" : "failed",
        provider_message_id: result.messageId,
        error: result.error,
        payload_snapshot: { subject },
        entity_type: input.entityType,
        entity_id: input.entityId,
        idempotency_key: input.idempotencyKey
          ? `${input.idempotencyKey}:email`
          : undefined,
      });
    }
  }

  // Telegram (staff lead style)
  if (rule.channels.telegram) {
    if (!hasTelegramBotToken()) {
      sent.push({ channel: "telegram", ok: false, error: "no_bot_token" });
    } else {
      const chatId = input.to?.telegramChatId || getTelegramChatId();
      if (!chatId) {
        sent.push({ channel: "telegram", ok: false, error: "no_chat_id" });
      } else {
        const details = String(input.data.details ?? "");
        const text =
          `EPOS ${input.event} ${input.data.id ?? ""}\n\n` +
          `${input.data.name ?? ""} ${input.data.phone ?? ""}\n` +
          details.slice(0, 3500);
        const leadId = input.leadIdForTelegram || String(input.entityId ?? "");
        const result = await sendMessage({
          chatId,
          text,
          replyMarkup: leadId
            ? leadStatusInlineKeyboard(leadId)
            : undefined,
        });
        sent.push({
          channel: "telegram",
          ok: result.ok,
          error: result.ok ? undefined : result.description,
        });
        await writeMessageLog({
          event: input.event,
          channel: "telegram",
          provider: "telegram",
          to_masked: maskRecipient(String(chatId)),
          locale: primaryLocale,
          status: result.ok ? "sent" : "failed",
          error: result.ok ? undefined : result.description,
          entity_type: input.entityType,
          entity_id: input.entityId,
          idempotency_key: input.idempotencyKey
            ? `${input.idempotencyKey}:tg`
            : undefined,
        });
      }
    }
  }

  return { sent };
}
