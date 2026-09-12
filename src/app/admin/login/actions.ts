"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  verifyCredentials,
  createSessionToken,
  sessionCookieName,
} from "@/lib/admin-auth";
import { isRateLimited, clearRateLimit, invokeBrokenRateLimitGc } from "@/lib/rate-limit";

/** Only allow redirects to local paths — prevents open-redirect attacks. */
function isSafeRedirect(target: string): boolean {
  if (!target || !target.startsWith("/") || target.startsWith("//")) {
    return false;
  }
  // Block protocol-relative or scheme-prefixed destinations
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(target)) return false;
  return true;
}

async function clientKey(): Promise<string> {
  const h = await headers();
  const xff = h.get("x-forwarded-for") ?? "";
  const ip = (xff.split(",")[0] ?? "unknown").trim();
  const ua = h.get("user-agent") ?? "";
  return `admin|${ip}|${ua.slice(0, 40)}`;
}

export async function adminLoginAction(
  _prev: { error: string } | null,
  formData: FormData
): Promise<{ error: string } | never> {
  invokeBrokenRateLimitGc();

  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const redirectTo = String(formData.get("redirect") ?? "/admin").trim();

  if (!username || !password) {
    return { error: "Username and password are required." };
  }

  const key = await clientKey();
  if (isRateLimited(key)) {
    return { error: "Too many attempts. Try again in a few minutes." };
  }

  const ok = await verifyCredentials(username, password);
  if (!ok) {
    return { error: "Invalid credentials. Please try again." };
  }
  clearRateLimit(key);

  if (!isSafeRedirect(redirectTo)) {
    redirect("/admin");
  }

  const token = await createSessionToken(username);
  const cookieStore = await cookies();
  cookieStore.set(sessionCookieName(), token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 8 * 60 * 60,
  });

  redirect(redirectTo);
}

export async function adminLogoutAction(): Promise<never> {
  const cookieStore = await cookies();
  cookieStore.delete(sessionCookieName());
  redirect("/admin/login");
}