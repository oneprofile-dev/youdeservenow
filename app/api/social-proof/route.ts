import { getSocialProof } from "@/lib/viral";
import { getTotalDiagnoses } from "@/lib/db";

export async function GET() {
  try {
    const [proof, totalDiagnoses] = await Promise.all([
      getSocialProof(),
      getTotalDiagnoses(),
    ]);

    return Response.json(
      {
        success: true,
        totalDiagnoses,
        ...proof,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
        },
      }
    );
  } catch (error) {
    console.error("Social proof fetch error:", error);
    return Response.json(
      { success: false, error: "Failed to fetch social proof" },
      { status: 500 }
    );
  }
}
