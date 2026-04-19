// Shared Vercel KV client getter — used by db.ts and rate-limit.ts
export async function getKV() {
  if (!process.env.KV_REST_API_URL) return null;
  try {
    const { kv } = await import("@vercel/kv");
    return kv;
  } catch {
    return null;
  }
}
