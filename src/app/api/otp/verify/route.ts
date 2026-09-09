import { NextResponse } from "next/server";
import { verifyOtp } from "@/lib/messaging/otp";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      phone?: string;
      code?: string;
      purpose?: "verify" | "login" | "webapp";
    };
    const result = await verifyOtp({
      phone: String(body.phone ?? ""),
      code: String(body.code ?? ""),
      purpose: body.purpose,
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
