import { kv } from "@vercel/kv";

// In-memory fallback for local dev (no KV credentials)
const localCache = new Map<string, { value: string; expires: number }>();
const useKV =
  process.env.KV_ENABLED === "true" &&
  Boolean(process.env.KV_REST_API_URL) &&
  !process.env.KV_REST_API_URL?.includes("your-upstash-url");

export async function getCache<T>(key: string): Promise<T | null> {
  if (useKV) {
    try {
      const val = await kv.get<T>(key);
      return val ?? null;
    } catch (error) {
      console.error("KV get error:", error);
      return null;
    }
  }

  // Local fallback
  const entry = localCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expires) {
    localCache.delete(key);
    return null;
  }
  return JSON.parse(entry.value) as T;
}

export async function setCache(
  key: string,
  value: unknown,
  ttlSeconds: number
): Promise<void> {
  if (useKV) {
    try {
      await kv.setex(key, ttlSeconds, JSON.stringify(value));
      return;
    } catch (error) {
      console.error("KV set error:", error);
    }
  }

  // Local fallback
  localCache.set(key, {
    value: JSON.stringify(value),
    expires: Date.now() + ttlSeconds * 1000,
  });
}
