"use server";

import { revalidatePath } from "next/cache";
import { requireMutation, writeAuditLog } from "@/lib/cms/auth";
import {
  maybeImportProvidersFromEnv,
  markProviderTest,
  saveProvider,
  type MessagingProviderId,
} from "@/lib/messaging/providers";
import { sendRoutedSms } from "@/lib/sms/router";
import { sendResendEmail } from "@/lib/email/resend";
import {
  getProviderRow,
  getProviderSecrets,
} from "@/lib/messaging/providers";
import {
  updateMessageTemplate,
  updateNotifyRule,
  type NotifyEvent,
  type NotifyRule,
} from "@/lib/messaging/store";
import { hasMessagingSecretsKey } from "@/lib/crypto/secrets";

function revalidateMessaging() {
  revalidatePath("/dashboard/messaging");
  revalidatePath("/dashboard/messaging/providers");
  revalidatePath("/dashboard/messaging/templates");
  revalidatePath("/dashboard/messaging/rules");
  revalidatePath("/dashboard/messaging/log");
}

export async function importMessagingEnvAction() {
  await requireMutation("settings");
  await maybeImportProvidersFromEnv();
  revalidateMessaging();
}

export async function saveProviderAction(formData: FormData) {
  const admin = await requireMutation("messaging_secrets");
  const id = String(formData.get("id") ?? "") as MessagingProviderId;
  if (!["playmobile", "eskiz", "resend"].includes(id)) {
    throw new Error("Invalid provider");
  }
  if (!hasMessagingSecretsKey()) {
    throw new Error("MESSAGING_SECRETS_KEY is not set");
  }

  const enabled = String(formData.get("enabled") ?? "") === "on";
  const isPrimarySms = String(formData.get("is_primary_sms") ?? "") === "on";

  const config: Record<string, string> = {};
  const secrets: Record<string, string> = {};

  if (id === "playmobile") {
    config.base_url = String(formData.get("base_url") ?? "").trim();
    config.originator = String(formData.get("originator") ?? "").trim();
    secrets.login = String(formData.get("login") ?? "").trim();
    secrets.password = String(formData.get("password") ?? "").trim();
  } else if (id === "eskiz") {
    config.from = String(formData.get("from") ?? "").trim();
    secrets.email = String(formData.get("email") ?? "").trim();
    secrets.password = String(formData.get("password") ?? "").trim();
  } else {
    config.from_email = String(formData.get("from_email") ?? "").trim();
    config.from_name = String(formData.get("from_name") ?? "").trim();
    config.notify_to = String(formData.get("notify_to") ?? "").trim();
    secrets.api_key = String(formData.get("api_key") ?? "").trim();
  }

  await saveProvider({
    id,
    enabled,
    isPrimarySms: id === "resend" ? false : isPrimarySms,
    config,
    secrets,
  });

  await writeAuditLog({
    actor: admin,
    action: "messaging.provider.save",
    entityType: "messaging_provider",
    entityId: id,
    payload: { enabled, isPrimarySms },
  });

  revalidateMessaging();
}

export async function testProviderAction(formData: FormData) {
  await requireMutation("messaging_secrets");
  const id = String(formData.get("id") ?? "") as MessagingProviderId;
  const to = String(formData.get("to") ?? "").trim();

  try {
    if (id === "playmobile" || id === "eskiz") {
      if (!to) throw new Error("Phone required");
      const result = await sendRoutedSms({
        to,
        text: `EPOS test ${new Date().toISOString()}`,
        mode: id,
      });
      if (!result.ok) throw new Error(result.description);
      await markProviderTest(id, true);
    } else if (id === "resend") {
      if (!to) throw new Error("Email required");
      const row = await getProviderRow("resend");
      const secrets = await getProviderSecrets("resend");
      if (!row || !secrets?.api_key) throw new Error("Resend not configured");
      const fromEmail = row.config_public.from_email || "onboarding@resend.dev";
      const fromName = row.config_public.from_name || "EPOS POCHTA";
      const result = await sendResendEmail({
        apiKey: secrets.api_key,
        from: `${fromName} <${fromEmail}>`,
        to,
        subject: "EPOS test email",
        text: `EPOS test ${new Date().toISOString()}`,
      });
      if (!result.ok) throw new Error(result.description);
      await markProviderTest(id, true);
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "test_failed";
    await markProviderTest(id, false, msg);
    throw err;
  }

  revalidateMessaging();
}

export async function saveTemplateAction(formData: FormData) {
  await requireMutation("settings");
  const id = String(formData.get("id") ?? "").trim();
  if (!id) throw new Error("Missing id");
  const variablesRaw = String(formData.get("variables") ?? "");
  const variables = variablesRaw
    .split(/[,\s]+/)
    .map((v) => v.replace(/[{}]/g, "").trim())
    .filter(Boolean);

  await updateMessageTemplate({
    id,
    name: String(formData.get("name") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim(),
    subject: String(formData.get("subject") ?? ""),
    body_text: String(formData.get("body_text") ?? ""),
    body_html: String(formData.get("body_html") ?? ""),
    variables,
  });
  revalidateMessaging();
}

export async function saveRuleAction(formData: FormData) {
  const admin = await requireMutation("settings");
  const event = String(formData.get("event") ?? "") as NotifyEvent;
  const rule: NotifyRule = {
    event,
    enabled: String(formData.get("enabled") ?? "") === "on",
    channels: {
      sms: String(formData.get("channel_sms") ?? "") === "on",
      email: String(formData.get("channel_email") ?? "") === "on",
      telegram: String(formData.get("channel_telegram") ?? "") === "on",
    },
    audience: (String(formData.get("audience") ?? "staff") as NotifyRule["audience"]),
    staff_emails: String(formData.get("staff_emails") ?? "")
      .split(/[,;\s]+/)
      .map((s) => s.trim())
      .filter(Boolean),
    staff_phones: String(formData.get("staff_phones") ?? "")
      .split(/[,;\s]+/)
      .map((s) => s.trim())
      .filter(Boolean),
    customer_from: (String(
      formData.get("customer_from") ?? "lead.phone",
    ) as NotifyRule["customer_from"]),
    locale_mode: (String(
      formData.get("locale_mode") ?? "customer",
    ) as NotifyRule["locale_mode"]),
    sms_provider: (String(
      formData.get("sms_provider") ?? "primary",
    ) as NotifyRule["sms_provider"]),
    template_sms_key:
      String(formData.get("template_sms_key") ?? "").trim() || null,
    template_email_key:
      String(formData.get("template_email_key") ?? "").trim() || null,
  };

  await updateNotifyRule(rule);
  await writeAuditLog({
    actor: admin,
    action: "messaging.rule.save",
    entityType: "notify_rule",
    entityId: event,
    payload: { enabled: rule.enabled, channels: rule.channels },
  });
  revalidateMessaging();
}
