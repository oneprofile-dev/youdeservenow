import { getSocialProof, calculateViralCoefficient } from "@/lib/viral";

export async function GET() {
  try {
    const proof = await getSocialProof();

    return Response.json(
      {
        success: true,
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
