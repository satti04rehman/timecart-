import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "@/generated/prisma/client";

/**
 * Lazy Prisma client.
 *
 * During `next build` on Vercel the DATABASE_URL may not be set yet.
 * Previously this module *threw* at import-time, which killed the
 * entire build.  Now we return a harmless proxy that lets every page
 * build successfully; isDbReady() short-circuits before the proxy is
 * ever called, so the app gracefully falls back to demo data.
 */

let cachedClient: PrismaClient | null = null;

function createClient(): PrismaClient {
  if (!process.env.DATABASE_URL) {
    // Type-safe dummy — every property access throws.
    // No call site will reach this in normal flow because isDbReady
    // returns false first and demo fallback is used.
    return new Proxy({} as PrismaClient, {
      get(_target, prop) {
        if (prop === Symbol.toPrimitive || prop === "then") return undefined;
        throw new Error(
          "Database not configured — running in demo mode."
        );
      },
    });
  }
  if (cachedClient) return cachedClient;
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  });
  cachedClient = new PrismaClient({ adapter });
  return cachedClient;
}

export const prisma: PrismaClient = createClient();

/** Returns the real Prisma client, or null when no DB is configured. */
export function getPrismaClient(): PrismaClient | null {
  return process.env.DATABASE_URL ? prisma : null;
}