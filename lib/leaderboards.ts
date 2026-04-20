import type { Result } from "./db";
import { getKV } from "./kv";

export interface LeaderboardEntry {
  id: string;
  rank: number;
  likes: number;
  shares: number;
  affiliateClicks: number;
  qualityScore: number;
  result?: Result;
}

export type LeaderboardSort = "likes" | "shares" | "affiliate_clicks" | "quality";
export type LeaderboardCategory = "all" | "comfort" | "tech" | "gag" | "experiences" | "self-care";
export type LeaderboardTimeframe = "week" | "month" | "all_time";

/**
 * Get top leaderboard entries sorted by metric
 * Aggressive caching: 60 seconds
 */
export async function getLeaderboard(
  sort: LeaderboardSort = "likes",
  category: LeaderboardCategory = "all",
  limit: number = 100
): Promise<LeaderboardEntry[]> {
  const kv = await getKV();
  if (!kv) return [];

  const cacheKey = `leaderboard:cache:${sort}:${category}:${limit}`;
  const cached = await kv.get<LeaderboardEntry[]>(cacheKey);
  if (cached) return cached;

  try {
    let sortKey = `results:by:${sort}:zset`;
    if (category !== "all") {
      sortKey = `results:by:${sort}:category:${category}:zset`;
    }

    const entries = (await kv.zrange(sortKey, 0, limit - 1, {
      withScores: true,
      rev: true, // Descending order (highest first)
    })) as Array<string | number>;

    const results: LeaderboardEntry[] = [];
    for (let i = 0; i < entries.length; i += 2) {
      const resultId = entries[i] as string;
      const score = (entries[i + 1] as number) || 0;

      const resultData = await kv.get<string>(`result:${resultId}`);
      let result: Result | undefined;
      if (resultData) {
        result = typeof resultData === "string" ? JSON.parse(resultData) : (resultData as Result);
      }

      results.push({
        id: resultId,
        rank: results.length + 1,
        likes: sort === "likes" ? score : await getMetric(kv, resultId, "likes"),
        shares: sort === "shares" ? score : await getMetric(kv, resultId, "shares"),
        affiliateClicks:
          sort === "affiliate_clicks" ? score : await getMetric(kv, resultId, "affiliate_clicks"),
        qualityScore:
          sort === "quality" ? score : await calculateQualityScore(kv, resultId),
        result,
      });
    }

    // Cache for 60 seconds
    await kv.setex(cacheKey, 60, JSON.stringify(results));
    return results;
  } catch (error) {
    console.error("[leaderboards] Error fetching leaderboard:", error);
    return [];
  }
}

/**
 * Get all categories with counts
 */
export async function getCategories(): Promise<Record<string, number>> {
  const kv = await getKV();
  if (!kv) return {};

  const categories: Record<string, number> = {};
  const categoryList = ["comfort", "tech", "gag", "experiences", "self-care"];

  for (const category of categoryList) {
    try {
      const count = await kv.zcard(`results:by:likes:category:${category}:zset`);
      categories[category] = count || 0;
    } catch {
      categories[category] = 0;
    }
  }

  return categories;
}

/**
 * Increment a metric for a result (likes, shares, affiliate_clicks)
 */
export async function incrementMetric(
  resultId: string,
  metric: "likes" | "shares" | "affiliate_clicks",
  category?: string
): Promise<void> {
  const kv = await getKV();
  if (!kv) return;

  try {
    // Increment in sorted set
    await kv.zincrby(`results:by:${metric}:zset`, 1, resultId);

    // Increment by category if provided
    if (category) {
      await kv.zincrby(`results:by:${metric}:category:${category}:zset`, 1, resultId);
    }

    // Store raw count separately for quick access
    const countKey = `result:${resultId}:${metric}`;
    await kv.incr(countKey);

    // Invalidate leaderboard cache
    await invalidateLeaderboardCache();
  } catch (error) {
    console.error(`[leaderboards] Error incrementing ${metric}:`, error);
  }
}

/**
 * Get a specific metric value for a result
 */
async function getMetric(
  kv: Awaited<ReturnType<typeof getKV>> | null,
  resultId: string,
  metric: string
): Promise<number> {
  if (!kv) return 0;
  try {
    const value = await kv.get<number>(`result:${resultId}:${metric}`);
    return value || 0;
  } catch {
    return 0;
  }
}

/**
 * Calculate quality score (weighted combination of metrics)
 * Formula: (likes * 0.5) + (shares * 1.0) + (affiliate_clicks * 2.0)
 */
async function calculateQualityScore(
  kv: Awaited<ReturnType<typeof getKV>> | null,
  resultId: string
): Promise<number> {
  if (!kv) return 0;
  const likes = await getMetric(kv, resultId, "likes");
  const shares = await getMetric(kv, resultId, "shares");
  const clicks = await getMetric(kv, resultId, "affiliate_clicks");

  return Math.round(likes * 0.5 + shares * 1.0 + clicks * 2.0);
}

/**
 * Invalidate all leaderboard caches
 */
async function invalidateLeaderboardCache(): Promise<void> {
  const kv = await getKV();
  if (!kv) return;

  const cacheKeys = [
    "leaderboard:cache:likes:all:100",
    "leaderboard:cache:shares:all:100",
    "leaderboard:cache:affiliate_clicks:all:100",
    "leaderboard:cache:quality:all:100",
  ];

  for (const key of cacheKeys) {
    try {
      await kv.del(key);
    } catch {
      // Ignore errors
    }
  }
}

/**
 * Get trending results for homepage teaser
 * Returns top 3 results trending this week
 */
export async function getTrendingResults(): Promise<LeaderboardEntry[]> {
  return getLeaderboard("quality", "all", 3);
}
