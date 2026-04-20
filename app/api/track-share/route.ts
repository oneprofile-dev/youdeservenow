import { NextResponse, NextRequest } from "next/server";
import { incrementMetric } from "@/lib/leaderboards";
import { getResult } from "@/lib/db";
import { z } from "zod";

const TrackShareSchema = z.object({
  resultId: z.string().min(1),
  category: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { resultId, category } = TrackShareSchema.parse(body);

    // Track share
    await incrementMetric(resultId, "shares", category);

    // Log event
    console.log(`[track-share] Shared: ${resultId}`);

    return NextResponse.json(
      {
        success: true,
        message: "Share tracked",
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

    console.error("[track-share] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to track share",
      },
      { status: 500 }
    );
  }
}
