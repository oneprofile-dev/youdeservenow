"use client";

import useSWR from "swr";
import { ChallengesGrid } from "./ChallengesGrid";
import type { Challenge } from "@/lib/challenges";

const fetcher = (url: string) =>
  fetch(url).then((r) => {
    if (!r.ok) throw new Error("Failed to fetch challenges");
    return r.json();
  });

/**
 * Client-side challenges content with real-time updates
 */
export function ChallengesContent() {
  // Fetch challenges list
  const { data: challengesData, error: challengesError, isLoading: challengesLoading } = useSWR<{
    success: boolean;
    data: Challenge[];
  }>("/api/challenges", fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000, // Dedupe for 60 seconds
  });

  // Fetch user progress
  const { data: progressData, error: progressError, isLoading: progressLoading } = useSWR<{
    success: boolean;
    data: Record<string, number>;
  }>("/api/challenges?type=progress", fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000,
  });

  const isLoading = challengesLoading || progressLoading;
  const error = challengesError || progressError;
  const challenges = challengesData?.data || [];
  const progress = progressData?.data || {};

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 dark:text-red-400 text-lg">Failed to load challenges</p>
        <p className="text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text)] mt-2">
          Please try refreshing the page
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(2)].map((_, i) => (
          <div
            key={i}
            className="h-32 bg-[var(--color-card-bg)] dark:bg-[var(--color-dark-border)] rounded-lg animate-pulse"
          />
        ))}
      </div>
    );
  }

  return <ChallengesGrid challenges={challenges} userProgress={progress} />;
}
