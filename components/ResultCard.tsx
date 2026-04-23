"use client";

import { useRef, useState, useEffect } from "react";
import type { Result } from "@/lib/db";
import dynamic from "next/dynamic";
import ShareCard from "./ShareCard";
import { RankingBadge } from "./RankingBadge";
import { getPersonalityType } from "@/lib/personality";
import LikeButton from "./LikeButton";
import UpvoteButton from "./UpvoteButton";
import ResultClosure from "./ResultClosure";
import PublishModal from "./PublishModal";
import GiftSharePrompt from "./GiftSharePrompt";

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
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [isPublished, setIsPublished] = useState(result.isPublic || false);

  // Show publish modal after component mounts (after initial render)
  useEffect(() => {
    if (!isPublished) {
      const timer = setTimeout(() => setShowPublishModal(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [isPublished]);

  const handlePublish = async (isPublic: boolean) => {
    try {
      const response = await fetch("/api/ledger/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resultId: result.id, isPublic }),
      });

      if (!response.ok) throw new Error("Failed to publish");

      setIsPublished(isPublic);
    } catch (error) {
      console.error("Failed to publish result:", error);
    }
  };

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
        <p className="mt-3 text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text)] max-w-md mx-auto leading-relaxed">
          {result.gift
            ? "What they did mattered. This is a little ceremony to say it out loud."
            : "Whatever you did today counted. Consider this your official receipt."}
        </p>
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
        <ProductRecommendation product={result.product} justification={result.justification} input={result.input} />

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
          <div className="flex justify-center items-center gap-3 mb-1">
            <LikeButton resultId={result.id} />
            <div className="w-px h-6 bg-[var(--color-card-border)] dark:bg-[var(--color-dark-border)]" />
            <UpvoteButton resultId={result.id} initialLikes={0} />
          </div>
          <p className="text-xs uppercase tracking-widest text-[var(--color-text-tertiary)] dark:text-[var(--color-dark-text)]">
            Share your diagnosis
          </p>
          <ShareButtons result={result} shareCardRef={shareCardRef} />
          <div className="pt-1">
            <CertificateDownload result={result} />
          </div>
        </div>

        <ResultClosure result={result} />
      </div>

      {/* Gift/Share prompt - encourage viral loop */}
      <div className="mt-8">
        <GiftSharePrompt recipientName={result.gift?.recipientName} />
      </div>

      {/* Off-screen share card for image download */}
      {showShareCard && (
        <div className="fixed -left-[9999px] top-0 pointer-events-none" aria-hidden="true">
          <ShareCard ref={shareCardRef} result={result} />
        </div>
      )}

      {/* Publish Modal - Ask user to share publicly */}
      {showPublishModal && !isPublished && (
        <PublishModal
          result={result}
          onPublish={handlePublish}
          onClose={() => setShowPublishModal(false)}
        />
      )}
    </div>
  );
}
