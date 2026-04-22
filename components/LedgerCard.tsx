"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import type { Result } from "@/lib/db";
import { truncate, formatDate } from "@/lib/utils";
import UpvoteButton from "./UpvoteButton";

interface LedgerCardProps {
  result: Result;
  rank?: number;
  metrics?: {
    likes: number;
    shares: number;
  };
}

export default function LedgerCard({ result, rank, metrics = { likes: 0, shares: 0 } }: LedgerCardProps) {
  const [imageError, setImageError] = useState(false);
  const [currentLikes, setCurrentLikes] = useState(metrics.likes);

  // Get category color for visual variety
  const categoryColors: Record<string, { bg: string; accent: string; emoji: string }> = {
    comfort: { bg: "bg-amber-50 dark:bg-amber-950/20", accent: "text-amber-600 dark:text-amber-400", emoji: "🛋️" },
    tech: { bg: "bg-blue-50 dark:bg-blue-950/20", accent: "text-blue-600 dark:text-blue-400", emoji: "⌨️" },
    fitness: { bg: "bg-green-50 dark:bg-green-950/20", accent: "text-green-600 dark:text-green-400", emoji: "💪" },
    learning: { bg: "bg-yellow-50 dark:bg-yellow-950/20", accent: "text-yellow-600 dark:text-yellow-400", emoji: "📚" },
    wellness: { bg: "bg-rose-50 dark:bg-rose-950/20", accent: "text-rose-600 dark:text-rose-400", emoji: "🧘" },
    trending: { bg: "bg-purple-50 dark:bg-purple-950/20", accent: "text-purple-600 dark:text-purple-400", emoji: "🔥" },
  };

  const category = result.product.category.toLowerCase();
  const colors = categoryColors[category] || categoryColors.trending;

  return (
    <Link
      href={`/result/${result.id}`}
      className={`group block rounded-2xl border border-[var(--color-card-border)] dark:border-[var(--color-dark-border)] overflow-hidden transition-all duration-200 hover:shadow-lg hover:border-[var(--color-accent)] ${colors.bg}`}
    >
      <div className="p-4 sm:p-5 space-y-3">
        {/* Header: Rank + Category + Metrics */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {rank && (
              <span className="text-xl font-bold text-[var(--color-accent)] flex-shrink-0">#{rank}</span>
            )}
            <span className="text-lg flex-shrink-0">{colors.emoji}</span>
            <span className={`text-xs font-semibold uppercase tracking-wider flex-shrink-0 ${colors.accent}`}>
              {result.product.category}
            </span>
          </div>
          {metrics.likes > 0 && (
            <span className="text-sm font-medium text-[var(--color-accent)] flex-shrink-0">
              ❤️ {metrics.likes}
            </span>
          )}
        </div>

        {/* Input (User's accomplishment) - Truncated */}
        <div className="text-xs italic text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text)] line-clamp-1 hover:line-clamp-none transition-all">
          "{truncate(result.input, 80)}"
        </div>

        {/* Justification - Smart truncation with visual clarity */}
        <blockquote
          className="text-sm leading-relaxed text-[var(--color-text-primary)] dark:text-[var(--color-dark-text)] line-clamp-3 border-l-2 border-[var(--color-accent)] pl-3"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {truncate(result.justification, 140)}
          {result.justification.length > 140 && (
            <span className="text-[var(--color-accent)] font-semibold"> Read →</span>
          )}
        </blockquote>

        {/* Product Row - Image + Name */}
        <div className="flex items-center gap-3 pt-2 border-t border-[var(--color-card-border)] dark:border-[var(--color-dark-border)]">
          {/* Product Image */}
          <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-[var(--color-bg-primary)] dark:bg-[var(--color-dark-bg)]">
            {!imageError ? (
              <Image
                src={result.product.imageUrl}
                alt={result.product.name}
                fill
                className="object-cover"
                sizes="48px"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-lg">📦</div>
            )}
          </div>

          {/* Product Name */}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-[var(--color-text-primary)] dark:text-[var(--color-dark-text)] truncate">
              {truncate(result.product.name, 50)}
            </p>
            <p className="text-xs text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text)]">
              {result.product.price}
            </p>
          </div>
        </div>

        {/* Footer: Date + Engagement */}
        <div className="flex items-center justify-between pt-2 border-t border-[var(--color-card-border)]/50 dark:border-[var(--color-dark-border)]/50 gap-2">
          <span className="text-xs text-[var(--color-text-tertiary)] dark:text-[var(--color-dark-text)]">
            {formatDate(result.createdAt)}
          </span>

          <div className="flex items-center gap-2">
            {/* Upvote Button */}
            <UpvoteButton
              resultId={result.id}
              initialLikes={currentLikes}
              onLikesChange={setCurrentLikes}
            />

            {/* Share metric */}
            {metrics.shares > 0 && (
              <span className="text-xs text-[var(--color-accent)] bg-[var(--color-bg-secondary)] dark:bg-[var(--color-dark-border)] px-2 py-1 rounded-lg">
                🔄 {metrics.shares}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
