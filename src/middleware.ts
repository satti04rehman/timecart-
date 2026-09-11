import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const COOKIE_NAME = "tc-admin-session";

// Lightweight middleware-side gate for demo/admin sessions.
// A real Supabase deployment should keep using the Supabase branch below;
// demo mode falls back to the local signed cookie (see admin-auth.ts).
export async function updateSession(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // ---- Demo-local admin auth (works with or without Supabase) ----
  if (path.startsWith("/admin")) {
    const hasSession =
      request.cookies.has(COOKIE_NAME) && request.cookies.get(COOKIE_NAME)?.value;

    const isLoginPage = path === "/admin/login";

    if (!hasSession) {
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