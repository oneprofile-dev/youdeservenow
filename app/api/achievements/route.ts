import { getUserBadges } from "@/lib/premiumTiers";

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

    const badges = await getUserBadges(userId);

    return Response.json(
      {
        success: true,
        badges,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      }
    );
  } catch (error) {
    console.error("Achievements fetch error:", error);
    return Response.json(
      { success: false, error: "Failed to fetch achievements" },
      { status: 500 }
    );
  }
}
