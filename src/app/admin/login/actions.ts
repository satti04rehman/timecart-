"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  verifyCredentials,
  createSessionToken,
  sessionCookieName,
} from "@/lib/admin-auth";

export async function adminLoginAction(
  _prev: { error: string } | null,
  formData: FormData
): Promise<{ error: string } | never> {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const redirectTo = String(formData.get("redirect") ?? "/admin").trim();

  if (!username || !password) {
    return { error: "Username and password are required." };
  }

  const ok = await verifyCredentials(username, password);
  if (!ok) {
    return { error: "Invalid credentials. Please try again." };
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
