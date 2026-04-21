import { NextRequest, NextResponse } from "next/server";
import { getProductsByCategory, getAllCategories } from "@/lib/products";

export const revalidate = 3600; // ISR: revalidate every 1 hour

export async function GET(req: NextRequest) {
  const category = req.nextUrl.searchParams.get("category") ?? "all";

  const validCategories = ["all", ...getAllCategories()];
  if (!validCategories.includes(category)) {
    return NextResponse.json(
      { error: `Invalid category. Valid options: ${validCategories.join(", ")}` },
      { status: 400 }
    );
  }

  const products = getProductsByCategory(category);
  return NextResponse.json(
    { products, total: products.length },
    {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    }
  );
}
