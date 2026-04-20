"use client";

import { useState } from "react";
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

  // Fetch earned rewards for this result
  const { data: rewardsData, isLoading } = useSWR<{
    success: boolean;
    data: Array<{ code: string; discount: number; type: string; expiresAt: string }>;
  }>(`/api/rewards?resultId=${resultId}`, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000,
  });

  const rewards = rewardsData?.data || [];

  if (isLoading) {
    return (
      <div className="text-center py-4">
        <div className="h-20 bg-[var(--color-card-bg)] dark:bg-[var(--color-dark-border)] rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
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
          {rewards.map((reward) => (
            <div
              key={reward.code}
              className="p-3 rounded-lg bg-gradient-to-r from-[#FF9800]/10 to-[#FFC107]/10 border border-[#FF9800]/30 dark:border-[#FF9800]/20"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-[#FF9800]">{reward.discount}% Off</div>
                  <div className="text-xs text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text)]">
                    Code: {reward.code}
                  </div>
                </div>
                <div className="text-xs text-[var(--color-text-tertiary)] dark:text-[var(--color-dark-text)]">
                  Exp: {new Date(reward.expiresAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-4 rounded-lg bg-[var(--color-card-bg)] dark:bg-[var(--color-dark-border)] text-center">
          <p className="text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text)]">
            No rewards yet. Complete challenges to earn discounts!
          </p>
        </div>
      )}

      {/* Redemption toggle */}
      <button
        onClick={() => setShowRedemption(!showRedemption)}
        className="w-full px-3 py-2 text-sm font-semibold text-[var(--color-accent)] hover:opacity-80 transition-opacity text-center"
      >
        {showRedemption ? "Hide" : "Have a code?"} →
      </button>

      {/* Redemption form */}
      {showRedemption && <RewardRedemption resultId={resultId} />}
    </div>
  );
}
