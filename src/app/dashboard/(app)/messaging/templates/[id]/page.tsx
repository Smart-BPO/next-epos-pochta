import { notFound } from "next/navigation";
import { requireAccess, canMutate } from "@/lib/cms/auth";
import { DashDenied } from "@/components/dashboard/DashDenied";
import { MessagingTemplateEditorClient } from "@/components/dashboard/messaging/MessagingTemplateEditorClient";
import { getMessageTemplate } from "@/lib/messaging/store";

export default async function MessagingTemplateEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const admin = await requireAccess("settings");
  if (!admin) return <DashDenied section="settings" />;
  const { id } = await params;
  const template = await getMessageTemplate(id);
  if (!template) notFound();
  return (
    <MessagingTemplateEditorClient
      template={template}
      canWrite={canMutate(admin.role, "settings")}
    />
  );
}
