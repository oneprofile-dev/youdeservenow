import { NextResponse, NextRequest } from "next/server";
import {
  getLeaderboard,
  getTrendingResults,
  getCategories,
  type LeaderboardSort,
  type LeaderboardCategory,
} from "@/lib/leaderboards";
import { getKV } from "@/lib/kv";

export const runtime = "nodejs";
export const dynamic = "force-dynamic"; // This route uses query params, must be dynamic
export const revalidate = 60; // ISR: revalidate every 60 seconds

export async function GET(req: NextRequest) {
  try {
    // Support "legit" (maps to "likes") and "challenged" (custom sort by gaslights)
    const sortParam = (req.nextUrl.searchParams.get("sort") as string) || "legit";
    const sort: LeaderboardSort = sortParam === "challenged" ? "likes" : "likes"; // Map both to likes for now, we'll handle challenged separately
    const category = (req.nextUrl.searchParams.get("category") as LeaderboardCategory) || "all";
    const limit = Math.min(parseInt(req.nextUrl.searchParams.get("limit") || "100"), 500); // Max 500
    const action = req.nextUrl.searchParams.get("action");
    const resultId = req.nextUrl.searchParams.get("resultId");

    // Trending results for homepage
    if (action === "trending") {
      const trending = await getTrendingResults();
      return NextResponse.json({
        success: true,
        data: trending,
        timestamp: new Date().toISOString(),
      });
    }

    // Categories with counts
    if (action === "categories") {
      const categories = await getCategories();
      return NextResponse.json({
        success: true,
        data: categories,
        timestamp: new Date().toISOString(),
      });
    }

    // Main leaderboard query - handle challenged sort
    let leaderboard = await getLeaderboard(sort, category, 500);

    // If "challenged" sort, fetch gaslights and re-sort
    if (sortParam === "challenged") {
      const kv = await getKV();
      if (kv) {
        // Enrich with gaslight counts and re-sort
        const enrichedLeaderboard = await Promise.all(
          leaderboard.map(async (entry) => {
            const gaslights = (await kv.get<number>(`result:${entry.id}:gaslights`)) || 0;
            return {
              ...entry,
              gaslightCount: gaslights,
            };
          })
        );

        // Sort by gaslight count (descending)
        leaderboard = enrichedLeaderboard.sort((a, b) => (b.gaslightCount || 0) - (a.gaslightCount || 0));
      }
    }

    // If resultId is provided, find its rank and return
    if (resultId) {
      const entry = leaderboard.find((item) => item.id === resultId);
      if (entry) {
        return NextResponse.json(
          {
            success: true,
            data: [entry], // Return just this entry with its rank
            timestamp: new Date().toISOString(),
          },
          {
            status: 200,
            headers: {
              "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
            },
          }
        );
      }
      // If not found in top 500, return empty array
      return NextResponse.json(
        {
          success: true,
          data: [],
          timestamp: new Date().toISOString(),
        },
        {
          status: 200,
          headers: {
            "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
          },
        }
      );
    }

    // Main leaderboard query
    const paginatedLeaderboard = leaderboard.slice(0, limit);

    return NextResponse.json(
      {
        success: true,
        data: paginatedLeaderboard,
        metadata: {
          sort: sortParam,
          category,
          limit,
          count: paginatedLeaderboard.length,
        },
        timestamp: new Date().toISOString(),
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
        },
      }
    );
  } catch (error) {
    console.error("[api/leaderboards] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch leaderboards",
      },
      { status: 500 }
    );
  }
}
