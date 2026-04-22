import { NextRequest, NextResponse } from "next/server";
import { getKV } from "@/lib/kv";

export const runtime = "nodejs";

interface UpvoteRequest {
  resultId: string;
  action: "upvote" | "remove";
}

/**
 * Handle upvoting on ledger results
 * Uses a simple counter + set to track unique voters (per session)
 */
export async function POST(request: NextRequest) {
  try {
    const body: UpvoteRequest = await request.json();
    const { resultId, action } = body;

    // Validate input
    if (!resultId || typeof resultId !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid resultId" },
        { status: 400 }
      );
    }

    if (!["upvote", "remove"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action" },
        { status: 400 }
      );
    }

    const kv = await getKV();
    if (!kv) {
      return NextResponse.json(
        { error: "Database unavailable" },
        { status: 503 }
      );
    }

    const likeKey = `result:${resultId}:likes`;
    const votersKey = `result:${resultId}:voters`;

    // Get visitor ID from cookie (for deduplication)
    const visitorId = request.cookies.get("visitor_id")?.value ||
      `anonymous-${Date.now()}-${Math.random()}`;

    if (action === "upvote") {
      // Check if this visitor already upvoted
      const alreadyVoted = await kv.sismember(votersKey, visitorId);

      if (alreadyVoted) {
        // Already voted - return current count
        const likes = (await kv.get<number>(likeKey)) || 0;
        return NextResponse.json({
          success: true,
          action: "already_upvoted",
          resultId,
          likes,
        });
      }

      // Add visitor to set and increment counter
      await Promise.all([
        kv.incr(likeKey),
        kv.sadd(votersKey, visitorId),
        kv.expire(votersKey, 60 * 60 * 24 * 30), // 30 days
      ]);

      const likes = (await kv.get<number>(likeKey)) || 1;

      return NextResponse.json({
        success: true,
        action: "upvoted",
        resultId,
        likes,
      });
    } else {
      // Remove upvote
      const wasVoter = await kv.sismember(votersKey, visitorId);

      if (!wasVoter) {
        // Wasn't voted - return current count
        const likes = (await kv.get<number>(likeKey)) || 0;
        return NextResponse.json({
          success: true,
          action: "not_voted",
          resultId,
          likes,
        });
      }

      // Remove voter and decrement counter
      await Promise.all([
        kv.decr(likeKey),
        kv.srem(votersKey, visitorId),
      ]);

      const likes = Math.max(0, (await kv.get<number>(likeKey)) || 0);

      return NextResponse.json({
        success: true,
        action: "removed",
        resultId,
        likes,
      });
    }
  } catch (error) {
    console.error("[API] Error handling upvote:", error);
    return NextResponse.json(
      { error: "Failed to process upvote" },
      { status: 500 }
    );
  }
}

/**
 * Get current like count for a result
 */
export async function GET(request: NextRequest) {
  try {
    const resultId = request.nextUrl.searchParams.get("resultId");

    if (!resultId) {
      return NextResponse.json(
        { error: "Missing resultId" },
        { status: 400 }
      );
    }

    const kv = await getKV();
    if (!kv) {
      return NextResponse.json({ likes: 0 });
    }

    const likes = (await kv.get<number>(`result:${resultId}:likes`)) || 0;

    return NextResponse.json({ resultId, likes }, {
      headers: {
        "Cache-Control": "public, max-age=10, stale-while-revalidate=30",
      },
    });
  } catch (error) {
    console.error("[API] Error fetching likes:", error);
    return NextResponse.json({ likes: 0 });
  }
}
