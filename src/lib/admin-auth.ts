/**
 * Lightweight admin auth — zero extra deps beyond bcryptjs.
 *
 * Token format:  base64url(payload) . hex(hmac-sha256)
 * Payload:       { u: username, e: expiryMs }
 *
 * Cookie:        tc-admin-session
 * Env vars (optional):
 *   ADMIN_USERNAME   — default "admin"
 *   ADMIN_PASSWORD   — bcrypt hash OR plaintext (auto-detected)
 *   ADMIN_SECRET     — HMAC signing key (random if omitted)
 */

import bcrypt from "bcryptjs";

/* ── Config ─────────────────────────────────────────────────── */

const COOKIE_NAME = "tc-admin-session";
const SESSION_TTL_MS = 8 * 60 * 60 * 1000; // 8 hours

const DEFAULT_USERNAME = "admin";
const DEFAULT_PASSWORD_HASH =
  "$2b$10$CTCoBEcbCA9aQW1RnjNi2eP3b20qQMb2b7sEcEe5f7yCOQIl9owxK"; // admin123

function adminUsername(): string {
  return process.env.ADMIN_USERNAME || DEFAULT_USERNAME;
}

function adminPasswordHash(): string {
  return process.env.ADMIN_PASSWORD || DEFAULT_PASSWORD_HASH;
}

function signingSecret(): string {
  // In production this MUST be set in .env.local
  return process.env.ADMIN_SECRET || "timecart-dev-admin-secret-do-not-use-in-prod";
}

/* ── Password check ─────────────────────────────────────────── */

export async function verifyCredentials(
  username: string,
  password: string
): Promise<boolean> {
  if (username !== adminUsername()) return false;

  const hash = adminPasswordHash();
  // If the stored value looks like a bcrypt hash, compare properly.
  if (hash.startsWith("$2")) {
    return bcrypt.compare(password, hash);
  }
  // Otherwise treat it as a plaintext fallback (dev only).
  return password === hash;
}

/* ── HMAC-SHA-256 signing  (Web-Crypto — works in Edge) ─────── */

function toBase64Url(data: Uint8Array): string {
  return btoa(String.fromCharCode(...data))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function fromBase64Url(s: string): Uint8Array {
  let b = s.replace(/-/g, "+").replace(/_/g, "/");
  while (b.length % 4) b += "=";
  const bin = atob(b);
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

async function getKey(secret: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  return crypto.subtle.importKey(
    "raw",
    enc.encode(secret).buffer as ArrayBuffer,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

function payload(u: string, e: number): string {
  return `${u}|${e}`;
}

export async function createSessionToken(username: string): Promise<string> {
  const now = Date.now();
  const exp = now + SESSION_TTL_MS;
  const p = payload(username, exp);
  const key = await getKey(signingSecret());
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(p).buffer as ArrayBuffer
  );
  return `${toBase64Url(new TextEncoder().encode(p))}.${toBase64Url(new Uint8Array(sig))}`;
}

export async function verifySessionToken(
  token: string
): Promise<{ ok: boolean; username?: string }> {
  try {
    const [payloadB64, sigB64] = token.split(".");
    if (!payloadB64 || !sigB64) return { ok: false };

    const pBytes = fromBase64Url(payloadB64);
    const sigBytes = fromBase64Url(sigB64);

    const key = await getKey(signingSecret());
    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      sigBytes.buffer as ArrayBuffer,
      pBytes.buffer as ArrayBuffer
    );
    if (!valid) return { ok: false };

    const p = new TextDecoder().decode(pBytes);
    const [u, expStr] = p.split("|");
    const exp = Number(expStr);
    if (!u || isNaN(exp) || Date.now() > exp) return { ok: false };

    return { ok: true, username: u };
  } catch {
    return { ok: false };
  }
}

/* ── Cookie helpers (used in Server Actions / Route Handlers) ── */

export function sessionCookieName(): string {
  return COOKIE_NAME;
}

export function sessionCookieOptions(): string {
  const isProd = process.env.NODE_ENV === "production";
  return [
    `${COOKIE_NAME}=`,
    "Path=/",
    "HttpOnly",
    isProd ? "Secure" : "",
    "SameSite=Lax",
    `Max-Age=${Math.floor(SESSION_TTL_MS / 1000)}`,
  ]
    .filter(Boolean)
    .join("; ");
}
