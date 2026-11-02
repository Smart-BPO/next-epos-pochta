import { NextResponse } from "next/server";
import {
  clearWebAccountCookie,
  revokeLink,
} from "@/lib/fcargo/epos-account";
import { requireLinkedAccount } from "@/lib/fcargo/epos-account-auth";
import { eposLogout } from "@/lib/fcargo/epos-client";

export async function POST(request: Request) {
  let body: Record<string, unknown> = {};
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    body = {};
  }

  const linked = await requireLinkedAccount(request, body);
  if (!linked.ok) {
    await clearWebAccountCookie();
    return NextResponse.json({ ok: true });
  }

  try {
    await eposLogout(linked.token);
  } catch {
    // still revoke locally
  }
  await revokeLink(linked.link);
  if (linked.subject.type === "web") {
    await clearWebAccountCookie();
  }

  return NextResponse.json({ ok: true });
}
