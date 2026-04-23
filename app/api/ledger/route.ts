import { NextRequest, NextResponse } from "next/server";
import { getPublicLedgerResults, getResultMetrics } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic"; // This route uses dynamic search params
export const revalidate = 60; // Revalidate every 60 seconds for freshness

interface LedgerResponse {
  results: Array<{
    id: string;
    input: string;
    justification: string;
    product: {
      id: string;
      name: string;
      price: string;
      category: string;
      imageUrl: string;
    };
    createdAt: string;
    metrics?: {
      likes: number;
      shares: number;
    };
  }>;
  total: number;
  page: number;
  perPage: number;
  hasMore: boolean;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(0, parseInt(searchParams.get("page") || "0"));
    const perPage = Math.min(24, Math.max(1, parseInt(searchParams.get("perPage") || "12")));
    const sortBy = (searchParams.get("sort") || "fresh") as "fresh" | "trending";

    // Fetch public results
    const { results, total } = await getPublicLedgerResults(page, perPage, sortBy);

    // Enrich with metrics (parallel requests for performance)
    const enrichedResults = await Promise.all(
      results.map(async (result) => {
        const metrics = await getResultMetrics(result.id);
        return {
          id: result.id,
          input: result.input,
          justification: result.justification,
          product: {
            id: result.product.id,
            name: result.product.name,
            price: result.product.price,
            category: result.product.category,
            imageUrl: result.product.imageUrl,
          },
          createdAt: result.createdAt,
          metrics,
        };
      })
    );

    const response: LedgerResponse = {
      results: enrichedResults,
      total,
      page,
      perPage,
      hasMore: page * perPage + perPage < total,
    };

    return NextResponse.json(response, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      },
    });
  } catch (error) {
    console.error("[API] Error fetching public ledger:", error);
    return NextResponse.json(
      { error: "Failed to fetch ledger" },
      { status: 500 }
    );
  }
}
