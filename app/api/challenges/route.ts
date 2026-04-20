import { NextResponse, NextRequest } from "next/server";
import {
  getActiveChallenges,
  getUserChallengeProgress,
  getChallengeLeaderboard,
  updateUserChallengeProgress,
} from "@/lib/challenges";
import { z } from "zod";

export const runtime = "nodejs";
export const revalidate = 300; // ISR: revalidate every 5 minutes

const GetChallengesSchema = z.object({
  action: z.enum(["list", "progress", "leaderboard"]).optional(),
  challengeId: z.string().optional(),
  sessionId: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action");
    const challengeId = searchParams.get("challengeId");
    const sessionId = searchParams.get("sessionId");

    // Get active challenges
    if (action === "list" || !action) {
      const challenges = await getActiveChallenges();
      return NextResponse.json(
        {
          success: true,
          data: challenges,
          count: challenges.length,
          timestamp: new Date().toISOString(),
        },
        {
          status: 200,
          headers: {
            "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
          },
        }
      );
    }

    // Get user progress on specific challenge
    if (action === "progress" && challengeId && sessionId) {
      const progress = await getUserChallengeProgress(challengeId, sessionId);
      return NextResponse.json(
        {
          success: true,
          data: {
            challengeId,
            sessionId,
            progress,
          },
          timestamp: new Date().toISOString(),
        },
        { status: 200 }
      );
    }

    // Get challenge leaderboard
    if (action === "leaderboard" && challengeId) {
      const leaderboard = await getChallengeLeaderboard(challengeId, 100);
      return NextResponse.json(
        {
          success: true,
          data: leaderboard,
          count: leaderboard.length,
          timestamp: new Date().toISOString(),
        },
        {
          status: 200,
          headers: {
            "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
          },
        }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Invalid query parameters",
      },
      { status: 400 }
    );
  } catch (error) {
    console.error("[api/challenges] GET error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch challenges",
      },
      { status: 500 }
    );
  }
}

const UpdateProgressSchema = z.object({
  challengeId: z.string().min(1),
  sessionId: z.string().min(1),
  progress: z.number().min(0),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { challengeId, sessionId, progress } = UpdateProgressSchema.parse(body);

    // Update progress
    await updateUserChallengeProgress(challengeId, sessionId, progress);

    console.log(`[challenges] Updated progress: ${sessionId} | ${challengeId} = ${progress}`);

    return NextResponse.json(
      {
        success: true,
        message: "Progress updated",
        data: { challengeId, sessionId, progress },
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request",
          details: error.errors,
        },
        { status: 400 }
      );
    }

    console.error("[api/challenges] POST error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update challenge progress",
      },
      { status: 500 }
    );
  }
}
