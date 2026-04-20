"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import { LeaderboardCard } from "./LeaderboardCard";
import { LeaderboardFilters } from "./LeaderboardFilters";
import type { LeaderboardEntry } from "@/lib/leaderboards";

type SortType = "likes" | "shares" | "affiliate_clicks" | "quality";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function LeaderboardContent() {
  const [sort, setSort] = useState<SortType>("likes");
  const [category, setCategory] = useState<string>("all");
  const [limit, setLimit] = useState<number>(50);
  const [isLoading, setIsLoading] = useState(false);

  // Build the query URL dynamically
  const queryParams = new URLSearchParams({
    sort,
    category,
    limit: limit.toString(),
  });

  const { data, error, isLoading: isFetching } = useSWR(
    `/api/leaderboards?${queryParams.toString()}`,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 60000, // 1 minute
    }
  );

  useEffect(() => {
    setIsLoading(isFetching);
  }, [isFetching]);

  // Extract data from API response (API returns { success, data, ... })
  const leaderboard: LeaderboardEntry[] = data?.data || [];

  return (
    <div className="space-y-6">
      {/* Filters */}
      <LeaderboardFilters
        sort={sort}
        onSortChange={setSort}
        category={category}
        onCategoryChange={setCategory}
        limit={limit}
        onLimitChange={setLimit}
      />

      {/* Error state */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 font-medium">
            Failed to load leaderboards. Please try again.
          </p>
        </div>
      )}

      {/* Loading state */}
      {isLoading && !leaderboard.length && (
        <div className="space-y-3">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="h-24 bg-gray-100 rounded-lg animate-pulse"
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && leaderboard.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">
            No results found for this filter combination.
          </p>
          <p className="text-gray-500 text-sm mt-2">
            Try adjusting your filters or check back soon!
          </p>
        </div>
      )}

      {/* Leaderboard */}
      {leaderboard.length > 0 && (
        <div className="space-y-3">
          {leaderboard.map((entry) => (
            <LeaderboardCard key={entry.id} entry={entry} />
          ))}
        </div>
      )}

      {/* Load more hint */}
      {leaderboard.length > 0 && leaderboard.length === limit && (
        <div className="text-center pt-4">
          <button
            onClick={() => setLimit(limit + 50)}
            className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
          >
            Load more results
          </button>
        </div>
      )}
    </div>
  );
}
