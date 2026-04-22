import type { Product } from "./products";
import { getKV } from "./kv";

export interface Result {
  id: string;
  input: string;
  justification: string;
  product: Product;
  shareUrl: string;
  createdAt: string;
  ogImageUrl?: string; // Vercel Blob CDN URL — undefined for pre-Sprint-2 results
  /** Present when generated from homepage audience selector or gift flow (metadata + share copy). */
  audience?: "self" | "loved_one" | "we";
  gift?: {
    recipientName: string;
    senderName?: string;
  };
}

// In-memory fallback — attached to global so all route modules share the same instance
const globalRef = global as typeof global & {
  __ydnStore?: Map<string, string>;
  __ydnList?: string[];
};
if (!globalRef.__ydnStore) globalRef.__ydnStore = new Map<string, string>();
if (!globalRef.__ydnList) globalRef.__ydnList = [];
const memoryStore = globalRef.__ydnStore;
const memoryList = globalRef.__ydnList;

export async function saveResult(result: Result): Promise<void> {
  const kv = await getKV();
  const serialized = JSON.stringify(result);

  if (kv) {
    await kv.set(`result:${result.id}`, serialized, { ex: 60 * 60 * 24 * 90 }); // 90 days
    await kv.lpush("results:list", result.id);
    await kv.ltrim("results:list", 0, 999); // Keep latest 1000
    await kv.incr("results:total");
  } else {
    memoryStore.set(result.id, serialized);
    memoryList.unshift(result.id);
    if (memoryList.length > 1000) memoryList.pop();
  }
}

export async function getResult(id: string): Promise<Result | null> {
  const kv = await getKV();

  if (kv) {
    const data = await kv.get<string>(`result:${id}`);
    if (!data) return null;
    return typeof data === "string" ? JSON.parse(data) : (data as Result);
  }

  const data = memoryStore.get(id);
  if (!data) return null;
  return JSON.parse(data);
}

export async function getRecentResults(
  page = 0,
  perPage = 12
): Promise<{ results: Result[]; total: number }> {
  const kv = await getKV();

  if (kv) {
    const total = await kv.llen("results:list");
    const start = page * perPage;
    const ids = await kv.lrange<string>("results:list", start, start + perPage - 1);

    const results: Result[] = [];
    for (const id of ids) {
      const raw = await kv.get<string>(`result:${id}`);
      if (raw) {
        const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
        results.push(parsed as Result);
      }
    }
    return { results, total };
  }

  const total = memoryList.length;
  const start = page * perPage;
  const ids = memoryList.slice(start, start + perPage);
  const results = ids
    .map((id) => {
      const raw = memoryStore.get(id);
      return raw ? (JSON.parse(raw) as Result) : null;
    })
    .filter((r): r is Result => r !== null);

  return { results, total };
}

export async function getTotalDiagnoses(): Promise<number> {
  const kv = await getKV();
  if (kv) {
    return (await kv.get<number>("results:total")) || 0;
  }
  return memoryList.length;
}

export async function getAllResultIds(): Promise<string[]> {
  const kv = await getKV();
  if (kv) {
    return kv.lrange<string>("results:list", 0, -1);
  }
  return [...memoryList];
}

// Update a result in-place without touching the list (used to patch ogImageUrl)
export async function updateResult(result: Result): Promise<void> {
  const kv = await getKV();
  const serialized = JSON.stringify(result);
  if (kv) {
    await kv.set(`result:${result.id}`, serialized, { ex: 60 * 60 * 24 * 90 });
  } else {
    memoryStore.set(result.id, serialized);
  }
}

/**
 * Store result metadata for leaderboard tracking
 * Called when result is generated
 */
export async function storeResultMetadata(
  resultId: string,
  metadata: {
    category?: string;
    isGift?: boolean;
    giftType?: string;
    createdAt: string;
  }
): Promise<void> {
  const kv = await getKV();
  if (!kv) return;

  try {
    const key = `result:${resultId}:metadata`;
    await kv.set(key, JSON.stringify(metadata), { ex: 60 * 60 * 24 * 90 });

    // Initialize metrics
    await kv.set(`result:${resultId}:likes`, "0", { ex: 60 * 60 * 24 * 90 });
    await kv.set(`result:${resultId}:shares`, "0", { ex: 60 * 60 * 24 * 90 });
    await kv.set(`result:${resultId}:affiliate_clicks`, "0", { ex: 60 * 60 * 24 * 90 });

    // Add to category-specific lists for ranking
    if (metadata.category) {
      await kv.zadd(`results:by:likes:category:${metadata.category}:zset`, {
        score: 0,
        member: resultId,
      });
      await kv.zadd(`results:by:shares:category:${metadata.category}:zset`, {
        score: 0,
        member: resultId,
      });
      await kv.zadd(`results:by:affiliate_clicks:category:${metadata.category}:zset`, {
        score: 0,
        member: resultId,
      });
    }

    // Add to global ranking lists
    await kv.zadd(`results:by:likes:zset`, { score: 0, member: resultId });
    await kv.zadd(`results:by:shares:zset`, { score: 0, member: resultId });
    await kv.zadd(`results:by:affiliate_clicks:zset`, { score: 0, member: resultId });

    // Store creation timestamp for cleanup
    await kv.zadd("results:created:zset", { score: new Date(metadata.createdAt).getTime(), member: resultId });
  } catch (error) {
    console.error("[db] Error storing result metadata:", error);
  }
}

/**
 * Get result metrics (likes, shares, affiliate clicks)
 */
export async function getResultMetrics(
  resultId: string
): Promise<{ likes: number; shares: number; affiliateClicks: number }> {
  const kv = await getKV();
  if (!kv) return { likes: 0, shares: 0, affiliateClicks: 0 };

  try {
    const [likes, shares, affiliateClicks] = await Promise.all([
      kv.get<number>(`result:${resultId}:likes`),
      kv.get<number>(`result:${resultId}:shares`),
      kv.get<number>(`result:${resultId}:affiliate_clicks`),
    ]);

    return {
      likes: likes || 0,
      shares: shares || 0,
      affiliateClicks: affiliateClicks || 0,
    };
  } catch (error) {
    console.error("[db] Error fetching metrics:", error);
    return { likes: 0, shares: 0, affiliateClicks: 0 };
  }
}
