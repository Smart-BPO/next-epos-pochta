import { NextResponse } from "next/server";
import { issueOtp } from "@/lib/messaging/otp";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      phone?: string;
      purpose?: "verify" | "login" | "webapp";
      locale?: "uz" | "ru";
    };
    const result = await issueOtp({
      phone: String(body.phone ?? ""),
      purpose: body.purpose,
      locale: body.locale === "ru" ? "ru" : "uz",
    });
    if (!result.ok) {
      const status =
        result.error === "rate_limited"
          ? 429
          : result.error === "invalid_phone"
            ? 400
            : 400;
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
