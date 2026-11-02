import { NextResponse } from "next/server";
import { toPublicLink } from "@/lib/fcargo/epos-account";
import {
  requireLinkedAccount,
  resolveAccountCaller,
} from "@/lib/fcargo/epos-account-auth";
import { eposProfile } from "@/lib/fcargo/epos-client";
import { revokeLink } from "@/lib/fcargo/epos-account";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const initData = url.searchParams.get("initData");
  const body = initData ? { initData } : {};

  const linked = await requireLinkedAccount(request, body);
  if (!linked.ok) {
    const caller = await resolveAccountCaller(request, body);
    if (!caller.ok) return caller.response;
    return NextResponse.json({ ok: true, linked: null });
  }

  const profile = await eposProfile(linked.token);
  if (!profile.ok && profile.status === 401) {
    await revokeLink(linked.link);
    return NextResponse.json(
      { error: "relink_required", linked: null },
      { status: 401 },
    );
  }

  return NextResponse.json({
    ok: true,
    linked: toPublicLink(linked.link),
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

export async function POST(request: Request) {
  let body: Record<string, unknown> = {};
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    body = {};
  }

  const linked = await requireLinkedAccount(request, body);
  if (!linked.ok) {
    return NextResponse.json({ ok: true, linked: null });
  }

  const profile = await eposProfile(linked.token);
  if (!profile.ok && profile.status === 401) {
    await revokeLink(linked.link);
    return NextResponse.json(
      { error: "relink_required", linked: null },
      { status: 401 },
    );
  }

  return NextResponse.json({
    ok: true,
    linked: toPublicLink(linked.link),
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
