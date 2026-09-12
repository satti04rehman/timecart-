import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isAdminTokenValid } from "@/lib/admin-token";

const COOKIE_NAME = "tc-admin-session";

// Lightweight middleware-side gate for admin sessions.
// Verifies the HMAC signature on tc-admin-session (not just its presence)
// so forged cookies are rejected, not just missing ones.
export async function updateSession(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isAdminRoute = path.startsWith("/admin");
  const isAdminApi = path.startsWith("/api/admin");
  const isLoginPage = path === "/admin/login";

  if (isAdminRoute || isAdminApi) {
    const rawToken = request.cookies.get(COOKIE_NAME)?.value ?? "";
    const verified = rawToken ? await isAdminTokenValid(rawToken) : false;

    if (isAdminApi) {
      if (!verified) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      return NextResponse.next({ request });
    }

    if (!verified) {
      if (!isLoginPage) {
        const url = request.nextUrl.clone();
        url.pathname = "/admin/login";
        url.searchParams.set("redirect", path);
        return NextResponse.redirect(url);
      }
      return NextResponse.next({ request });
    }

    if (isLoginPage) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin";
      url.search = "";
      return NextResponse.redirect(url);
    }
  }

  // ---- Supabase-backed flows (only when actually configured) ----
  const configured = supabaseConfigured();
  let supabaseResponse = NextResponse.next({ request });

  if (!configured) return supabaseResponse;

  // Fast path: requests without Supabase auth cookies can't be signed in, so
  // there's no token to refresh and the account gate needs no network round
  // trip — skip auth.getUser() for them (a large share of all traffic).
  const hasAuthCookies = request.cookies
    .getAll()
    .some(({ name }) => name.startsWith("sb-"));
  if (!hasAuthCookies) {
    if (path.startsWith("/account")) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("redirect", path);
      return NextResponse.redirect(url);
    }
    return supabaseResponse;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Account dashboard — requires authentication
  const requiresAuth =
    path.startsWith("/account") && path !== "/login" && path !== "/register";
  if (requiresAuth && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", path);
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

function supabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  return (
    url.startsWith("https://") &&
    url.includes("supabase.co") &&
    key.length >= 20
  );
}

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4|webm)$).*)",
  ],
};