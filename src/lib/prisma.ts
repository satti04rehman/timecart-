import pg from "pg";
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

/**
 * Build a pg.Pool that can talk to Supabase.
 * The Supabase connection string includes `?sslmode=require`, which makes
 * node-postgres resolve the pool's self-signed proxy cert strictly. We strip
 * the query params and pass `rejectUnauthorized: false` explicitly instead.
 */
function buildPool(): pg.Pool {
  const raw = process.env.DATABASE_URL!;
  const url = new URL(raw);
  const isPooler = url.hostname.includes("pooler.supabase.com");
  url.search = "";
  if (isPooler) {
    // Use Supabase's transaction-mode pooler (port 6543) instead of the
    // session-mode pooler (5432). Session mode is capped at ~15 clients and
    // exhausts quickly on Vercel where each lambda opens its own pool.
    url.port = "6543";
  }
  const pool = new pg.Pool({
    connectionString: url.toString(),
    ssl: isPooler ? { rejectUnauthorized: false } : undefined,
    max: isPooler ? 8 : 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 20_000,
    maxUses: 10_000,
  });
  return pool;
}

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
  const adapter = new PrismaPg(buildPool());
  cachedClient = new PrismaClient({ adapter });
  return cachedClient;
}

export const prisma: PrismaClient = createClient();

/** Returns the real Prisma client, or null when no DB is configured. */
export function getPrismaClient(): PrismaClient | null {
  return process.env.DATABASE_URL ? prisma : null;
}