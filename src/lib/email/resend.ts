import { Resend } from "resend";

export type EmailSendResult =
  | { ok: true; messageId: string }
  | { ok: false; description: string };

export async function sendResendEmail(params: {
  apiKey: string;
  from: string;
  to: string | string[];
  subject: string;
  text: string;
  html?: string;
}): Promise<EmailSendResult> {
  try {
    const resend = new Resend(params.apiKey);
    const { data, error } = await resend.emails.send({
      from: params.from,
      to: params.to,
      subject: params.subject,
      text: params.text,
      html: params.html || undefined,
    });
    if (error) {
      return { ok: false, description: error.message };
    }
    return { ok: true, messageId: data?.id ?? `resend-${Date.now()}` };
  } catch (err) {
    return {
      ok: false,
      description: err instanceof Error ? err.message : "resend_error",
    };
  }
}
