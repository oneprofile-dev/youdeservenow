"use client";

import { useMetricsStream } from "@/lib/useMetricsStream";
import { useNumberAnimation } from "@/lib/useNumberAnimation";
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

  const [prevMetrics, setPrevMetrics] = useState({
    likes: 0,
    shares: 0,
    affiliate_clicks: 0,
  });

  // Animated values
  const likes = useNumberAnimation(metrics?.likes || 0, 800);
  const shares = useNumberAnimation(metrics?.shares || 0, 800);
  const affiliateClicks = useNumberAnimation(metrics?.affiliate_clicks || 0, 800);
  const qualityScoreAnimated = useNumberAnimation(qualityScore, 600, 1);

  // Track changes for visual feedback
  const [hasIncreased, setHasIncreased] = useState({
    likes: false,
    shares: false,
    affiliate_clicks: false,
  });

  useEffect(() => {
    if (!metrics) return;

    // Check for increases and trigger animations
    const newHasIncreased = {
      likes: metrics.likes > prevMetrics.likes,
      shares: metrics.shares > prevMetrics.shares,
      affiliate_clicks: metrics.affiliate_clicks > prevMetrics.affiliate_clicks,
    };

    setHasIncreased(newHasIncreased);
    setPrevMetrics(metrics);

    // Reset increase indicators after animation
    if (Object.values(newHasIncreased).some(Boolean)) {
      setTimeout(() => {
        setHasIncreased({
          likes: false,
          shares: false,
          affiliate_clicks: false,
        });
      }, 2000);
    }
  }, [metrics, prevMetrics]);

  if (error) {
    return (
      <div className="text-xs text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text)] animate-fade-in">
        ⚠️ Live updates unavailable
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="text-xs text-[var(--color-text-tertiary)] dark:text-[var(--color-dark-text)] animate-fade-in">
        Loading metrics...
      </div>
    );
  }

  return (
    <div className="space-y-2 animate-slide-up">
      {/* Metrics Grid */}
      <div className="grid grid-cols-3 gap-3">
        {/* Likes */}
        <div className={`text-center p-2 rounded-lg bg-[var(--color-card-bg)] dark:bg-[var(--color-dark-border)] transition-smooth ${hasIncreased.likes ? 'animate-glow' : ''}`}>
          <div className="text-xs uppercase tracking-widest text-[var(--color-text-tertiary)] dark:text-[var(--color-dark-text)] font-semibold mb-1">
            ❤️ Likes
          </div>
          <div className="text-2xl font-bold text-[#ff6b6b] tabular-nums">
            {likes.value}
            {hasIncreased.likes && (
              <span className="text-sm ml-1 text-[#4CAF50] animate-bounce-in">↗</span>
            )}
          </div>
        </div>

        {/* Shares */}
        <div className={`text-center p-2 rounded-lg bg-[var(--color-card-bg)] dark:bg-[var(--color-dark-border)] transition-smooth ${hasIncreased.shares ? 'animate-glow' : ''}`}>
          <div className="text-xs uppercase tracking-widest text-[var(--color-text-tertiary)] dark:text-[var(--color-dark-text)] font-semibold mb-1">
            📤 Shares
          </div>
          <div className="text-2xl font-bold text-[#2196F3] tabular-nums">
            {shares.value}
            {hasIncreased.shares && (
              <span className="text-sm ml-1 text-[#4CAF50] animate-bounce-in">↗</span>
            )}
          </div>
        </div>

        {/* Affiliate Clicks */}
        <div className={`text-center p-2 rounded-lg bg-[var(--color-card-bg)] dark:bg-[var(--color-dark-border)] transition-smooth ${hasIncreased.affiliate_clicks ? 'animate-glow' : ''}`}>
          <div className="text-xs uppercase tracking-widest text-[var(--color-text-tertiary)] dark:text-[var(--color-dark-text)] font-semibold mb-1">
            🛒 Clicks
          </div>
          <div className="text-2xl font-bold text-[#FF9800] tabular-nums">
            {affiliateClicks.value}
            {hasIncreased.affiliate_clicks && (
              <span className="text-sm ml-1 text-[#4CAF50] animate-bounce-in">↗</span>
            )}
          </div>
        </div>
      </div>

      {/* Quality Score + Rank */}
      {showRank && (
        <div className="pt-2 border-t border-[var(--color-card-border)] dark:border-[var(--color-dark-border)] animate-fade-in">
          <div className="flex items-center justify-between text-xs">
            <div>
              <span className="text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text)]">
                Quality Score
              </span>
              <div className="text-lg font-bold text-[var(--color-accent)]">
                {qualityScoreAnimated.value}
              </div>
            </div>

            {rank && (
              <div className="text-right">
                <span className="text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text)]">
                  Current Rank
                </span>
                <div className="text-lg font-bold text-[var(--color-accent)] animate-float">
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
          <span className="text-green-600 dark:text-green-400 animate-pulse-slow">
            🟢 Live • updates every 5s
          </span>
        ) : (
          <span className="animate-pulse">⚪ Polling...</span>
        )}
      </div>
    </div>
  );
}
