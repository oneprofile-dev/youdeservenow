/**
 * Link Health Monitoring System
 * Tracks, validates, and auto-replaces dead Amazon affiliate links
 */

import { kv } from "@vercel/kv";

export interface LinkValidationResult {
  asin: string;
  status: "alive" | "dead" | "unknown";
  code?: number;
  error?: string;
  lastChecked?: string;
}

export interface ProductReplacement {
  deadAsin: string;
  replacementAsin: string;
  replacementName: string;
  confidence: number;
  reason: string;
  replacedAt: string;
}

/**
 * Check if an Amazon ASIN link is still valid
 */
export async function validateAmazonLink(
  asin: string,
  maxRetries: number = 3,
  timeout: number = 5000
): Promise<LinkValidationResult> {
  const url = `https://www.amazon.com/dp/${asin}`;
  const cacheKey = `link-status:${asin}`;
  const cacheTTL = 86400; // 24 hours

  // Check cache first
  try {
    const cached = await kv.get<LinkValidationResult>(cacheKey);
    if (cached) {
      return cached;
    }
  } catch {
    // Cache miss or error - continue with validation
  }

  const headers = {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  };

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        method: "HEAD",
        headers,
        redirect: "follow",
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const result: LinkValidationResult = {
        asin,
        code: response.status,
        lastChecked: new Date().toISOString(),
        status: response.status === 200 ? "alive" : response.status === 404 ? "dead" : "unknown",
      };

      if (response.status === 404) {
        result.error = "Product not found (404)";
      } else if (response.status !== 200) {
        result.error = `HTTP ${response.status}`;
      }

      // Cache the result
      try {
        await kv.setex(cacheKey, cacheTTL, result);
      } catch {
        // Silently fail cache write
      }

      return result;
    } catch (error) {
      if (attempt < maxRetries - 1) {
        // Exponential backoff: 1s, 2s, 4s
        await new Promise((resolve) =>
          setTimeout(resolve, Math.pow(2, attempt) * 1000)
        );
      }
    }
  }

  return {
    asin,
    status: "unknown",
    error: "Failed to validate after retries",
    lastChecked: new Date().toISOString(),
  };
}

/**
 * Get link validation status for multiple ASINs
 */
export async function validateMultipleLinks(
  asins: string[]
): Promise<LinkValidationResult[]> {
  // Batch validate with concurrency limit (10 at a time)
  const batchSize = 10;
  const results: LinkValidationResult[] = [];

  for (let i = 0; i < asins.length; i += batchSize) {
    const batch = asins.slice(i, Math.min(i + batchSize, asins.length));
    const batchResults = await Promise.all(batch.map(asin => validateAmazonLink(asin)));
    results.push(...batchResults);
  }

  return results;
}

/**
 * Find the best replacement for a dead product
 * Uses metadata-based matching: category, price, keywords
 */
type PriceableProduct = {
  name: string;
  category: string;
  price?: number | string;
  asin: string;
};

function normalizePrice(price?: number | string): number {
  if (typeof price === "number") return price;
  if (!price) return 0;
  const numeric = Number(price.toString().replace(/[^0-9.]/g, ""));
  return Number.isFinite(numeric) ? numeric : 0;
}

export function findReplacementCandidate(
  deadProduct: PriceableProduct,
  allProducts: PriceableProduct[]
): ProductReplacement | null {
  const deadName = deadProduct.name.toLowerCase();
  const deadCategory = deadProduct.category.toLowerCase();
  const deadPrice = normalizePrice(deadProduct.price);

  let bestMatch: {
    product: (typeof allProducts)[0];
    score: number;
  } | null = null;

  for (const product of allProducts) {
    if (product.asin === deadProduct.asin) continue;

    let score = 0;

    // Category match (40 points)
    if (product.category.toLowerCase() === deadCategory) {
      score += 40;
    }

    // Name similarity (40 points) - check for shared keywords
    const deadWords = new Set(deadName.split(/\s+/));
    const productWords = new Set(product.name.toLowerCase().split(/\s+/));
    const commonWords = [...deadWords].filter((w) =>
      productWords.has(w) && w.length > 3
    ).length;
    const maxWords = Math.max(deadWords.size, productWords.size);
    score += (commonWords / maxWords) * 40;

    // Price proximity (20 points)
    const productPrice = normalizePrice(product.price);
    if (deadPrice > 0 && productPrice > 0) {
      const priceDiff = Math.abs(deadPrice - productPrice) / deadPrice;
      score += Math.max(0, (1 - priceDiff) * 20);
    }

    // Update best match
    if (!bestMatch || score > bestMatch.score) {
      bestMatch = { product, score };
    }
  }

  if (!bestMatch || bestMatch.score < 50) {
    return null;
  }

  return {
    deadAsin: deadProduct.asin,
    replacementAsin: bestMatch.product.asin,
    replacementName: bestMatch.product.name,
    confidence: Math.min(100, bestMatch.score),
    reason: `Matched by category and product name similarity (${bestMatch.score.toFixed(0)} points)`,
    replacedAt: new Date().toISOString(),
  };
}

/**
 * Log a link replacement event
 */
export async function logLinkReplacement(
  replacement: ProductReplacement
): Promise<void> {
  try {
    const logKey = `link-replacements:${new Date().toISOString().split("T")[0]}`;
    await kv.lpush(logKey, JSON.stringify(replacement));
    // Keep logs for 90 days
    await kv.expire(logKey, 7776000);
  } catch (error) {
    console.error("Failed to log link replacement:", error);
  }
}

/**
 * Get link health statistics
 */
export async function getLinkHealthStats(): Promise<{
  totalChecked: number;
  alive: number;
  dead: number;
  unknown: number;
  lastUpdated: string;
}> {
  try {
    const stats = await kv.get<{
      totalChecked: number;
      alive: number;
      dead: number;
      unknown: number;
      lastUpdated: string;
    } | null>("link-health:stats");
    if (stats) {
      return stats;
    }
    return {
      totalChecked: 0,
      alive: 0,
      dead: 0,
      unknown: 0,
      lastUpdated: new Date().toISOString(),
    };
  } catch {
    return {
      totalChecked: 0,
      alive: 0,
      dead: 0,
      unknown: 0,
      lastUpdated: new Date().toISOString(),
    };
  }
}

/**
 * Update link health statistics
 */
export async function updateLinkHealthStats(
  results: LinkValidationResult[]
): Promise<void> {
  const stats = {
    totalChecked: results.length,
    alive: results.filter((r) => r.status === "alive").length,
    dead: results.filter((r) => r.status === "dead").length,
    unknown: results.filter((r) => r.status === "unknown").length,
    lastUpdated: new Date().toISOString(),
  };

  try {
    await kv.set("link-health:stats", stats);
  } catch (error) {
    console.error("Failed to update link health stats:", error);
  }
}
