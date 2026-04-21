import { getKV } from "./kv";

// In-memory fallback for local dev; Vercel KV used in production
const memoryStore = new Map<string, { count: number; resetAt: number }>();

const MAX_REQUESTS = 5;
const WINDOW_MS = 60_000; // 1 minute

// Generic rate limiter — use for any endpoint with custom limits
export async function checkRateLimitCustom(
  key: string,
  max: number,
  windowSeconds: number
): Promise<{ allowed: boolean; remaining: number }> {
  const kv = await getKV();

  if (kv) {
    const current = await kv.incr(key);
    if (current === 1) await kv.expire(key, windowSeconds);
    const remaining = Math.max(0, max - current);
    return { allowed: current <= max, remaining };
  }

  // In-memory fallback
  const now = Date.now();
  const entry = memoryStore.get(key);
  if (!entry || now > entry.resetAt) {
    memoryStore.set(key, { count: 1, resetAt: now + windowSeconds * 1000 });
    return { allowed: true, remaining: max - 1 };
  }
  entry.count += 1;
  return { allowed: entry.count <= max, remaining: Math.max(0, max - entry.count) };
}

export async function checkRateLimit(ip: string): Promise<{ allowed: boolean; remaining: number }> {
  const key = `rl:${ip}`;
  const kv = await getKV();

  if (kv) {
    const current = await kv.incr(key);
    if (current === 1) {
      await kv.expire(key, 60);
    }
    const remaining = Math.max(0, MAX_REQUESTS - current);
    return { allowed: current <= MAX_REQUESTS, remaining };
  }

  // In-memory fallback
  const now = Date.now();
  const entry = memoryStore.get(key);

  if (!entry || now > entry.resetAt) {
    memoryStore.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, remaining: MAX_REQUESTS - 1 };
  }

  entry.count += 1;
  const remaining = Math.max(0, MAX_REQUESTS - entry.count);
  return { allowed: entry.count <= MAX_REQUESTS, remaining };
}

// Circuit breaker: tracks daily AI call attempts globally.
// At 80% of the configured limit, stops calling AI and serves hardcoded fallbacks.
// Resets automatically via KV TTL (25-hour window covers timezone drift).
export async function trackAiCall(): Promise<{ tripped: boolean }> {
  const kv = await getKV();
  if (!kv) return { tripped: false }; // Never trip in local dev (no persistent counter)

  const limit = parseInt(process.env.CIRCUIT_BREAKER_DAILY_LIMIT ?? "100", 10);
  const threshold = Math.floor(limit * 0.8);
  const key = `circuit:ai:${new Date().toISOString().slice(0, 10)}`; // YYYY-MM-DD UTC

  const count = await kv.incr(key);
  if (count === 1) {
    await kv.expire(key, 60 * 60 * 25); // 25-hour TTL
  }

  if (count >= threshold) {
    console.warn(`[CircuitBreaker] AI calls at ${count}/${limit} (threshold ${threshold}) — static mode`);
    return { tripped: true };
  }
  return { tripped: false };
}
