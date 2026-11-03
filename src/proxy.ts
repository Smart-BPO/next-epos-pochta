import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import {
  getCanonicalRedirectFromHeaders,
  toCanonicalPublicUrl,
} from "@/utils/seo/canonical-request";
import {
  getSupabasePublishableKey,
  getSupabaseUrl,
} from "@/lib/supabase/env";

function isPublicDashboardPath(pathname: string) {
  return (
    pathname === "/dashboard/login" ||
    pathname === "/dashboard/login/" ||
    pathname === "/dashboard/setup" ||
    pathname === "/dashboard/setup/"
  );
}

function isDashboardPath(pathname: string) {
  return pathname === "/dashboard" || pathname.startsWith("/dashboard/");
}

/**
 * 1. Canonical URL 308
 * 2. Legacy /uz → unprefixed
 * 3. Locale cookie + x-html-lang
 * 4. Dashboard session refresh + auth gate
 */
export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const hostHeader =
    request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const hostname = (hostHeader ?? "").split(":")[0].toLowerCase();

  // Static-style permanent redirect for legacy nocode host (any path).
  if (
    hostname === "epos.nocode.uz" ||
    hostname === "www.epos.nocode.uz"
  ) {
    let path = pathname;
    if (path !== "/" && !path.endsWith("/") && !path.includes(".")) {
      path = `${path}/`;
    }
    return NextResponse.redirect(
      toCanonicalPublicUrl(path, request.nextUrl.search),
      301,
    );
  }

  if (
    pathname === "/uz" ||
    pathname === "/uz/" ||
    pathname.startsWith("/uz/")
  ) {
    let path =
      pathname === "/uz" || pathname === "/uz/"
        ? "/"
        : pathname.replace(/^\/uz/, "") || "/";
    if (path !== "/" && !path.endsWith("/") && !path.includes(".")) {
      path = `${path}/`;
    }
    return NextResponse.redirect(
      toCanonicalPublicUrl(path, request.nextUrl.search),
      308,
    );
  }

  if (!pathname.startsWith("/_next")) {
    const canonical = getCanonicalRedirectFromHeaders(
      request.headers,
      request.nextUrl,
    );
    if (canonical) {
      return NextResponse.redirect(canonical, 308);
    }
  }

  const requestHeaders = new Headers(request.headers);
  const publicLocale =
    pathname === "/ru" || pathname === "/ru/" || pathname.startsWith("/ru/")
      ? "ru"
      : pathname === "/zh" ||
          pathname === "/zh/" ||
          pathname.startsWith("/zh/")
        ? "zh"
        : "uz";
  requestHeaders.set(
    "x-html-lang",
    publicLocale === "zh" ? "zh-Hans" : publicLocale,
  );

  let response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  if (isDashboardPath(pathname)) {
    const url = getSupabaseUrl();
    const key = getSupabasePublishableKey();
    if (url && key) {
      type CookieToSet = {
        name: string;
        value: string;
        options?: Parameters<typeof response.cookies.set>[2];
      };
      let pendingCookies: CookieToSet[] = [];

      const supabase = createServerClient(url, key, {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            pendingCookies = cookiesToSet;
            cookiesToSet.forEach(({ name, value }) => {
              request.cookies.set(name, value);
            });
            response = NextResponse.next({
              request: { headers: requestHeaders },
            });
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options);
            });
          },
        },
      });

      const applyPendingCookies = (target: NextResponse) => {
        pendingCookies.forEach(({ name, value, options }) => {
          target.cookies.set(name, value, options);
        });
        return target;
      };

      const {
        data: { user },
      } = await supabase.auth.getUser();

      const isLoginPath =
        pathname === "/dashboard/login" || pathname === "/dashboard/login/";
      const isSetupPath =
        pathname === "/dashboard/setup" || pathname === "/dashboard/setup/";

      let isActiveAdmin = false;
      if (user) {
        const { data: adminRow } = await supabase
          .from("epos_admin_users")
          .select("user_id, is_active")
          .eq("user_id", user.id)
          .maybeSingle();
        isActiveAdmin = Boolean(
          adminRow && adminRow.is_active !== false,
        );
      }

      if (user && !isActiveAdmin && !isSetupPath) {
        await supabase.auth.signOut();
        // Avoid re-redirect loop when already on login with ?error=not-admin.
        if (
          isLoginPath &&
          request.nextUrl.searchParams.get("error") === "not-admin"
        ) {
          return response;
        }
        const login = request.nextUrl.clone();
        login.pathname = "/dashboard/login/";
        login.search = "";
        login.searchParams.set("error", "not-admin");
        return applyPendingCookies(NextResponse.redirect(login));
      }

      if (!user && !isPublicDashboardPath(pathname)) {
        const login = request.nextUrl.clone();
        login.pathname = "/dashboard/login/";
        login.searchParams.set("next", pathname);
        return applyPendingCookies(NextResponse.redirect(login));
      }

      if (user && isActiveAdmin && isLoginPath) {
        const home = request.nextUrl.clone();
        home.pathname = "/dashboard/";
        home.search = "";
        return applyPendingCookies(NextResponse.redirect(home));
      }
    } else if (!isPublicDashboardPath(pathname)) {
      const login = request.nextUrl.clone();
      login.pathname = "/dashboard/login/";
      return NextResponse.redirect(login);
    }
  }

  if (
    !pathname.startsWith("/api") &&
    !pathname.startsWith("/_next") &&
    !isDashboardPath(pathname)
  ) {
    response.cookies.set("epos_locale", publicLocale, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
  }

  return response;
}

export const config = {
  matcher: ["/", "/((?!_next/|favicon.ico).*)"],
};
