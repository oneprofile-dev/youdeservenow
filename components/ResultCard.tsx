"use client";

import { useRef } from "react";
import type { Result } from "@/lib/db";
import dynamic from "next/dynamic";
import ShareCard from "./ShareCard";
import { RankingBadge } from "./RankingBadge";
import { getPersonalityType } from "@/lib/personality";
import LikeButton from "./LikeButton";

// Lazy load heavy components (below the fold)
const RealtimeMetrics = dynamic(() => import("./RealtimeMetrics").then((m) => ({ default: m.RealtimeMetrics })), {
  loading: () => <div className="h-20 bg-[var(--color-card-bg)] dark:bg-[var(--color-dark-border)] rounded animate-pulse" />,
  ssr: false,
});

const ProductRecommendation = dynamic(() => import("./ProductRecommendation"), {
  loading: () => <div className="h-20 bg-[var(--color-card-bg)] dark:bg-[var(--color-dark-border)] rounded animate-pulse" />,
  ssr: false,
});

const RewardPersonality = dynamic(() => import("./RewardPersonality"), {
  loading: () => <div className="h-16 bg-[var(--color-card-bg)] dark:bg-[var(--color-dark-border)] rounded animate-pulse" />,
  ssr: false,
});

const CertificateDownload = dynamic(() => import("./CertificateDownload"), {
  loading: () => <div className="h-10 bg-[var(--color-card-bg)] dark:bg-[var(--color-dark-border)] rounded animate-pulse" />,
  ssr: false,
});

const ShareButtons = dynamic(() => import("./ShareButtons"), {
  loading: () => <div className="h-10 bg-[var(--color-card-bg)] dark:bg-[var(--color-dark-border)] rounded animate-pulse" />,
  ssr: false,
});

const RewardsShowcase = dynamic(() => import("./RewardsShowcase").then((m) => ({ default: m.RewardsShowcase })), {
  loading: () => <div className="h-24 bg-[var(--color-card-bg)] dark:bg-[var(--color-dark-border)] rounded animate-pulse" />,
  ssr: false,
});

interface ResultCardProps {
  result: Result;
  showShareCard?: boolean;
}

export default function ResultCard({ result, showShareCard = true }: ResultCardProps) {
  const shareCardRef = useRef<HTMLDivElement>(null);
  const personality = getPersonalityType(result.product.category, result.input);

  return (
    <div className="w-full max-w-2xl mx-auto animate-[slide-up_0.5s_ease-out]">
      {/* Gift banner */}
      {result.gift && (
        <div className="mb-6 flex items-start gap-3 p-4 rounded-2xl border-2 border-[#ff6b6b] bg-[#ff6b6b]/15">
          <span className="text-3xl flex-shrink-0 leading-none">💌</span>
          <div>
            <p className="text-sm font-bold text-[#ff5252]">
              {result.gift.senderName
                ? `${result.gift.senderName} thinks science agrees:`
                : "Science agrees:"}
            </p>
            <p className="text-sm font-medium text-[var(--color-text-primary)] dark:text-[var(--color-dark-text)] mt-0.5">
              {result.gift.recipientName} deserves this. The evidence is overwhelming.
            </p>
          </div>
        </div>
      )}

      {/* Science verdict header */}
      <div className="text-center mb-6">
        <p className="text-xs uppercase tracking-widest text-[var(--color-accent)] font-semibold mb-2">
          The Science Is In
        </p>
        <h2
          className="text-3xl sm:text-4xl text-[var(--color-text-primary)] dark:text-[var(--color-dark-text)]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {result.gift ? `${result.gift.recipientName} Deserves This.` : "You Deserve This."}
        </h2>
      </div>

      {/* Card */}
      <div className="bg-[var(--color-card-bg)] dark:bg-[var(--color-dark-surface)] border border-[var(--color-card-border)] dark:border-[var(--color-dark-border)] rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
        {/* Input echo */}
        <div className="text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text)] italic border-l-2 border-[var(--color-accent)] pl-4">
          &ldquo;{result.input}&rdquo;
        </div>

        {/* Justification */}
        <blockquote
          className="text-lg sm:text-xl leading-relaxed text-[var(--color-text-primary)] dark:text-[var(--color-dark-text)]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {result.justification}
        </blockquote>

        {/* Divider */}
        <div className="h-px bg-[var(--color-card-border)] dark:bg-[var(--color-dark-border)]" />

        {/* Ranking badge */}
        <div className="flex justify-center">
          <RankingBadge resultId={result.id} />
        </div>

        {/* Product */}
        <ProductRecommendation product={result.product} />

        {/* Divider */}
        <div className="h-px bg-[var(--color-card-border)] dark:bg-[var(--color-dark-border)]" />

        {/* Real-time Metrics */}
        <RealtimeMetrics resultId={result.id} category={result.product.category} />

        {/* Divider */}
        <div className="h-px bg-[var(--color-card-border)] dark:bg-[var(--color-dark-border)]" />

        {/* Rewards Showcase */}
        <RewardsShowcase resultId={result.id} />

        {/* Divider */}
        <div className="h-px bg-[var(--color-card-border)] dark:bg-[var(--color-dark-border)]" />

        {/* Reward Personality */}
        <RewardPersonality personality={personality} resultId={result.id} />

        {/* Divider */}
        <div className="h-px bg-[var(--color-card-border)] dark:bg-[var(--color-dark-border)]" />

        {/* Share + Certificate */}
        <div className="text-center space-y-3">
          <div className="flex justify-center mb-1">
            <LikeButton resultId={result.id} />
          </div>
          <p className="text-xs uppercase tracking-widest text-[var(--color-text-tertiary)] dark:text-[var(--color-dark-text)]">
            Share your diagnosis
          </p>
          <ShareButtons result={result} shareCardRef={shareCardRef} />
          <div className="pt-1">
            <CertificateDownload result={result} />
          </div>
        </div>
      </div>

      {/* Off-screen share card for image download */}
      {showShareCard && (
        <div className="fixed -left-[9999px] top-0 pointer-events-none" aria-hidden="true">
          <ShareCard ref={shareCardRef} result={result} />
        </div>
      )}
    </div>
  );
}
