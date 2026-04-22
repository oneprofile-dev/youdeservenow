"use client";

import { useState } from "react";
import { track } from "@vercel/analytics/react";
import type { Result } from "@/lib/db";

interface PublishModalProps {
  result: Result;
  onPublish: (isPublic: boolean) => Promise<void>;
  onClose: () => void;
}

export default function PublishModal({ result, onPublish, onClose }: PublishModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [choice, setChoice] = useState<"private" | "public" | null>(null);

  const handlePublish = async (isPublic: boolean) => {
    setIsLoading(true);
    setChoice(isPublic ? "public" : "private");

    try {
      await onPublish(isPublic);

      // Track the choice
      track("result_publish_choice", {
        choice: isPublic ? "public" : "private",
        category: result.product.category,
      });

      // Close after brief delay to show confirmation
      setTimeout(onClose, 500);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--color-card-bg)] dark:bg-[var(--color-dark-surface)] rounded-2xl border border-[var(--color-card-border)] dark:border-[var(--color-dark-border)] max-w-md w-full p-6 animate-[scale-up_0.3s_ease-out]">
        {/* Header */}
        <div className="mb-6 text-center">
          <h2
            className="text-2xl font-bold text-[var(--color-text-primary)] dark:text-[var(--color-dark-text)] mb-2"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Share Your Moment?
          </h2>
          <p className="text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text)]">
            Would you like to post this to the public ledger so others can see your justification?
          </p>
        </div>

        {/* Preview */}
        <div className="mb-6 p-4 rounded-xl bg-[var(--color-bg-secondary)] dark:bg-[var(--color-dark-border)]">
          <p className="text-xs text-[var(--color-text-tertiary)] dark:text-[var(--color-dark-text)] mb-2 uppercase tracking-wider">
            Your justification
          </p>
          <p className="text-sm text-[var(--color-text-primary)] dark:text-[var(--color-dark-text)] line-clamp-3 leading-relaxed">
            {result.justification}
          </p>
        </div>

        {/* Choices */}
        <div className="space-y-3 mb-6">
          {/* Keep Private */}
          <button
            onClick={() => handlePublish(false)}
            disabled={isLoading}
            className="w-full px-4 py-3 rounded-xl border-2 border-[var(--color-card-border)] dark:border-[var(--color-dark-border)] text-[var(--color-text-primary)] dark:text-[var(--color-dark-text)] font-semibold hover:bg-[var(--color-bg-secondary)] dark:hover:bg-[var(--color-dark-border)] transition-colors disabled:opacity-50"
          >
            {choice === "private" && isLoading ? (
              <span className="inline-flex items-center gap-2">
                <span className="inline-block animate-spin">⏳</span>
                Keeping private...
              </span>
            ) : (
              <>
                <span className="block text-lg mb-1">🔒 Keep Private</span>
                <span className="text-xs text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text)]">
                  Just for you
                </span>
              </>
            )}
          </button>

          {/* Post Publicly */}
          <button
            onClick={() => handlePublish(true)}
            disabled={isLoading}
            className="w-full px-4 py-3 rounded-xl border-2 border-[var(--color-accent)] bg-[var(--color-accent)]/10 text-[var(--color-accent)] font-semibold hover:bg-[var(--color-accent)]/20 transition-colors disabled:opacity-50"
          >
            {choice === "public" && isLoading ? (
              <span className="inline-flex items-center gap-2">
                <span className="inline-block animate-spin">⏳</span>
                Posting...
              </span>
            ) : (
              <>
                <span className="block text-lg mb-1">🌍 Post to Ledger</span>
                <span className="text-xs text-[var(--color-accent)]/80">
                  Share with 50,000+ people
                </span>
              </>
            )}
          </button>
        </div>

        {/* Benefits of posting */}
        <div className="text-xs text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text)] space-y-2 p-4 rounded-lg bg-[var(--color-bg-secondary)]/50 dark:bg-[var(--color-dark-border)]/30">
          <p>✓ Your justification could be this week's #1</p>
          <p>✓ People upvote the funniest ones</p>
          <p>✓ Top posts get blasted on social</p>
        </div>
      </div>
    </div>
  );
}
