"use client";

import useSWR from "swr";

interface AffiliateStats {
  resultId: string;
  affiliateClicks: number;
  shareCount: number;
  ctr: string;
  estimatedEarnings: {
    amazon: string;
    total: string;
  };
  lastUpdated: string;
}

interface AffiliateDashboardProps {
  resultId: string;
}

const fetcher = (url: string) =>
  fetch(url).then((r) => {
    if (!r.ok) throw new Error("Failed to fetch");
    return r.json();
  });

/**
 * Displays affiliate earnings dashboard
 * Shows clicks, CTR, and estimated earnings from shares
 */
export function AffiliateDashboard({ resultId }: AffiliateDashboardProps) {
  const { data, error, isLoading } = useSWR<{
    success: boolean;
    data: AffiliateStats;
  }>(`/api/affiliate-stats?resultId=${resultId}`, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: 60000, // Dedupe for 60 seconds
  });

  const stats = data?.data;

  if (isLoading) {
    return (
      <div className="text-xs text-[var(--color-text-tertiary)] dark:text-[var(--color-dark-text)] text-center py-2">
        Loading earnings...
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="text-xs text-[var(--color-text-tertiary)] dark:text-[var(--color-dark-text)] text-center py-2">
        Earnings data unavailable
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="text-xs uppercase tracking-widest text-[var(--color-accent)] font-semibold">
        💰 Affiliate Earnings
      </div>

      {/* Earnings Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Total Clicks */}
        <div className="p-3 rounded-lg bg-[var(--color-card-bg)] dark:bg-[var(--color-dark-border)]">
          <div className="text-xs text-[var(--color-text-tertiary)] dark:text-[var(--color-dark-text)] mb-1">
            Product Clicks
          </div>
          <div className="text-2xl font-bold text-[#4CAF50]">{stats.affiliateClicks}</div>
          <div className="text-xs text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text)] mt-1">
            CTR: {stats.ctr}
          </div>
        </div>

        {/* Estimated Earnings */}
        <div className="p-3 rounded-lg bg-[var(--color-card-bg)] dark:bg-[var(--color-dark-border)]">
          <div className="text-xs text-[var(--color-text-tertiary)] dark:text-[var(--color-dark-text)] mb-1">
            Est. Earnings
          </div>
          <div className="text-2xl font-bold text-[#FF9800]">{stats.estimatedEarnings.total}</div>
          <div className="text-xs text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text)] mt-1">
            Amazon affiliate
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="text-xs text-[var(--color-text-tertiary)] dark:text-[var(--color-dark-text)] border-t border-[var(--color-card-border)] dark:border-[var(--color-dark-border)] pt-2 mt-2">
        ℹ️ Earnings estimated at 3% commission. Updated every 60s.
      </div>
    </div>
  );
}
