import { NextResponse, NextRequest } from "next/server";
import { incrementMetric } from "@/lib/leaderboards";
import { z } from "zod";

const TrackAffiliateClickSchema = z.object({
  resultId: z.string().min(1),
  productName: z.string().optional(),
  category: z.string().optional(),
  price: z.number().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { resultId, productName, category, price } = TrackAffiliateClickSchema.parse(body);

    // Track affiliate click
    await incrementMetric(resultId, "affiliate_clicks", category);

    // Log event with context
    console.log(
      `[track-affiliate] Click: ${resultId} | Product: ${productName} | Price: $${price || "N/A"}`
    );

    return NextResponse.json(
      {
        success: true,
        message: "Affiliate click tracked",
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

    console.error("[track-affiliate] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to track affiliate click",
      },
      { status: 500 }
    );
  }
}
