import { NextRequest, NextResponse } from "next/server";
import { getKV } from "@/lib/kv";

/**
 * Get affiliate tracking statistics for a result
 *
 * Response includes:
 * - Click count
 * - Estimated earnings (based on network commissions)
 * - Click-through rate (CTR)
 * - Network breakdown
 */
export async function GET(req: NextRequest) {
  const resultId = req.nextUrl.searchParams.get("resultId");

  if (!resultId) {
    return NextResponse.json({ error: "resultId required" }, { status: 400 });
  }

  const kv = await getKV();
  if (!kv) {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }

  try {
    // Get affiliate click count
    const affiliateClicks = (await kv.get<number>(`result:${resultId}:affiliate_clicks`)) || 0;

    // Get share count for CTR calculation
    const shareCount = (await kv.get<number>(`result:${resultId}:shares`)) || 0;

    // Estimated earnings based on average commissions:
    // Amazon: 3% average
    // Higher commission networks would be tracked separately
    const estimatedAmazonEarnings = (affiliateClicks * 30 * 0.03).toFixed(2); // $30 avg product price
    const estimatedTotalEarnings = estimatedAmazonEarnings; // Can extend for other networks

    // Click-through rate
    const ctr = shareCount > 0 ? ((affiliateClicks / shareCount) * 100).toFixed(1) : "0.0";

    return NextResponse.json(
      {
        success: true,
        data: {
          resultId,
          affiliateClicks,
          shareCount,
          ctr: `${ctr}%`,
          estimatedEarnings: {
            amazon: `$${estimatedAmazonEarnings}`,
            total: `$${estimatedTotalEarnings}`,
          },
          lastUpdated: new Date().toISOString(),
        },
      },
      { headers: { "cache-control": "public, s-maxage=60" } }
    );
  } catch (error) {
    console.error("[affiliate-stats] Error:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
