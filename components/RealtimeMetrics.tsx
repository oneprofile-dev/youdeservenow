"use client";

import { useMetricsStream } from "@/lib/useMetricsStream";
import { useEffect, useState } from "react";

interface RealtimeMetricsProps {
  resultId: string;
  category?: string;
  showRank?: boolean;
}

/**
 * Displays real-time metrics for a result with live updates
 * Shows likes, shares, and affiliate clicks with smooth animations
 */
export function RealtimeMetrics({ resultId, category, showRank = true }: RealtimeMetricsProps) {
  const { metrics, rank, qualityScore, isConnected, error } = useMetricsStream({
    resultId,
    category,
  });

  const [displayMetrics, setDisplayMetrics] = useState({
    likes: 0,
    shares: 0,
    affiliate_clicks: 0,
  });

  const [prevValues, setPrevValues] = useState({
    likes: 0,
    shares: 0,
    affiliate_clicks: 0,
  });

  // Smooth number animation
  useEffect(() => {
    if (!metrics) return;

    setDisplayMetrics(metrics);
    setPrevValues(metrics);
  }, [metrics]);

  if (error) {
    return (
      <div className="text-xs text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text)]">
        ⚠️ Live updates unavailable
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="text-xs text-[var(--color-text-tertiary)] dark:text-[var(--color-dark-text)]">
        Loading metrics...
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Metrics Grid */}
      <div className="grid grid-cols-3 gap-3">
        {/* Likes */}
        <div className="text-center p-2 rounded-lg bg-[var(--color-card-bg)] dark:bg-[var(--color-dark-border)]">
          <div className="text-xs uppercase tracking-widest text-[var(--color-text-tertiary)] dark:text-[var(--color-dark-text)] font-semibold mb-1">
            ❤️ Likes
          </div>
          <div className="text-2xl font-bold text-[#ff6b6b] tabular-nums">
            {displayMetrics.likes}
            {displayMetrics.likes > prevValues.likes && (
              <span className="text-sm ml-1 text-[#4CAF50] animate-pulse">+</span>
            )}
          </div>
        </div>

        {/* Shares */}
        <div className="text-center p-2 rounded-lg bg-[var(--color-card-bg)] dark:bg-[var(--color-dark-border)]">
          <div className="text-xs uppercase tracking-widest text-[var(--color-text-tertiary)] dark:text-[var(--color-dark-text)] font-semibold mb-1">
            📤 Shares
          </div>
          <div className="text-2xl font-bold text-[#2196F3] tabular-nums">
            {displayMetrics.shares}
            {displayMetrics.shares > prevValues.shares && (
              <span className="text-sm ml-1 text-[#4CAF50] animate-pulse">+</span>
            )}
          </div>
        </div>

        {/* Affiliate Clicks */}
        <div className="text-center p-2 rounded-lg bg-[var(--color-card-bg)] dark:bg-[var(--color-dark-border)]">
          <div className="text-xs uppercase tracking-widest text-[var(--color-text-tertiary)] dark:text-[var(--color-dark-text)] font-semibold mb-1">
            🛒 Clicks
          </div>
          <div className="text-2xl font-bold text-[#FF9800] tabular-nums">
            {displayMetrics.affiliate_clicks}
            {displayMetrics.affiliate_clicks > prevValues.affiliate_clicks && (
              <span className="text-sm ml-1 text-[#4CAF50] animate-pulse">+</span>
            )}
          </div>
        </div>
      </div>

      {/* Quality Score + Rank */}
      {showRank && (
        <div className="pt-2 border-t border-[var(--color-card-border)] dark:border-[var(--color-dark-border)]">
          <div className="flex items-center justify-between text-xs">
            <div>
              <span className="text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text)]">
                Quality Score
              </span>
              <div className="text-lg font-bold text-[var(--color-accent)]">
                {qualityScore.toFixed(1)}
              </div>
            </div>

            {rank && (
              <div className="text-right">
                <span className="text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text)]">
                  Current Rank
                </span>
                <div className="text-lg font-bold text-[var(--color-accent)]">
                  #{rank}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Connection Status */}
      <div className="text-xs text-[var(--color-text-tertiary)] dark:text-[var(--color-dark-text)] text-center pt-1">
        {isConnected ? (
          <span className="text-green-600 dark:text-green-400">🔴 Live • updates every 5s</span>
        ) : (
          <span>⚪ Polling...</span>
        )}
      </div>
    </div>
  );
}
