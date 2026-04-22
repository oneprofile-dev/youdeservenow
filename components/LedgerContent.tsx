"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import LedgerCard from "./LedgerCard";
import type { Result } from "@/lib/db";

interface LedgerResult {
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
}

interface LedgerResponse {
  results: LedgerResult[];
  total: number;
  page: number;
  perPage: number;
  hasMore: boolean;
}

export default function LedgerContent() {
  const [results, setResults] = useState<LedgerResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [sortBy, setSortBy] = useState<"fresh" | "trending">("fresh");
  const observerTarget = useRef<HTMLDivElement>(null);

  // Fetch ledger results
  const fetchResults = useCallback(
    async (pageNum: number = 0, reset: boolean = false) => {
      try {
        if (pageNum === 0) setIsLoading(true);

        const response = await fetch(
          `/api/ledger?page=${pageNum}&perPage=12&sort=${sortBy}`,
          {
            headers: { "Cache-Control": "no-cache" },
          }
        );

        if (!response.ok) throw new Error("Failed to fetch ledger");

        const data: LedgerResponse = await response.json();

        if (reset) {
          setResults(data.results);
        } else {
          setResults((prev) => [...prev, ...data.results]);
        }

        setHasMore(data.hasMore);
        setPage(pageNum);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load ledger");
      } finally {
        setIsLoading(false);
      }
    },
    [sortBy]
  );

  // Initial load
  useEffect(() => {
    fetchResults(0, true);
  }, [sortBy]);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          fetchResults(page + 1);
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [page, hasMore, isLoading, fetchResults]);

  return (
    <div className="space-y-8">
      {/* Sort Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => {
              setSortBy("fresh");
              setResults([]);
              setPage(0);
            }}
            className={`px-4 py-2 rounded-xl font-medium transition-colors ${
              sortBy === "fresh"
                ? "bg-[var(--color-accent)] text-white"
                : "border border-[var(--color-card-border)] dark:border-[var(--color-dark-border)] text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text)] hover:border-[var(--color-accent)]"
            }`}
          >
            🕐 Fresh
          </button>
          <button
            onClick={() => {
              setSortBy("trending");
              setResults([]);
              setPage(0);
            }}
            className={`px-4 py-2 rounded-xl font-medium transition-colors ${
              sortBy === "trending"
                ? "bg-[var(--color-accent)] text-white"
                : "border border-[var(--color-card-border)] dark:border-[var(--color-dark-border)] text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text)] hover:border-[var(--color-accent)]"
            }`}
          >
            🔥 Trending
          </button>
        </div>

        <p className="text-xs text-[var(--color-text-tertiary)] dark:text-[var(--color-dark-text)]">
          {results.length > 0 && `Showing ${results.length} results`}
        </p>
      </div>

      {/* Error State */}
      {error && !results.length && (
        <div className="text-center py-12">
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <button
            onClick={() => fetchResults(0, true)}
            className="px-4 py-2 rounded-xl bg-[var(--color-accent)] text-white font-medium hover:opacity-90"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && results.length === 0 && !error && (
        <div className="text-center py-24">
          <p
            className="text-2xl font-bold text-[var(--color-text-primary)] dark:text-[var(--color-dark-text)] mb-3"
            style={{ fontFamily: "var(--font-display)" }}
          >
            No justifications yet
          </p>
          <p className="text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text)] mb-6">
            Be the first to share your moment with the world
          </p>
          <a
            href="/"
            className="inline-block px-6 py-3 rounded-xl bg-[var(--color-accent)] text-white font-semibold hover:opacity-90 transition-opacity"
          >
            Create Justification
          </a>
        </div>
      )}

      {/* Results Grid */}
      {results.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {results.map((result, index) => (
            <LedgerCard
              key={result.id}
              result={
                {
                  ...result,
                  product: {
                    ...result.product,
                    // Ensure product has all required fields
                    affiliateUrl: "",
                    affiliateNetwork: "impact",
                    affiliateNetworkId: "",
                    commission: "0%",
                  },
                } as unknown as Result
              }
              rank={index + 1}
              metrics={result.metrics}
            />
          ))}
        </div>
      )}

      {/* Loading indicator for infinite scroll */}
      {hasMore && (
        <div
          ref={observerTarget}
          className="py-8 text-center"
        >
          {isLoading && (
            <div className="inline-flex items-center gap-2 text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text)]">
              <span className="inline-block animate-spin">⏳</span>
              Loading more...
            </div>
          )}
        </div>
      )}

      {/* End of results */}
      {!hasMore && results.length > 0 && (
        <div className="text-center py-12 text-[var(--color-text-tertiary)] dark:text-[var(--color-dark-text)]">
          <p>✨ You've reached the end of the ledger</p>
          <p className="text-sm mt-2">Be the first to add more</p>
        </div>
      )}
    </div>
  );
}
