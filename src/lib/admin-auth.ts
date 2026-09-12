/**
 * Lightweight admin auth — bcrypt for passwords; tokens live in admin-token.ts
 * (Web-Crypto, Edge-safe) so middleware can verify signatures without bcrypt.
 *
 * Env vars:
 *   ADMIN_USERNAME   — default "admin"
 *   ADMIN_PASSWORD   — bcrypt hash OR plaintext (auto-detected)
 *   ADMIN_SECRET     — HMAC signing key (REQUIRED in production)
 */

import bcrypt from "bcryptjs";
import { createSessionToken, sessionCookieOptions } from "@/lib/admin-token";

const DEFAULT_USERNAME = "admin";
const DEFAULT_PASSWORD_HASH =
  "$2b$10$CTCoBEcbCA9aQW1RnjNi2eP3b20qQMb2b7sEcEe5f7yCOQIl9owxK"; // admin123

function adminUsername(): string {
  return process.env.ADMIN_USERNAME || DEFAULT_USERNAME;
}

function adminPasswordHash(): string {
  return process.env.ADMIN_PASSWORD || DEFAULT_PASSWORD_HASH;
}

/** Fail-closed: never allow the published default password in production. */
function usesDefaultPassword(): boolean {
  return !process.env.ADMIN_PASSWORD;
}

export async function verifyCredentials(
  username: string,
  password: string
): Promise<boolean> {
  if (process.env.NODE_ENV === "production" && usesDefaultPassword()) {
    return false;
  }
  const usernameMatches =
    username.length === adminUsername().length && username === adminUsername();

  if (!usernameMatches) return false;

  const hash = adminPasswordHash();
  if (hash.startsWith("$2")) {
    return bcrypt.compare(password, hash);
  }
  return password === hash && password.length > 0;
}

export { createSessionToken, sessionCookieOptions };
export { sessionCookieName } from "@/lib/admin-token";