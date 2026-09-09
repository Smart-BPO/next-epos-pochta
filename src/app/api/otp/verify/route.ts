import { NextResponse } from "next/server";
import { PUBLIC_OTP_PURPOSES, verifyOtp, type OtpPurpose } from "@/lib/messaging/otp";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      phone?: string;
      code?: string;
      purpose?: OtpPurpose;
    };
    const purpose = body.purpose ?? "verify";
    if (!PUBLIC_OTP_PURPOSES.includes(purpose)) {
      return NextResponse.json({ error: "invalid_purpose" }, { status: 400 });
    }
    const result = await verifyOtp({
      phone: String(body.phone ?? ""),
      channel: "sms",
      code: String(body.code ?? ""),
      purpose,
    });
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "otp_failed" },
      { status: 500 },
    );
  }
}
