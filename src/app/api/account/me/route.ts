import { NextResponse } from "next/server";
import {
  requireLinkedAccount,
  resolveAccountCaller,
} from "@/lib/fcargo/epos-account-auth";
import { continueAccountSession } from "@/lib/fcargo/epos-account-session";

async function linkedMeResponse(
  request: Request,
  body: Record<string, unknown>,
) {
  const linked = await requireLinkedAccount(request, body);
  if (!linked.ok) return null;

  const continued = await continueAccountSession({
    link: linked.link,
    token: linked.token,
  });

  return NextResponse.json({
    ok: true,
    linked: continued.linked,
    sessionExpiresAt: continued.sessionExpiresAt,
    profile: continued.profile
      ? {
          name: continued.profile.name,
          phone: continued.profile.phone,
          email: continued.profile.email,
          id: continued.profile.id,
        }
      : null,
  });
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const initData = url.searchParams.get("initData");
  const body = initData ? { initData } : {};

  const linkedResponse = await linkedMeResponse(request, body);
  if (linkedResponse) return linkedResponse;

  const caller = await resolveAccountCaller(request, body);
  if (!caller.ok) return caller.response;
  return NextResponse.json({ ok: true, linked: null });
}

export async function POST(request: Request) {
  let body: Record<string, unknown> = {};
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    body = {};
  }

  const linkedResponse = await linkedMeResponse(request, body);
  if (linkedResponse) return linkedResponse;

  return NextResponse.json({ ok: true, linked: null });
}
