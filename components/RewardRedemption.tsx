"use client";

import { useState } from "react";
import useSWR from "swr";

interface RedeemRewardRequest {
  rewardCode: string;
  resultId?: string;
}

interface RedeemRewardResponse {
  success: boolean;
  message: string;
  reward?: {
    code: string;
    discount: number;
    type: string;
    expiresAt: string;
  };
}

const fetcher = (url: string) =>
  fetch(url).then((r) => {
    if (!r.ok) throw new Error("Failed to fetch rewards");
    return r.json();
  });

interface RewardRedemptionProps {
  resultId?: string;
  onClose?: () => void;
}

/**
 * Reward redemption modal for applying discount codes
 */
export function RewardRedemption({ resultId, onClose }: RewardRedemptionProps) {
  const [code, setCode] = useState("");
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [redeemStatus, setRedeemStatus] = useState<RedeemRewardResponse | null>(null);

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRedeeming(true);
    setRedeemStatus(null);

    try {
      const response = await fetch("/api/redeem-reward", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rewardCode: code.toUpperCase(),
          resultId,
        }),
      });

      const data = (await response.json()) as RedeemRewardResponse;
      setRedeemStatus(data);

      if (data.success) {
        setCode("");
      }
    } catch (error) {
      setRedeemStatus({
        success: false,
        message: "Failed to redeem reward. Please try again.",
      });
    } finally {
      setIsRedeeming(false);
    }
  };

  return (
    <div className="space-y-4 p-4 rounded-lg bg-[var(--color-card-bg)] dark:bg-[var(--color-dark-surface)] border border-[var(--color-card-border)] dark:border-[var(--color-dark-border)]">
      {/* Header */}
      <div className="space-y-1">
        <h3 className="text-lg font-bold text-[var(--color-text-primary)] dark:text-[var(--color-dark-text)]">
          🎁 Redeem Reward Code
        </h3>
        <p className="text-xs text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text)]">
          Enter your reward code to unlock exclusive discounts
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleRedeem} className="space-y-2">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Enter reward code (e.g., YDN_SAVE_20)"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            disabled={isRedeeming}
            className="flex-1 px-3 py-2 rounded-lg border border-[var(--color-card-border)] dark:border-[var(--color-dark-border)] bg-[var(--color-card-bg)] dark:bg-[var(--color-dark-border)] text-[var(--color-text-primary)] dark:text-[var(--color-dark-text)] disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!code.trim() || isRedeeming}
            className="px-4 py-2 rounded-lg bg-[var(--color-accent)] text-white font-semibold disabled:opacity-50 hover:opacity-90 transition-opacity"
          >
            {isRedeeming ? "..." : "Redeem"}
          </button>
        </div>

        {/* Status messages */}
        {redeemStatus && (
          <div
            className={`p-3 rounded-lg text-sm ${
              redeemStatus.success
                ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800"
                : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800"
            }`}
          >
            {redeemStatus.message}
          </div>
        )}

        {/* Reward details if redeemed */}
        {redeemStatus?.success && redeemStatus?.reward && (
          <div className="p-3 rounded-lg bg-[var(--color-accent)]/10 border border-[var(--color-accent)] space-y-1">
            <div className="text-sm font-bold text-[var(--color-accent)]">
              {redeemStatus.reward.discount}% Off
            </div>
            <div className="text-xs text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text)]">
              Expires {new Date(redeemStatus.reward.expiresAt).toLocaleDateString()}
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
