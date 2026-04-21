import { generateReferralLink, getReferralStats } from "@/lib/viral";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return Response.json(
        { success: false, error: "Missing userId" },
        { status: 400 }
      );
    }

    const link = await generateReferralLink(userId);

    return Response.json({
      success: true,
      link,
      referralUrl: `${process.env.VERCEL_URL || "https://youdeservenow.com"}?ref=${link.code}`,
    });
  } catch (error) {
    console.error("Referral link generation error:", error);
    return Response.json(
      { success: false, error: "Failed to generate referral link" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return Response.json(
        { success: false, error: "Missing userId" },
        { status: 400 }
      );
    }

    const stats = await getReferralStats(userId);

    return Response.json(
      {
        success: true,
        stats,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      }
    );
  } catch (error) {
    console.error("Referral stats fetch error:", error);
    return Response.json(
      { success: false, error: "Failed to fetch referral stats" },
      { status: 500 }
    );
  }
}
