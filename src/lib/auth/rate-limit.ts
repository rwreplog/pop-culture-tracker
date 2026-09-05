const WINDOW_MS = 60_000;
const MAX_ATTEMPTS = 5;

type Bucket = { count: number; resetAt: number };

/**
 * Process-local, in-memory login-attempt tracker. Blunts casual credential
 * stuffing against a single instance; does not survive restarts or scale
 * across multiple instances (acceptable at current single-instance scale).
 */
const attempts = new Map<string, Bucket>();

export function isRateLimited(key: string): boolean {
  const bucket = attempts.get(key);
  if (!bucket || Date.now() > bucket.resetAt) return false;
  return bucket.count >= MAX_ATTEMPTS;
}

export function recordFailedAttempt(key: string): void {
  const now = Date.now();
  const bucket = attempts.get(key);
  if (!bucket || now > bucket.resetAt) {
    attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return;
  }
  bucket.count += 1;
}
