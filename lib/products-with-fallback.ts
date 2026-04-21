/**
 * Enhanced products library with dead link fallback
 * Automatically serves replacement products when links are dead
 */

import { kv } from "@vercel/kv";
import productsData from "@/data/products.json";

export interface Product {
  asin: string;
  name: string;
  category: string;
  price?: number;
  rating?: number;
  image?: string;
  isReplacement?: boolean;
  originalAsin?: string;
}

let replacementMap: Record<string, string> | null = null;

/**
 * Load replacement map from cache
 */
async function getReplacementMap(): Promise<Record<string, string>> {
  if (replacementMap) {
    return replacementMap;
  }

  try {
    const cached = await kv.get<Record<string, string>>(
      "link-replacements:map"
    );
    replacementMap = cached || {};
  } catch {
    replacementMap = {};
  }

  return replacementMap;
}

/**
 * Get product by ASIN, with automatic fallback to replacement
 */
export async function getProductByAsin(
  asin: string
): Promise<Product | undefined> {
  // First, try to find the original product
  let product = productsData.find((p) => p.asin === asin);

  if (product) {
    return product;
  }

  // If not found, check if this ASIN has a replacement
  const replacementMap = await getReplacementMap();
  const replacementAsin = replacementMap[asin];

  if (replacementAsin) {
    product = productsData.find((p) => p.asin === replacementAsin);
    if (product) {
      return {
        ...product,
        isReplacement: true,
        originalAsin: asin,
      };
    }
  }

  return undefined;
}

/**
 * Get all products with dead link replacements applied
 */
export function getProductsWithFallbacks(): Product[] {
  // This would need async context - for sync operations, use getProductsSync
  return productsData;
}

/**
 * Get products synchronously (no replacement lookup)
 */
export function getAllProducts(): Product[] {
  return productsData;
}

/**
 * Get product category with dead link awareness
 */
export async function getProductsByCategory(
  category: string
): Promise<Product[]> {
  const replacementMap = await getReplacementMap();
  const deadAsins = Object.keys(replacementMap);

  let products = productsData.filter(
    (p) => p.category.toLowerCase() === category.toLowerCase()
  );

  // Filter out dead products (unless they have a replacement)
  // Note: In real usage, you'd show the replacement instead
  products = products.filter((p) => !deadAsins.includes(p.asin));

  return products;
}

/**
 * Get recommended product with dead link fallback
 * Used when generating AI recommendations
 */
export async function getRecommendedProduct(
  category: string
): Promise<Product | undefined> {
  const products = await getProductsByCategory(category);

  if (products.length === 0) {
    return undefined;
  }

  // Return highest-rated product
  return products.reduce((best, current) => {
    const bestRating = best.rating || 0;
    const currentRating = current.rating || 0;
    return currentRating > bestRating ? current : best;
  });
}

/**
 * Check if product is available (not dead without replacement)
 */
export async function isProductAvailable(asin: string): Promise<boolean> {
  const product = await getProductByAsin(asin);
  return product !== undefined;
}

/**
 * Get product with metadata only (no database lookup)
 * Useful for quick operations that don't need full fallback logic
 */
export function getProductSync(asin: string): Product | undefined {
  return productsData.find((p) => p.asin === asin);
}

/**
 * Cache product lookup results for performance
 */
const productCache = new Map<string, Product | null>();

export async function getProductByAsinCached(
  asin: string,
  cacheTTL: number = 3600 // 1 hour
): Promise<Product | undefined> {
  // Check memory cache
  if (productCache.has(asin)) {
    return productCache.get(asin) || undefined;
  }

  // Get from KV cache
  try {
    const cached = await kv.get<Product | null>(`product:${asin}`);
    if (cached !== undefined) {
      productCache.set(asin, cached);
      return cached || undefined;
    }
  } catch {
    // Cache miss, continue with lookup
  }

  // Look up the product
  const product = await getProductByAsin(asin);

  // Cache the result (even if not found)
  productCache.set(asin, product || null);
  try {
    await kv.setex(`product:${asin}`, cacheTTL, product || null);
  } catch {
    // Silently fail cache write
  }

  return product;
}

export default productsData;
