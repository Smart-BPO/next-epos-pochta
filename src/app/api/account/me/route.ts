import { NextResponse } from "next/server";
import {
  markLinkValidated,
  refreshWebAccountSession,
  revokeLinkSession,
  toPublicLink,
} from "@/lib/fcargo/epos-account";
import {
  requireLinkedAccount,
  resolveAccountCaller,
} from "@/lib/fcargo/epos-account-auth";
import { eposProfile } from "@/lib/fcargo/epos-client";

async function linkedMeResponse(
  request: Request,
  body: Record<string, unknown>,
) {
  const linked = await requireLinkedAccount(request, body);
  if (!linked.ok) return null;

  const profile = await eposProfile(linked.token);
  if (!profile.ok && profile.status === 401) {
    await revokeLinkSession(linked.link);
    return NextResponse.json(
      { error: "relink_required", linked: null },
      { status: 401 },
    );
  }

  if (profile.ok) {
    await markLinkValidated(linked.link, {
      displayName: profile.data.name,
      phone: profile.data.phone,
      fcargoClientId: profile.data.id,
    });
  }

  const sessionExpiresAt = await refreshWebAccountSession(linked.link);

  return NextResponse.json({
    ok: true,
    linked: toPublicLink(linked.link),
    sessionExpiresAt,
    profile: profile.ok
      ? {
          name: profile.data.name,
          phone: profile.data.phone,
          email: profile.data.email,
          id: profile.data.id,
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
