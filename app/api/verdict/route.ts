import { NextRequest, NextResponse } from "next/server";
import { getKV } from "@/lib/kv";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const resultId = searchParams.get("id");

    if (!resultId) {
      return NextResponse.json(
        { error: "Missing resultId parameter" },
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

    // Fetch result from KV - try multiple possible keys
    // First try direct result key
    let result = await kv.get(`result:${resultId}`);

    // If not found, try searching in results:all sorted set
    if (!result) {
      // Get all results and find by id (fallback)
      const allResults = await kv.zrange("results:all", 0, -1, { withScores: false });
      result = allResults.find((r: any) => r?.id === resultId);
    }

    if (!result) {
      return NextResponse.json(
        { error: "Result not found", resultId },
        { status: 404 }
      );
    }

    // Fetch vote counts
    const likes = (await kv.get<number>(`result:${resultId}:likes`)) || 0;
    const gaslights = (await kv.get<number>(`result:${resultId}:gaslights`)) || 0;

    // Track this verdict view
    try {
      await kv.incr(`result:${resultId}:views`);
    } catch (e) {
      // Silently fail on view count update
    }

    return NextResponse.json({
      success: true,
      result,
      legit: likes,
      gaslight: gaslights,
      total: likes + gaslights,
      legitimacy: likes + gaslights > 0 ? Math.round((likes / (likes + gaslights)) * 100) : 50,
    });
  } catch (error) {
    console.error("[verdict] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
