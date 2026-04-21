import { getUserTier } from "@/lib/premiumTiers";
import { kv } from "@vercel/kv";

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

    const tier = await getUserTier(userId);
    const points = (await kv.get<number>(`user:${userId}:points`)) || 0;

    return Response.json(
      {
        success: true,
        tier,
        points,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      }
    );
  } catch (error) {
    console.error("Tier fetch error:", error);
    return Response.json(
      { success: false, error: "Failed to fetch tier" },
      { status: 500 }
    );
  }
}
