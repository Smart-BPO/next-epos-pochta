import { NextResponse } from "next/server";
import {
  clearWebAccountCookie,
  decryptLinkToken,
  revokeLinkSession,
} from "@/lib/fcargo/epos-account";
import { requireActiveLink } from "@/lib/fcargo/epos-account-auth";
import { eposLogout } from "@/lib/fcargo/epos-client";

export async function POST(request: Request) {
  let body: Record<string, unknown> = {};
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    body = {};
  }

  const linked = await requireActiveLink(request, body);
  if (!linked.ok) {
    await clearWebAccountCookie();
    return NextResponse.json({ ok: true });
  }

  const token = await decryptLinkToken(linked.link);
  if (token) {
    try {
      await eposLogout(token);
    } catch {
      // still revoke locally
    }
  }
  await revokeLinkSession(linked.link);

  return NextResponse.json({ ok: true });
}
