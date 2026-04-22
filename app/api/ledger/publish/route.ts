import { NextRequest, NextResponse } from "next/server";
import { setResultPublic, getResult } from "@/lib/db";
import { track } from "@vercel/analytics/react";

export const runtime = "nodejs";

interface PublishRequest {
  resultId: string;
  isPublic: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const body: PublishRequest = await request.json();
    const { resultId, isPublic } = body;

    // Validate input
    if (!resultId || typeof resultId !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid resultId" },
        { status: 400 }
      );
    }

    // Verify result exists
    const result = await getResult(resultId);
    if (!result) {
      return NextResponse.json(
        { error: "Result not found" },
        { status: 404 }
      );
    }

    // Update public status
    await setResultPublic(resultId, isPublic);

    return NextResponse.json({
      success: true,
      resultId,
      isPublic,
      shareUrl: isPublic
        ? `${process.env.NEXT_PUBLIC_BASE_URL}/result/${resultId}?ledger=1`
        : `${process.env.NEXT_PUBLIC_BASE_URL}/result/${resultId}`,
    });
  } catch (error) {
    console.error("[API] Error updating result publish status:", error);
    return NextResponse.json(
      { error: "Failed to update publish status" },
      { status: 500 }
    );
  }
}
