"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import { RewardRedemption } from "./RewardRedemption";
import type { Challenge } from "@/lib/challenges";

const fetcher = (url: string) =>
  fetch(url).then((r) => {
    if (!r.ok) throw new Error("Failed to fetch rewards");
    return r.json();
  });

interface RewardsShowcaseProps {
  resultId: string;
}

/**
 * Displays earned rewards and redemption options
 */
export function RewardsShowcase({ resultId }: RewardsShowcaseProps) {
  const [showRedemption, setShowRedemption] = useState(false);
  const [animateRewards, setAnimateRewards] = useState(false);

  // Fetch earned rewards for this result
  const { data: rewardsData, isLoading } = useSWR<{
    success: boolean;
    data: Array<{ code: string; discount: number; type: string; expiresAt: string }>;
  }>(`/api/rewards?resultId=${resultId}`, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000,
  });

  const rewards = rewardsData?.data || [];

  // Animate rewards on load
  useEffect(() => {
    if (rewards.length > 0) {
      const timer = setTimeout(() => setAnimateRewards(true), 300);
      return () => clearTimeout(timer);
    }
  }, [rewards.length]);

  if (isLoading) {
    return (
      <div className="text-center py-4 animate-fade-in">
        <div className="h-20 bg-[var(--color-card-bg)] dark:bg-[var(--color-dark-border)] rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-slide-in-right">
      {/* Header */}
      <div className="space-y-1">
        <h3 className="text-lg font-bold text-[var(--color-text-primary)] dark:text-[var(--color-dark-text)]">
          🎁 Your Rewards
        </h3>
        <p className="text-xs text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text)]">
          Complete challenges and share to unlock exclusive discounts
        </p>
      </div>

      {/* Rewards grid */}
      {rewards.length > 0 ? (
        <div className="space-y-2">
          {rewards.map((reward, index) => (
            <div
              key={reward.code}
              className={`p-3 rounded-lg bg-gradient-to-r from-[#FF9800]/10 to-[#FFC107]/10 border border-[#FF9800]/30 dark:border-[#FF9800]/20 transition-smooth ${
                animateRewards ? 'animate-slide-in-left' : 'opacity-0'
              }`}
              style={{
                animationDelay: animateRewards ? `${index * 150}ms` : '0ms',
                animationFillMode: 'both'
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-2xl animate-float">🏆</div>
                  <div>
                    <div className="font-bold text-[#FF9800] text-lg">{reward.discount}% Off</div>
                    <div className="text-xs text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text)] font-mono bg-[var(--color-card-bg)] dark:bg-[var(--color-dark-border)] px-2 py-1 rounded inline-block">
                      {reward.code}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-[var(--color-text-tertiary)] dark:text-[var(--color-dark-text)]">
                    Expires
                  </div>
                  <div className="text-xs font-semibold text-[var(--color-accent)]">
                    {new Date(reward.expiresAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-6 rounded-lg bg-gradient-to-br from-[var(--color-card-bg)] to-[var(--color-bg-secondary)] dark:from-[var(--color-dark-border)] dark:to-[var(--color-dark-surface)] text-center animate-fade-in border border-[var(--color-card-border)] dark:border-[var(--color-dark-border)]">
          <div className="text-4xl mb-2 animate-bounce">🎯</div>
          <p className="text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text)]">
            No rewards yet. Complete challenges to earn discounts!
          </p>
          <p className="text-xs text-[var(--color-text-tertiary)] dark:text-[var(--color-dark-text)] mt-1">
            Share your results and hit milestones to unlock exclusive offers
          </p>
        </div>
      )}

      {/* Redemption toggle */}
      <button
        onClick={() => setShowRedemption(!showRedemption)}
        className="w-full px-3 py-2 text-sm font-semibold text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] transition-smooth text-center border border-[var(--color-accent)]/30 rounded-lg hover:border-[var(--color-accent)]/60"
      >
        {showRedemption ? "Hide redemption form ↑" : "Have a reward code? Redeem it →"}
      </button>

      {/* Redemption form */}
      {showRedemption && (
        <div className="animate-slide-in-left">
          <RewardRedemption resultId={resultId} />
        </div>
      )}
    </div>
  );
}
