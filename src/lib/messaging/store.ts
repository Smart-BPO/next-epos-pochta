import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type MessageTemplate = {
  id: string;
  key: string;
  channel: "sms" | "email";
  locale: "uz" | "ru";
  name: string;
  description: string;
  subject: string;
  body_text: string;
  body_html: string;
  variables: string[];
  is_system: boolean;
  updated_at: string;
};

export async function listMessageTemplates(): Promise<MessageTemplate[]> {
  const client = createSupabaseAdminClient();
  const { data, error } = await client
    .from("epos_message_templates")
    .select(
      "id, key, channel, locale, name, description, subject, body_text, body_html, variables, is_system, updated_at",
    )
    .order("key", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as MessageTemplate[];
}

export async function getMessageTemplate(
  id: string,
): Promise<MessageTemplate | null> {
  const client = createSupabaseAdminClient();
  const { data, error } = await client
    .from("epos_message_templates")
    .select(
      "id, key, channel, locale, name, description, subject, body_text, body_html, variables, is_system, updated_at",
    )
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data as MessageTemplate | null) ?? null;
}

export async function getTemplateByKey(params: {
  key: string;
  channel: "sms" | "email";
  locale: "uz" | "ru";
}): Promise<MessageTemplate | null> {
  const client = createSupabaseAdminClient();
  const { data, error } = await client
    .from("epos_message_templates")
    .select(
      "id, key, channel, locale, name, description, subject, body_text, body_html, variables, is_system, updated_at",
    )
    .eq("key", params.key)
    .eq("channel", params.channel)
    .eq("locale", params.locale)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data as MessageTemplate | null) ?? null;
}

export async function updateMessageTemplate(params: {
  id: string;
  name: string;
  description: string;
  subject: string;
  body_text: string;
  body_html: string;
  variables: string[];
}): Promise<void> {
  const client = createSupabaseAdminClient();
  const { error } = await client
    .from("epos_message_templates")
    .update({
      name: params.name,
      description: params.description,
      subject: params.subject,
      body_text: params.body_text,
      body_html: params.body_html,
      variables: params.variables,
      updated_at: new Date().toISOString(),
    })
    .eq("id", params.id);
  if (error) throw new Error(error.message);
}

export type NotifyEvent =
  | "lead_created_staff"
  | "lead_created_customer"
  | "shipment_status"
  | "otp_send";

export type NotifyRule = {
  event: NotifyEvent;
  enabled: boolean;
  channels: { sms?: boolean; email?: boolean; telegram?: boolean };
  audience: "staff" | "customer" | "custom";
  staff_emails: string[];
  staff_phones: string[];
  customer_from: "lead.phone" | "shipment.contact" | "otp.phone";
  locale_mode: "customer" | "uz" | "ru" | "both";
  sms_provider: "primary" | "playmobile" | "eskiz" | "failover";
  template_sms_key: string | null;
  template_email_key: string | null;
};

export async function listNotifyRules(): Promise<NotifyRule[]> {
  const client = createSupabaseAdminClient();
  const { data, error } = await client
    .from("epos_notify_rules")
    .select("*")
    .order("event");
  if (error) throw new Error(error.message);
  return ((data ?? []) as NotifyRule[]).map((r) => ({
    ...r,
    channels:
      typeof r.channels === "object" && r.channels
        ? (r.channels as NotifyRule["channels"])
        : {},
    staff_emails: r.staff_emails ?? [],
    staff_phones: r.staff_phones ?? [],
  }));
}

export async function getNotifyRule(
  event: NotifyEvent,
): Promise<NotifyRule | null> {
  const client = createSupabaseAdminClient();
  const { data, error } = await client
    .from("epos_notify_rules")
    .select("*")
    .eq("event", event)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  const r = data as NotifyRule;
  return {
    ...r,
    channels:
      typeof r.channels === "object" && r.channels
        ? (r.channels as NotifyRule["channels"])
        : {},
    staff_emails: r.staff_emails ?? [],
    staff_phones: r.staff_phones ?? [],
  };
}

export async function updateNotifyRule(
  rule: NotifyRule,
): Promise<void> {
  const client = createSupabaseAdminClient();
  const { error } = await client.from("epos_notify_rules").upsert(
    {
      event: rule.event,
      enabled: rule.enabled,
      channels: rule.channels,
      audience: rule.audience,
      staff_emails: rule.staff_emails,
      staff_phones: rule.staff_phones,
      customer_from: rule.customer_from,
      locale_mode: rule.locale_mode,
      sms_provider: rule.sms_provider,
      template_sms_key: rule.template_sms_key,
      template_email_key: rule.template_email_key,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "event" },
  );
  if (error) throw new Error(error.message);
}

export type MessageLogRow = {
  id: string;
  created_at: string;
  event: string;
  channel: string;
  provider: string | null;
  to_masked: string;
  template_key: string | null;
  locale: string | null;
  status: string;
  provider_message_id: string | null;
  error: string | null;
  entity_type: string | null;
  entity_id: string | null;
};

export async function listMessageLog(limit = 100): Promise<MessageLogRow[]> {
  const client = createSupabaseAdminClient();
  const { data, error } = await client
    .from("epos_message_log")
    .select(
      "id, created_at, event, channel, provider, to_masked, template_key, locale, status, provider_message_id, error, entity_type, entity_id",
    )
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return (data ?? []) as MessageLogRow[];
}

export async function writeMessageLog(entry: {
  event: string;
  channel: "sms" | "email" | "telegram";
  provider?: string;
  to_masked: string;
  template_key?: string;
  locale?: string;
  status: "queued" | "sent" | "failed" | "skipped";
  provider_message_id?: string;
  error?: string;
  payload_snapshot?: Record<string, unknown>;
  entity_type?: string;
  entity_id?: string;
  idempotency_key?: string;
}) {
  const client = createSupabaseAdminClient();
  await client.from("epos_message_log").insert({
    event: entry.event,
    channel: entry.channel,
    provider: entry.provider ?? null,
    to_masked: entry.to_masked,
    template_key: entry.template_key ?? null,
    locale: entry.locale ?? null,
    status: entry.status,
    provider_message_id: entry.provider_message_id ?? null,
    error: entry.error ?? null,
    payload_snapshot: entry.payload_snapshot ?? {},
    entity_type: entry.entity_type ?? null,
    entity_id: entry.entity_id ?? null,
    idempotency_key: entry.idempotency_key ?? null,
  });
}
