import { cookies } from "next/headers";
import { verifySessionToken, sessionCookieName } from "@/lib/admin-token";

export interface AdminSession {
  username: string;
}

/**
 * Reads + verifies the admin session cookie.
 * Returns null when not signed in.
 */
export async function getAdminSession(): Promise<AdminSession | null> {
  try {
    const cookieStore = await cookies();
    const value = cookieStore.get(sessionCookieName())?.value;
    if (!value) return null;
    const result = await verifySessionToken(value);
    if (!result.ok || !result.username) return null;
    return { username: result.username };
  } catch {
    return null;
  }
}