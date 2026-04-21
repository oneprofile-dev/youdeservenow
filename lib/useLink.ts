/**
 * React hook for smart link handling with fallbacks
 * Automatically detects dead links and serves replacements
 */

import { useEffect, useState, useRef } from "react";
import {
  quickCheckLink,
  prefetchLinks,
  LinkStatus,
} from "./client-link-cache";

export interface LinkCheckOptions {
  replacementUrl?: string;
  onStatusChange?: (status: LinkStatus) => void;
  autoPrefetch?: boolean;
}

/**
 * Hook: Check link health and get smart URL
 * Returns the URL to use (original or replacement) and current status
 */
export function useLinkHealth(
  primaryUrl: string,
  options: LinkCheckOptions = {}
) {
  const { replacementUrl, onStatusChange, autoPrefetch = true } = options;
  const [linkStatus, setLinkStatus] = useState<LinkStatus | null>(null);
  const [urlToUse, setUrlToUse] = useState(replacementUrl || primaryUrl);
  const lastCheckedUrlRef = useRef<string | null>(null);

  useEffect(() => {
    setUrlToUse(replacementUrl || primaryUrl);
  }, [primaryUrl, replacementUrl]);

  useEffect(() => {
    if (!primaryUrl || lastCheckedUrlRef.current === primaryUrl) return;
    lastCheckedUrlRef.current = primaryUrl;

    const applyStatus = (status: LinkStatus) => {
      setLinkStatus(status);

      if (status.status === "dead" && replacementUrl) {
        setUrlToUse(replacementUrl);
      } else if (status.status === "alive" && !replacementUrl) {
        setUrlToUse(primaryUrl);
      }

      if (onStatusChange) {
        onStatusChange(status);
      }
    };

    // Quick check - returns cached result or starts background check
    quickCheckLink(primaryUrl, applyStatus).then(applyStatus).catch(() => {
      // Ignore link-check failures and continue using the current URL.
    });
  }, [primaryUrl, replacementUrl, onStatusChange]);

  return {
    urlToUse,
    status: linkStatus?.status || "unknown",
    isAlive: linkStatus?.status === "alive",
    isDead: linkStatus?.status === "dead",
  };
}

/**
 * Hook: Prefetch multiple product links for instant lookup
 * Call this on component mount to populate cache
 */
export function usePrefetchLinks(urls: string[]) {
  useEffect(() => {
    if (urls.length === 0) return;
    prefetchLinks(urls);
  }, [urls]);
}

/**
 * Hook: Monitor and update link when status changes
 * Useful for displaying fallback UI while checking
 */
export function useLinkWithFallback(
  primaryUrl: string,
  fallbackUrl: string
) {
  const [currentUrl, setCurrentUrl] = useState(primaryUrl);
  const [isLoading, setIsLoading] = useState(false);
  const checkedRef = useRef(false);

  useEffect(() => {
    if (!primaryUrl || checkedRef.current) return;
    checkedRef.current = true;

    setIsLoading(true);

    quickCheckLink(primaryUrl, (status) => {
      setIsLoading(false);

      if (status.status === "dead") {
        setCurrentUrl(fallbackUrl);
      } else if (status.status === "alive") {
        setCurrentUrl(primaryUrl);
      }
      // If unknown, keep primaryUrl
    });
  }, [primaryUrl, fallbackUrl]);

  return { url: currentUrl, isLoading };
}

/**
 * Hook: Get link replacement from server cache
 * Fetches latest replacement info from API
 */
export function useLinkReplacement(asin: string) {
  const [replacement, setReplacement] = useState<{
    url: string;
    name: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!asin) return;

    setIsLoading(true);

    fetch(`/api/products/replacement?asin=${encodeURIComponent(asin)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.replacementUrl) {
          setReplacement({
            url: data.replacementUrl,
            name: data.replacementName || "View on Amazon",
          });
        }
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
      });
  }, [asin]);

  return { replacement, isLoading };
}
