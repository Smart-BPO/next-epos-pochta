"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useDashT } from "@/components/dashboard/DashLocaleProvider";
import { MessagingSubnav } from "@/components/dashboard/messaging/MessagingSubnav";
import { saveTemplateAction } from "@/app/dashboard/(app)/messaging/actions";
import type { MessageTemplate } from "@/lib/messaging/store";
import {
  estimateSmsSegments,
  renderTemplate,
} from "@/lib/messaging/templates";
import {
  dashBtnPrimary,
  dashCardPad,
  dashInput,
} from "@/styles/dashboard";
import { DashPageHeader } from "@/components/dashboard/ui";

const SAMPLE: Record<string, string> = {
  id: "EP-20260309-AB12",
  type: "price",
  name: "Ali Valiyev",
  name_part: ", Ali",
  phone: "+998901234567",
  email: "ali@example.com",
  details: "Toshkent → Samarqand, 2 kg",
  locale: "uz",
  status: "confirmed",
  status_label: "Tasdiqlandi",
  track: "EP123456789UZ",
  route: "Toshkent → Samarqand",
  code: "482913",
};

export function MessagingTemplateEditorClient({
  template,
  canWrite,
}: {
  template: MessageTemplate;
  canWrite: boolean;
}) {
  const t = useDashT();
  const router = useRouter();
  const [name, setName] = useState(template.name);
  const [description, setDescription] = useState(template.description);
  const [subject, setSubject] = useState(template.subject);
  const [bodyText, setBodyText] = useState(template.body_text);
  const [bodyHtml, setBodyHtml] = useState(template.body_html);
  const [variables, setVariables] = useState(template.variables.join(", "));

  const previewText = useMemo(
    () => renderTemplate(bodyText, SAMPLE),
    [bodyText],
  );
  const previewSubject = useMemo(
    () => renderTemplate(subject, SAMPLE),
    [subject],
  );
  const segments = estimateSmsSegments(previewText);

  function insertVar(v: string) {
    setBodyText((prev) => `${prev}{{${v}}}`);
  }

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    const fd = new FormData();
    fd.set("id", template.id);
    fd.set("name", name);
    fd.set("description", description);
    fd.set("subject", subject);
    fd.set("body_text", bodyText);
    fd.set("body_html", bodyHtml);
    fd.set("variables", variables);
    try {
      await saveTemplateAction(fd);
      toast.success(t.messaging.saved);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t.errors.saveFailed);
    }
  }

  return (
    <div className="space-y-5">
      <DashPageHeader title={template.name} lead={template.key} />
      <MessagingSubnav />
      <form onSubmit={onSave} className="grid gap-4 lg:grid-cols-2">
        <div className={`${dashCardPad} space-y-3`}>
          <label className="grid gap-1 text-xs font-semibold uppercase tracking-wide text-black/40">
            {t.list.title}
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={!canWrite}
              className={dashInput}
            />
          </label>
          <label className="grid gap-1 text-xs font-semibold uppercase tracking-wide text-black/40">
            {t.list.labels}
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={!canWrite}
              rows={2}
              className={dashInput}
            />
          </label>
          {template.channel === "email" ? (
            <label className="grid gap-1 text-xs font-semibold uppercase tracking-wide text-black/40">
              {t.messaging.subject}
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                disabled={!canWrite}
                className={dashInput}
              />
            </label>
          ) : null}
          <label className="grid gap-1 text-xs font-semibold uppercase tracking-wide text-black/40">
            {t.messaging.bodyText}
            <textarea
              value={bodyText}
              onChange={(e) => setBodyText(e.target.value)}
              disabled={!canWrite}
              rows={8}
              className={`${dashInput} font-mono text-xs`}
            />
          </label>
          {template.channel === "email" ? (
            <label className="grid gap-1 text-xs font-semibold uppercase tracking-wide text-black/40">
              {t.messaging.bodyHtml}
              <textarea
                value={bodyHtml}
                onChange={(e) => setBodyHtml(e.target.value)}
                disabled={!canWrite}
                rows={8}
                className={`${dashInput} font-mono text-xs`}
              />
            </label>
          ) : null}
          <label className="grid gap-1 text-xs font-semibold uppercase tracking-wide text-black/40">
            {t.messaging.variables}
            <input
              value={variables}
              onChange={(e) => setVariables(e.target.value)}
              disabled={!canWrite}
              className={dashInput}
            />
          </label>
          <div className="flex flex-wrap gap-1.5">
            {template.variables.map((v) => (
              <button
                key={v}
                type="button"
                disabled={!canWrite}
                onClick={() => insertVar(v)}
                className="rounded-lg border border-black/10 bg-white px-2 py-1 text-[0.7rem] font-semibold text-black/55 hover:bg-black/[0.03]"
              >
                {`{{${v}}}`}
              </button>
            ))}
          </div>
          {canWrite ? (
            <button type="submit" className={`${dashBtnPrimary} w-fit`}>
              {t.common.save}
            </button>
          ) : null}
        </div>

        <div className={`${dashCardPad} space-y-3`}>
          <p className="m-0 text-sm font-semibold">{t.messaging.preview}</p>
          {template.channel === "email" ? (
            <p className="m-0 text-sm font-medium text-ink">{previewSubject}</p>
          ) : (
            <p className="m-0 text-xs text-black/45">
              {t.messaging.segments}: {segments.segments} · {segments.length}{" "}
              ({segments.encoding})
            </p>
          )}
          <pre className="m-0 whitespace-pre-wrap rounded-xl bg-black/[0.03] p-3 text-xs text-ink">
            {previewText}
          </pre>
          {template.channel === "email" && bodyHtml ? (
            <div
              className="prose prose-sm max-w-none rounded-xl border border-black/[0.06] p-3"
              dangerouslySetInnerHTML={{
                __html: renderTemplate(bodyHtml, SAMPLE),
              }}
            />
          ) : null}
        </div>
      </form>
    </div>
  );
}
