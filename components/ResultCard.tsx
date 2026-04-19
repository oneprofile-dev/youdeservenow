"use client";

import { useRef } from "react";
import type { Result } from "@/lib/db";
import ProductRecommendation from "./ProductRecommendation";
import ShareButtons from "./ShareButtons";
import ShareCard from "./ShareCard";
import CertificateDownload from "./CertificateDownload";

interface ResultCardProps {
  result: Result;
  showShareCard?: boolean;
}

export default function ResultCard({ result, showShareCard = true }: ResultCardProps) {
  const shareCardRef = useRef<HTMLDivElement>(null);

  return (
    <div className="w-full max-w-2xl mx-auto animate-[slide-up_0.5s_ease-out]">
      {/* Science verdict header */}
      <div className="text-center mb-6">
        <p className="text-xs uppercase tracking-widest text-[var(--color-accent)] font-semibold mb-2">
          The Science Is In
        </p>
        <h2
          className="text-3xl sm:text-4xl text-[var(--color-text-primary)] dark:text-[var(--color-dark-text)]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          You Deserve This.
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

        {/* Product */}
        <ProductRecommendation product={result.product} />

        {/* Divider */}
        <div className="h-px bg-[var(--color-card-border)] dark:bg-[var(--color-dark-border)]" />

        {/* Share + Certificate */}
        <div className="text-center space-y-3">
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
