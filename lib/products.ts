import productsData from "@/data/products.json";
import type { AffiliateNetwork } from "./affiliate";

export interface Product {
  id: string;
  name: string;
  category: string;
  price: string;
  affiliateUrl: string;
  imageUrl: string;
  keywords: string[];
  // Premium affiliate metadata (optional — present on high-commission products)
  affiliateNetwork?: AffiliateNetwork;
  affiliateNetworkId?: string;  // merchant/link/campaign ID for the network
  commission?: string;          // e.g. "15%" or "$40 CPA"
}

const products: Product[] = productsData as Product[];

const CATEGORY_FALLBACK_ORDER = [
  "trending",
  "comfort",
  "selfcare",
  "snacks",
  "home",
  "tech",
  "fitness",
  "kitchen",
];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function matchProduct(input: string): Product {
  const lower = input.toLowerCase();

  const scored = products.map((p) => ({
    product: p,
    // Weight: keyword hits × commission multiplier (prefer high-value matches)
    score: p.keywords.filter((kw) => lower.includes(kw)).length,
  }));

  const maxScore = Math.max(...scored.map((s) => s.score));

  if (maxScore > 0) {
    const topMatches = scored
      .filter((s) => s.score === maxScore)
      .map((s) => s.product);
    return pickRandom(topMatches);
  }

  for (const cat of CATEGORY_FALLBACK_ORDER) {
    const catProducts = products.filter((p) => p.category === cat);
    if (catProducts.length > 0) return pickRandom(catProducts);
  }

  return products[0];
}

export function getProductsByCategory(category: string): Product[] {
  if (category === "all") return products;
  return products.filter((p) => p.category === category);
}

export function getAllCategories(): string[] {
  return Array.from(new Set(products.map((p) => p.category)));
}
