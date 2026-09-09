"use client";

import { toast } from "react-toastify";
import { useDashT } from "@/components/dashboard/DashLocaleProvider";
import { MessagingSubnav } from "@/components/dashboard/messaging/MessagingSubnav";
import { saveRuleAction } from "@/app/dashboard/(app)/messaging/actions";
import type { NotifyRule } from "@/lib/messaging/store";
import {
  dashBtnPrimary,
  dashCardPad,
  dashInput,
  dashSelect,
} from "@/styles/dashboard";
import { DashPageHeader } from "@/components/dashboard/ui";

function eventLabel(
  t: ReturnType<typeof useDashT>,
  event: string,
): string {
  const key = `event_${event}` as keyof typeof t.messaging;
  const value = t.messaging[key];
  return typeof value === "string" ? value : event;
}

export function MessagingRulesClient({
  rules,
  canWrite,
}: {
  rules: NotifyRule[];
  canWrite: boolean;
}) {
  const t = useDashT();

  async function onSave(formData: FormData) {
    try {
      await saveRuleAction(formData);
      toast.success(t.messaging.saved);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t.errors.saveFailed);
    }
  }

  return (
    <div className="space-y-5">
      <DashPageHeader
        title={t.messaging.rulesTitle}
        lead={t.messaging.rulesLead}
      />
      <MessagingSubnav />
      <div className="grid gap-4">
        {rules.map((rule) => (
          <form
            key={rule.event}
            action={onSave}
            className={`${dashCardPad} space-y-3`}
          >
            <input type="hidden" name="event" value={rule.event} />
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="m-0 text-base font-semibold text-ink">
                {eventLabel(t, rule.event)}
              </p>
              <label className="flex items-center gap-2 text-sm font-medium">
                <input
                  type="checkbox"
                  name="enabled"
                  defaultChecked={rule.enabled}
                  disabled={!canWrite}
                  className="size-4 rounded border-black/20"
                />
                {t.messaging.ruleEnabled}
              </label>
            </div>

            <div className="flex flex-wrap gap-4 text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="channel_sms"
                  defaultChecked={Boolean(rule.channels.sms)}
                  disabled={!canWrite}
                  className="size-4 rounded border-black/20"
                />
                {t.messaging.channelSms}
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="channel_email"
                  defaultChecked={Boolean(rule.channels.email)}
                  disabled={!canWrite}
                  className="size-4 rounded border-black/20"
                />
                {t.messaging.channelEmail}
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="channel_telegram"
                  defaultChecked={Boolean(rule.channels.telegram)}
                  disabled={!canWrite}
                  className="size-4 rounded border-black/20"
                />
                {t.messaging.channelTelegram}
              </label>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="grid gap-1 text-xs font-semibold uppercase tracking-wide text-black/40">
                {t.messaging.audience}
                <select
                  name="audience"
                  defaultValue={rule.audience}
                  disabled={!canWrite}
                  className={dashSelect}
                >
                  <option value="staff">{t.messaging.audienceStaff}</option>
                  <option value="customer">
                    {t.messaging.audienceCustomer}
                  </option>
                  <option value="custom">custom</option>
                </select>
              </label>
              <label className="grid gap-1 text-xs font-semibold uppercase tracking-wide text-black/40">
                {t.messaging.localeMode}
                <select
                  name="locale_mode"
                  defaultValue={rule.locale_mode}
                  disabled={!canWrite}
                  className={dashSelect}
                >
                  <option value="customer">
                    {t.messaging.localeCustomer}
                  </option>
                  <option value="uz">uz</option>
                  <option value="ru">ru</option>
                  <option value="both">{t.messaging.localeBoth}</option>
                </select>
              </label>
              <label className="grid gap-1 text-xs font-semibold uppercase tracking-wide text-black/40">
                {t.messaging.smsProvider}
                <select
                  name="sms_provider"
                  defaultValue={rule.sms_provider}
                  disabled={!canWrite}
                  className={dashSelect}
                >
                  <option value="primary">primary</option>
                  <option value="playmobile">playmobile</option>
                  <option value="eskiz">eskiz</option>
                  <option value="failover">failover</option>
                </select>
              </label>
              <label className="grid gap-1 text-xs font-semibold uppercase tracking-wide text-black/40">
                customer_from
                <select
                  name="customer_from"
                  defaultValue={rule.customer_from}
                  disabled={!canWrite}
                  className={dashSelect}
                >
                  <option value="lead.phone">lead.phone</option>
                  <option value="shipment.contact">shipment.contact</option>
                  <option value="otp.phone">otp.phone</option>
                </select>
              </label>
              <label className="grid gap-1 text-xs font-semibold uppercase tracking-wide text-black/40">
                SMS template key
                <input
                  name="template_sms_key"
                  defaultValue={rule.template_sms_key ?? ""}
                  disabled={!canWrite}
                  className={dashInput}
                />
              </label>
              <label className="grid gap-1 text-xs font-semibold uppercase tracking-wide text-black/40">
                Email template key
                <input
                  name="template_email_key"
                  defaultValue={rule.template_email_key ?? ""}
                  disabled={!canWrite}
                  className={dashInput}
                />
              </label>
              <label className="grid gap-1 text-xs font-semibold uppercase tracking-wide text-black/40 sm:col-span-2">
                {t.messaging.staffEmails}
                <input
                  name="staff_emails"
                  defaultValue={rule.staff_emails.join(", ")}
                  disabled={!canWrite}
                  className={dashInput}
                />
              </label>
              <label className="grid gap-1 text-xs font-semibold uppercase tracking-wide text-black/40 sm:col-span-2">
                {t.messaging.staffPhones}
                <input
                  name="staff_phones"
                  defaultValue={rule.staff_phones.join(", ")}
                  disabled={!canWrite}
                  className={dashInput}
                />
              </label>
            </div>

            {canWrite ? (
              <button type="submit" className={`${dashBtnPrimary} w-fit`}>
                {t.common.save}
              </button>
            ) : null}
          </form>
        ))}
      </div>
    </div>
  );
}
