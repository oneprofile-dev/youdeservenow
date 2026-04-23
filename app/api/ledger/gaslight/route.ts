import { NextRequest, NextResponse } from "next/server";
import { getKV } from "@/lib/kv";

export const runtime = "nodejs";

interface GaslightRequest {
  resultId: string;
  action: "gaslight" | "remove";
}

/**
 * Handle "gaslight" votes (challenges) on ledger results
 * Similar to upvote but tracks challenges instead
 */
export async function POST(request: NextRequest) {
  try {
    const body: GaslightRequest = await request.json();
    const { resultId, action } = body;

    // Validate input
    if (!resultId || typeof resultId !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid resultId" },
        { status: 400 }
      );
    }

    if (!["gaslight", "remove"].includes(action)) {
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

    const gaslightKey = `result:${resultId}:gaslights`;
    const challengersKey = `result:${resultId}:challengers`;

    // Get visitor ID from cookie (for deduplication)
    const visitorId = request.cookies.get("visitor_id")?.value ||
      `anonymous-${Date.now()}-${Math.random()}`;

    if (action === "gaslight") {
      // Check if this visitor already voted
      const alreadyVoted = await kv.sismember(challengersKey, visitorId);

      if (alreadyVoted) {
        // Already voted - return current count
        const gaslights = (await kv.get<number>(gaslightKey)) || 0;
        return NextResponse.json({
          success: true,
          action: "already_gaslighted",
          resultId,
          gaslights,
        });
      }

      // Add visitor to set and increment counter
      await Promise.all([
        kv.incr(gaslightKey),
        kv.sadd(challengersKey, visitorId),
        kv.expire(challengersKey, 60 * 60 * 24 * 30), // 30 days
      ]);

      const gaslights = (await kv.get<number>(gaslightKey)) || 1;

      return NextResponse.json({
        success: true,
        action: "gaslighted",
        resultId,
        gaslights,
      });
    } else {
      // Remove gaslight vote
      const alreadyVoted = await kv.sismember(challengersKey, visitorId);

      if (!alreadyVoted) {
        // Never voted - return current count
        const gaslights = (await kv.get<number>(gaslightKey)) || 0;
        return NextResponse.json({
          success: true,
          action: "never_voted",
          resultId,
          gaslights,
        });
      }

      // Remove visitor from set and decrement counter
      const gaslights = Math.max(0, ((await kv.get<number>(gaslightKey)) || 1) - 1);

      await Promise.all([
        kv.set(gaslightKey, gaslights),
        kv.srem(challengersKey, visitorId),
      ]);

      return NextResponse.json({
        success: true,
        action: "removed",
        resultId,
        gaslights,
      });
    }
  } catch (error) {
    console.error("[gaslight] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
