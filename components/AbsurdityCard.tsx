"use client";

import Link from "next/link";
import Image from "next/image";
import UpvoteButton from "./UpvoteButton";
import GaslightButton from "./GaslightButton";
import type { Result } from "@/lib/db";

interface AbsurdityCardProps {
  result: Result;
  rank?: number;
  rankType?: "legit" | "challenged";
}

export default function AbsurdityCard({ result, rank, rankType = "legit" }: AbsurdityCardProps) {
  // Fetch vote counts (these would come from props in real implementation)
  // For now, we'll let UpvoteButton and GaslightButton handle their own state

  const rankEmoji = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : `#${rank}`;

  return (
    <Link href={`/verdict/${result.id}`}>
      <div className="group cursor-pointer rounded-2xl border border-[var(--color-card-border)] dark:border-[var(--color-dark-border)] bg-[var(--color-card-bg)] dark:bg-[var(--color-dark-surface)] overflow-hidden transition-all duration-300 hover:border-[var(--color-accent)] hover:shadow-lg dark:hover:shadow-[0_8px_24px_rgba(0,0,0,0.3)]">
        {/* Header with rank and product */}
        <div className="p-5 border-b border-[var(--color-card-border)] dark:border-[var(--color-dark-border)]">
          <div className="flex items-start justify-between mb-3">
            {rank && (
              <div className="flex flex-col items-center gap-1 mr-2">
                <span className="text-2xl font-bold text-[var(--color-accent)]">
                  {rankEmoji}
                </span>
                <span className="text-xs font-semibold uppercase tracking-widest text-[var(--color-text-tertiary)] dark:text-[var(--color-dark-text)]">
                  {rankType === "challenged" ? "Most Challenged" : "Most Legit"}
                </span>
              </div>
            )}
            {result.product && (
              <div className="flex-1 ml-3 flex items-center gap-2">
                <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-white flex-shrink-0">
                  <Image
                    src={result.product.imageUrl}
                    alt={result.product.name}
                    fill
                    className="object-cover"
                    sizes="40px"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text)] uppercase tracking-widest">
                    {result.product.category}
                  </p>
                  <p className="text-sm font-bold text-[var(--color-text-primary)] dark:text-[var(--color-dark-text)] line-clamp-1">
                    {result.product.name}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Justification (the funny part) */}
        <div className="p-6 bg-[var(--color-bg-secondary)] dark:bg-[var(--color-dark-bg)]/50">
          {/* Input echo */}
          <p className="text-xs text-[var(--color-text-tertiary)] dark:text-[var(--color-dark-text)] font-semibold uppercase tracking-widest mb-2 opacity-60">
            They said:
          </p>
          <p className="text-sm italic text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text)] mb-4 line-clamp-2">
            &ldquo;{result.input}&rdquo;
          </p>

          {/* Justification */}
          <blockquote
            className="text-base sm:text-lg font-semibold leading-relaxed text-[var(--color-text-primary)] dark:text-[var(--color-dark-text)] line-clamp-3"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {result.justification}
          </blockquote>
        </div>

        {/* Voting footer */}
        <div className="p-4 border-t border-[var(--color-card-border)] dark:border-[var(--color-dark-border)] bg-[var(--color-card-bg)] dark:bg-[var(--color-dark-surface)]">
          <p className="text-xs uppercase tracking-widest text-[var(--color-text-tertiary)] dark:text-[var(--color-dark-text)] mb-3 font-semibold">
            Community Verdict
          </p>
          <div className="flex items-center gap-2">
            <div className="flex-1" onClick={(e) => e.preventDefault()}>
              <UpvoteButton resultId={result.id} initialLikes={0} />
            </div>
            <div className="flex-1" onClick={(e) => e.preventDefault()}>
              <GaslightButton resultId={result.id} initialGaslights={0} />
            </div>
          </div>
          <p className="text-xs text-center text-[var(--color-text-tertiary)] dark:text-[var(--color-dark-text)] mt-3">
            Click to see full verdict ➜
          </p>
        </div>
      </div>
    </Link>
  );
}
