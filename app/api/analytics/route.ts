import { getAnalyticsSnapshot } from "@/lib/analytics";

export const revalidate = 60; // Cache for 1 minute

export async function GET() {
  try {
    const snapshot = await getAnalyticsSnapshot();

    return Response.json(
      {
        success: true,
        timestamp: snapshot.timestamp,
        metrics: {
          engagement: snapshot.engagement,
          conversion: snapshot.conversion,
          revenue: snapshot.revenue,
          performance: snapshot.performance,
        },
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
        },
      }
    );
  } catch (error) {
    console.error("Analytics error:", error);
    return Response.json(
      { success: false, error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
