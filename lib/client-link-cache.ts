/**
 * Client-side link status cache with IndexedDB fallback
 * Provides instant fallback for dead links without server delay
 */

export interface LinkStatus {
  url: string;
  status: "alive" | "dead" | "unknown";
  lastChecked: number; // timestamp
  replacementUrl?: string;
}

const CACHE_KEY = "link-status-cache";
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days
const CHECK_TIMEOUT = 2000; // 2 second timeout for link checks

let memoryCache: Map<string, LinkStatus> = new Map();

/**
 * Initialize cache from localStorage
 */
export function initLinkCache(): void {
  if (typeof window === "undefined") return;

  try {
    const stored = localStorage.getItem(CACHE_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      memoryCache = new Map(Object.entries(data));
    }
  } catch {
    // Silently fail if storage is unavailable
    memoryCache = new Map();
  }
}

/**
 * Save cache to localStorage
 */
function persistCache(): void {
  if (typeof window === "undefined") return;

  try {
    const data = Object.fromEntries(memoryCache);
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch {
    // Silently fail if storage is full
  }
}

/**
 * Get link status from cache (memory or storage)
 */
export function getCachedLinkStatus(url: string): LinkStatus | null {
  const cached = memoryCache.get(url);

  // Check if cache is still valid
  if (cached && Date.now() - cached.lastChecked < CACHE_TTL) {
    return cached;
  }

  // Remove expired cache
  if (cached) {
    memoryCache.delete(url);
    persistCache();
  }

  return null;
}

/**
 * Quick link validation with abort timeout
 * Returns immediately with cached result if available
 */
export async function quickCheckLink(
  url: string,
  onResult?: (status: LinkStatus) => void
): Promise<LinkStatus> {
  // Check cache first (instant response)
  const cached = getCachedLinkStatus(url);
  if (cached) {
    onResult?.(cached);
    return cached;
  }

  // If not cached, do quick validation in background
  if (typeof window !== "undefined") {
    // Non-blocking background check
    quickCheckInBackground(url, onResult);
  }

  // Return unknown while checking
  return {
    url,
    status: "unknown",
    lastChecked: Date.now(),
  };
}

/**
 * Background link validation without blocking
 */
async function quickCheckInBackground(
  url: string,
  onResult?: (status: LinkStatus) => void
): Promise<void> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CHECK_TIMEOUT);

    // Use HEAD request for speed
    const response = await fetch(url, {
      method: "HEAD",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      redirect: "follow",
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const status: LinkStatus = {
      url,
      status: response.status === 200 ? "alive" : response.status === 404 ? "dead" : "unknown",
      lastChecked: Date.now(),
    };

    // Cache result
    memoryCache.set(url, status);
    persistCache();

    if (onResult) {
      onResult(status);
    }
  } catch {
    // Mark as unknown if check fails
    const status: LinkStatus = {
      url,
      status: "unknown",
      lastChecked: Date.now(),
    };

    memoryCache.set(url, status);
    persistCache();

    if (onResult) {
      onResult(status);
    }
  }
}

/**
 * Prefetch multiple links for instant lookup later
 * Useful to call on component mount
 */
export async function prefetchLinks(urls: string[]): Promise<void> {
  if (typeof window === "undefined") return;

  // Get uncached URLs
  const uncachedUrls = urls.filter((url) => !getCachedLinkStatus(url));

  // Check all in parallel without blocking
  Promise.allSettled(
    uncachedUrls.map((url) =>
      quickCheckInBackground(url)
    )
  ).catch(() => {
    // Silently fail
  });
}

/**
 * Manually set link status (useful when receiving from server)
 */
export function setLinkStatus(status: LinkStatus): void {
  memoryCache.set(status.url, status);
  persistCache();
}

/**
 * Get replacement URL if link is dead
 */
export function getReplacementLink(
  deadUrl: string,
  replacementUrl?: string
): string {
  const status = getCachedLinkStatus(deadUrl);

  if (status?.status === "dead" && replacementUrl) {
    return replacementUrl;
  }

  return deadUrl;
}

/**
 * Clear cache (for testing or manual reset)
 */
export function clearLinkCache(): void {
  memoryCache.clear();
  if (typeof window !== "undefined") {
    localStorage.removeItem(CACHE_KEY);
  }
}
