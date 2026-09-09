import { NextResponse } from "next/server";
import { issueOtp, PUBLIC_OTP_PURPOSES, type OtpPurpose } from "@/lib/messaging/otp";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      phone?: string;
      purpose?: OtpPurpose;
      locale?: "uz" | "ru";
    };
    const purpose = body.purpose ?? "verify";
    if (!PUBLIC_OTP_PURPOSES.includes(purpose)) {
      return NextResponse.json({ error: "invalid_purpose" }, { status: 400 });
    }
    const result = await issueOtp({
      phone: String(body.phone ?? ""),
      channel: "sms",
      purpose,
      locale: body.locale === "ru" ? "ru" : "uz",
    });
    if (!result.ok) {
      const status = result.error === "rate_limited" ? 429 : 400;
      return NextResponse.json({ error: result.error }, { status });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "otp_failed" },
      { status: 500 },
    );
  }
}
