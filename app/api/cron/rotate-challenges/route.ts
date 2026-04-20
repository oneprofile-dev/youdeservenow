import { NextResponse, NextRequest } from "next/server";
import { generateWeeklyChallenges } from "@/lib/challenges";

export const runtime = "nodejs";

/**
 * Vercel Cron: Rotate Weekly Challenges
 * 
 * Runs every Monday at 00:00 UTC
 * Idempotent: Safe to call multiple times
 */
export async function GET(req: NextRequest) {
  // Verify cron secret (Vercel automatically provides this header)
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    console.log("[cron] Rotating challenges...");
    const challenges = await generateWeeklyChallenges();

    return NextResponse.json(
      {
        success: true,
        message: "Challenges rotated successfully",
        count: challenges.length,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[cron] Error rotating challenges:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to rotate challenges",
      },
      { status: 500 }
    );
  }
}
