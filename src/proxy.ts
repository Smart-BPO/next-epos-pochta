import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getCanonicalRedirectFromHeaders } from "@/utils/seo/canonical-request";
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

  if (
    pathname === "/uz" ||
    pathname === "/uz/" ||
    pathname.startsWith("/uz/")
  ) {
    const url = request.nextUrl.clone();
    url.pathname =
      pathname === "/uz" || pathname === "/uz/"
        ? "/"
        : pathname.replace(/^\/uz/, "") || "/";
    if (!url.pathname.endsWith("/") && !url.pathname.includes(".")) {
      url.pathname = `${url.pathname}/`;
    }
    return NextResponse.redirect(url, 308);
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
  const russian =
    pathname === "/ru" || pathname === "/ru/" || pathname.startsWith("/ru/");
  requestHeaders.set("x-html-lang", russian ? "ru" : "uz");

  let response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  if (isDashboardPath(pathname)) {
    const url = getSupabaseUrl();
    const key = getSupabasePublishableKey();
    if (url && key) {
      const supabase = createServerClient(url, key, {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
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

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user && !isPublicDashboardPath(pathname)) {
        const login = request.nextUrl.clone();
        login.pathname = "/dashboard/login/";
        login.searchParams.set("next", pathname);
        return NextResponse.redirect(login);
      }

      if (
        user &&
        (pathname === "/dashboard/login" || pathname === "/dashboard/login/")
      ) {
        const home = request.nextUrl.clone();
        home.pathname = "/dashboard/";
        home.search = "";
        return NextResponse.redirect(home);
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
    response.cookies.set("epos_locale", russian ? "ru" : "uz", {
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
