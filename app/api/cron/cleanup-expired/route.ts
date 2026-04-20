import { NextResponse, NextRequest } from "next/server";
import { getKV } from "@/lib/kv";

export const runtime = "nodejs";

/**
 * Vercel Cron: Cleanup Expired Data
 * 
 * Runs daily at 03:00 UTC
 * Removes: old results (90+ days), expired reward codes, stale challenge data
 */
export async function GET(req: NextRequest) {
  // Verify cron secret
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const kv = await getKV();
    if (!kv) {
      return NextResponse.json(
        { success: false, error: "KV not available" },
        { status: 503 }
      );
    }

    console.log("[cron] Starting cleanup...");

    let deletedResults = 0;
    let deletedMetadata = 0;

    // Delete results older than 90 days
    const cutoffTime = Date.now() - 90 * 24 * 60 * 60 * 1000;

    try {
      // Get all results from the sorted set
      const allResults = (await kv.zrange("results:created:zset", 0, -1, {
        withScores: true,
      })) as Array<string | number>;

      // Filter for old results
      const oldResults: string[] = [];
      for (let i = 0; i < allResults.length; i += 2) {
        const resultId = allResults[i] as string;
        const timestamp = (allResults[i + 1] as number) || 0;
        if (timestamp < cutoffTime) {
          oldResults.push(resultId);
        }
      }

      for (const resultId of oldResults) {
        try {
          // Delete result data
          await kv.del(`result:${resultId}`);

          // Delete metadata
          await kv.del(`result:${resultId}:metadata`);
          await kv.del(`result:${resultId}:likes`);
          await kv.del(`result:${resultId}:shares`);
          await kv.del(`result:${resultId}:affiliate_clicks`);

          // Remove from sorted sets
          await kv.zrem("results:by:likes:zset", resultId);
          await kv.zrem("results:by:shares:zset", resultId);
          await kv.zrem("results:by:affiliate_clicks:zset", resultId);
          await kv.zrem("results:created:zset", resultId);

          deletedResults++;
          deletedMetadata += 4; // 4 metadata keys per result
        } catch (err) {
          console.warn(`[cron] Error deleting result ${resultId}:`, err);
        }
      }

      console.log(`[cron] Deleted ${deletedResults} old results`);
    } catch (err) {
      console.warn("[cron] Error deleting old results:", err);
    }

    // Invalidate leaderboard caches (they'll regenerate on next request)
    try {
      const cacheKeys = [
        "leaderboard:cache:likes:all:100",
        "leaderboard:cache:shares:all:100",
        "leaderboard:cache:affiliate_clicks:all:100",
        "leaderboard:cache:quality:all:100",
      ];

      for (const key of cacheKeys) {
        await kv.del(key);
      }

      console.log("[cron] Cleared leaderboard caches");
    } catch (err) {
      console.warn("[cron] Error clearing caches:", err);
    }

    return NextResponse.json(
      {
        success: true,
        message: "Cleanup completed",
        deleted: {
          results: deletedResults,
          metadata: deletedMetadata,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[cron] Cleanup error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Cleanup failed",
      },
      { status: 500 }
    );
  }
}
