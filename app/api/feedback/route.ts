import { submitFeedback } from "@/lib/feedback";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, type, message, email } = body;

    if (!userId || !type || !message) {
      return Response.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const feedback = await submitFeedback(userId, type, message, email);

    return Response.json({
      success: true,
      feedback,
    });
  } catch (error) {
    console.error("Feedback submission error:", error);
    return Response.json(
      { success: false, error: "Failed to submit feedback" },
      { status: 500 }
    );
  }
}
