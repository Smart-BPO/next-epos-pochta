import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { touchAdminLastLogin } from "@/lib/cms/auth";
import {
  requireSupabasePublishableKey,
  requireSupabaseUrl,
} from "@/lib/supabase/env";

export const runtime = "nodejs";

type LoginBody = { email?: string; password?: string };

type JsonResult = { ok: true } | { ok: false; error: string };

function jsonWithCookies(
  payload: JsonResult,
  status: number,
  cookies: { name: string; value: string; options?: Record<string, unknown> }[],
) {
  const response = NextResponse.json(payload, { status });
  for (const cookie of cookies) {
    response.cookies.set(cookie.name, cookie.value, cookie.options as never);
  }
  return response;
}

export async function POST(request: NextRequest) {
  let body: LoginBody;
  try {
    body = (await request.json()) as LoginBody;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const email = typeof body.email === "string" ? body.email.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";
  if (!email || !password) {
    return NextResponse.json(
      { ok: false, error: "Email and password are required" },
      { status: 400 },
    );
  }

  const pendingCookies: {
    name: string;
    value: string;
    options?: Record<string, unknown>;
  }[] = [];

  let url: string;
  let key: string;
  try {
    url = requireSupabaseUrl();
    key = requireSupabasePublishableKey();
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : "Supabase env missing",
      },
      { status: 500 },
    );
  }

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        pendingCookies.length = 0;
        cookiesToSet.forEach(({ name, value, options }) => {
          pendingCookies.push({ name, value, options: options as never });
        });
      },
    },
  });

  const { data, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError || !data.user) {
    return jsonWithCookies(
      { ok: false, error: authError?.message ?? "Invalid login credentials" },
      401,
      pendingCookies,
    );
  }

  try {
    const adminClient = createSupabaseAdminClient();
    const { data: adminRow, error: adminError } = await adminClient
      .from("epos_admin_users")
      .select("user_id, is_active")
      .eq("user_id", data.user.id)
      .maybeSingle();

    if (adminError || !adminRow || adminRow.is_active === false) {
      await supabase.auth.signOut();
      return jsonWithCookies(
        { ok: false, error: "Not an admin" },
        403,
        pendingCookies,
      );
    }
  } catch (err) {
    await supabase.auth.signOut();
    return jsonWithCookies(
      {
        ok: false,
        error:
          err instanceof Error
            ? err.message
            : "Admin membership check failed (secret key?)",
      },
      500,
      pendingCookies,
    );
  }

  await touchAdminLastLogin(data.user.id);
  return jsonWithCookies({ ok: true }, 200, pendingCookies);
}
