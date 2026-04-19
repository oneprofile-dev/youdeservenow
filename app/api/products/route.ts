import { NextRequest, NextResponse } from "next/server";
import { getProductsByCategory, getAllCategories } from "@/lib/products";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category") ?? "all";

  const validCategories = ["all", ...getAllCategories()];
  if (!validCategories.includes(category)) {
    return NextResponse.json(
      { error: `Invalid category. Valid options: ${validCategories.join(", ")}` },
      { status: 400 }
    );
  }

  const products = getProductsByCategory(category);
  return NextResponse.json({ products, total: products.length });
}
