import { NextResponse, type NextRequest } from "next/server";
import { getCanonicalRedirectFromHeaders } from "@/utils/seo/canonical-request";

/**
 * 1. One-hop 308 to the canonical URL (https apex, trailing slash).
 * 2. Set x-html-lang for UZ routes.
 * TODO(cms): admin auth gate when Supabase admin is connected.
 */
export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

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
  const uzbek =
    pathname === "/uz" || pathname === "/uz/" || pathname.startsWith("/uz/");
  requestHeaders.set("x-html-lang", uzbek ? "uz" : "ru");

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  // Persist language preference between visits
  if (uzbek) {
    response.cookies.set("epos_locale", "uz", {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
  } else if (
    !pathname.startsWith("/api") &&
    !pathname.startsWith("/_next")
  ) {
    response.cookies.set("epos_locale", "ru", {
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
