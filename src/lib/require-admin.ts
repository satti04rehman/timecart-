import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { sessionCookieName } from "@/lib/admin-token";
import { verifySessionToken } from "@/lib/admin-token";

/**
 * Guards API route handlers. Returns a 401 response when the request
 * is not an authenticated admin; returns null when it is.
 */
export async function requireAdmin(): Promise<{
  response?: NextResponse;
  username?: string;
}> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(sessionCookieName())?.value;
    if (!token) {
      return { response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
    }
    const result = await verifySessionToken(token);
    if (!result.ok || !result.username) {
      return { response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
    }
    return { username: result.username };
  } catch {
    return { response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
}