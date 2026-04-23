"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import { track } from "@vercel/analytics/react";
import AbsurdityCard from "./AbsurdityCard";
import type { Result } from "@/lib/db";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface AbsurdityFeedProps {
  limit?: number;
  showFilters?: boolean;
}

export default function AbsurdityFeed({ limit = 20, showFilters = true }: AbsurdityFeedProps) {
  const [sort, setSort] = useState<"legit" | "challenged">("legit");
  const [isLoading, setIsLoading] = useState(false);

  // Build query URL
  const queryParams = new URLSearchParams({
    sort,
    limit: limit.toString(),
  });

  const { data, error, isLoading: isFetching } = useSWR(
    `/api/leaderboards?${queryParams.toString()}`,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 30000, // 30 seconds for freshness
    }
  );

  useEffect(() => {
    setIsLoading(isFetching);
  }, [isFetching]);

  // Extract results
  const results: Result[] = data?.data || [];

  const handleSortChange = (newSort: "legit" | "challenged") => {
    setSort(newSort);
    track("wall_of_fame_sort_changed", {
      sortType: newSort,
    });
  };

  return (
    <div className="space-y-8">
      {/* Filters */}
      {showFilters && (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-[var(--color-accent)] font-semibold mb-2">
              Rankings
            </p>
            <div className="flex gap-2 flex-wrap">
              {[
                { id: "legit", label: "👍 Most Legit", icon: "❤️", desc: "Community agrees this is legit" },
                { id: "challenged", label: "🔥 Most Challenged", icon: "🔥", desc: "The most questioned justifications" },
              ].map((option) => (
                <div key={option.id}>
                  <button
                    onClick={() => handleSortChange(option.id as any)}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                      sort === option.id
                        ? "bg-[var(--color-accent)] text-[var(--color-dark-bg)] dark:text-white"
                        : "bg-[var(--color-bg-secondary)] dark:bg-[var(--color-dark-border)] text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text)] hover:bg-[var(--color-card-border)]"
                    }`}
                  >
                    {option.icon} {option.label}
                  </button>
                  {sort === option.id && (
                    <p className="text-xs text-[var(--color-text-tertiary)] dark:text-[var(--color-dark-text)] mt-1 italic">
                      {option.desc}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="text-xs text-[var(--color-text-tertiary)] dark:text-[var(--color-dark-text)]">
            {results.length} justifications
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-300 font-medium">
            Failed to load absurdities. Try again.
          </p>
        </div>
      )}

      {/* Loading state */}
      {isLoading && !results.length && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-80 bg-[var(--color-card-bg)] dark:bg-[var(--color-dark-surface)] rounded-2xl animate-pulse"
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && results.length === 0 && (
        <div className="text-center py-16">
          <p className="text-3xl mb-3">🎯</p>
          <p className="text-lg font-semibold text-[var(--color-text-primary)] dark:text-[var(--color-dark-text)] mb-2">
            No absurdities yet
          </p>
          <p className="text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text)]">
            Be the first to create a legendary diagnosis.
          </p>
        </div>
      )}

      {/* Grid of cards */}
      {results.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {results.map((result, idx) => (
            <AbsurdityCard 
              key={result.id} 
              result={result} 
              rank={idx + 1}
              rankType={sort === "challenged" ? "challenged" : "legit"}
            />
          ))}
        </div>
      )}
    </div>
  );
}
