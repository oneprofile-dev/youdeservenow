import { getABTestMetrics, getRunningTests } from "@/lib/abTesting";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const testId = searchParams.get("testId");

    if (testId) {
      // Get specific test metrics
      const result = await getABTestMetrics(testId);
      return Response.json(
        {
          success: true,
          ...result,
        },
        {
          headers: {
            "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
          },
        }
      );
    }

    // Get all running tests
    const tests = await getRunningTests();
    return Response.json(
      {
        success: true,
        tests,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
        },
      }
    );
  } catch (error) {
    console.error("A/B test fetch error:", error);
    return Response.json(
      { success: false, error: "Failed to fetch A/B test data" },
      { status: 500 }
    );
  }
}
