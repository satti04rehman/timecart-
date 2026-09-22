/**
 * Lightweight in-memory rate limiter.
 * Serverless caveat: state is per-instance, so this is a speed bump, not a
 * hard guarantee. It still stops soak/spam on single warm instances and
 * slows enumeration. `ponytail:` upgrade path — move buckets to Postgres/KV
 * when a shared store is available.
 */

type Bucket = { count: number; resetAt: number };

const WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_ATTEMPTS = 5;

const buckets = new Map<string, Bucket>();
let lastGc = Date.now();

function getIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for") ?? "";
  return forwarded.split(",")[0].trim() || "unknown";
}

/**
 * Generic per-IP limiter for API routes. Returns the remaining count and
 * when the window resets.
 */
export function rateLimit(
  request: Request,
  scope: string,
  max: number,
  windowMs: number = WINDOW_MS
): { limited: boolean; remaining: number; retryAfterMs: number } {
  const now = Date.now();
  if (now - lastGc > windowMs) {
    for (const [key, b] of buckets) {
      if (b.resetAt < now) buckets.delete(key);
    }
    lastGc = now;
  }
  const key = `${scope}:${getIp(request)}`;
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { limited: false, remaining: max - 1, retryAfterMs: 0 };
  }
  bucket.count += 1;
  const limited = bucket.count > max;
  return {
    limited,
    remaining: Math.max(0, max - bucket.count),
    retryAfterMs: limited ? Math.max(0, bucket.resetAt - now) : 0,
  };
}

export function isRateLimited(key: string): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  bucket.count += 1;
  return bucket.count > MAX_ATTEMPTS;
}

export function clearRateLimit(key: string): void {
  buckets.delete(key);
}