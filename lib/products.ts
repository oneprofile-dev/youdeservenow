import productsData from "@/data/products.json";
import nicheProductsData from "@/data/niche-products.json";
import type { AffiliateNetwork } from "./affiliate";
import { isHighCommission } from "./affiliate";

export interface Product {
  id: string;
  asin: string;
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

function extractAsinFromUrl(url: string): string {
  // Extract ASIN from Amazon URL: https://www.amazon.com/dp/B07NY4FYYQ?tag=...
  const match = url.match(/\/dp\/([A-Z0-9]+)/);
  if (match?.[1]) return match[1];
  // Fallback: use a hash of the URL if ASIN cannot be extracted
  return `asin-${url.split('/').pop()?.slice(0, 10)}`;
}

export { extractAsinFromUrl as extractAsinFromUrl };

const mergedProducts = [...(productsData as any[]), ...(nicheProductsData as any[])];
const products: Product[] = Array.from(
  new Map(
    mergedProducts.map((product) => [
      product.id,
      {
        ...product,
        asin: product.asin || extractAsinFromUrl(product.affiliateUrl),
      },
    ])
  ).values()
) as Product[];

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

  const scored = products.map((p) => {
    const keywordHits = p.keywords.filter((kw) => lower.includes(kw)).length;
    // Boost high-commission products so they win ties and rank above generic Amazon items
    const commissionBoost = p.commission
      ? isHighCommission(p.commission) ? 2 : 0.5
      : 0;
    return { product: p, score: keywordHits + (keywordHits > 0 ? commissionBoost : 0) };
  });

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

export function getAllProducts(): Product[] {
  return products;
}

export function getAllCategories(): string[] {
  return Array.from(new Set(products.map((p) => p.category)));
}
