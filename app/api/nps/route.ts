import { submitNPS, getNPSScore } from "@/lib/feedback";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, score, feedback } = body;

    if (userId === undefined || score === undefined) {
      return Response.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (score < 0 || score > 10) {
      return Response.json(
        { success: false, error: "Score must be between 0 and 10" },
        { status: 400 }
      );
    }

    const survey = await submitNPS(userId, score, feedback);

    return Response.json({
      success: true,
      survey,
    });
  } catch (error) {
    console.error("NPS submission error:", error);
    return Response.json(
      { success: false, error: "Failed to submit NPS score" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const npsData = await getNPSScore();

    return Response.json(
      {
        success: true,
        ...npsData,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
        },
      }
    );
  } catch (error) {
    console.error("NPS fetch error:", error);
    return Response.json(
      { success: false, error: "Failed to fetch NPS score" },
      { status: 500 }
    );
  }
}
