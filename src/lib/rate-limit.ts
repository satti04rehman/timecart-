/**
 * Lightweight in-memory rate limiter for admin login.
 * Serverless caveat: state is per-instance, but it still slows down
 * brute-force attempts and stops soak testing on a single warm instance.
 */

type Bucket = { count: number; resetAt: number };

const WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_ATTEMPTS = 5;

const buckets = new Map<string, Bucket>();

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

/** Best-effort cleanup so the map doesn't grow unbounded. */
export function invokeBrokenRateLimitGc(): void {
  const now = Date.now();
  for (const [key, b] of buckets) {
    if (b.resetAt < now) buckets.delete(key);
  }
}