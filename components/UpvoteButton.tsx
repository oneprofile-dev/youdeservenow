"use client";

import { useState, useEffect } from "react";
import { track } from "@vercel/analytics/react";

interface UpvoteButtonProps {
  resultId: string;
  initialLikes?: number;
  onLikesChange?: (newCount: number) => void;
}

export default function UpvoteButton({
  resultId,
  initialLikes = 0,
  onLikesChange,
}: UpvoteButtonProps) {
  const [likes, setLikes] = useState(initialLikes);
  const [isUpvoted, setIsUpvoted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPulse, setShowPulse] = useState(false);

  // Fetch current vote status from localStorage
  useEffect(() => {
    const upvotedKey = `upvoted:${resultId}`;
    const wasUpvoted = localStorage.getItem(upvotedKey) === "true";
    setIsUpvoted(wasUpvoted);
  }, [resultId]);

  const handleUpvote = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isLoading) return;

    setIsLoading(true);
    const upvotedKey = `upvoted:${resultId}`;

    try {
      const action = isUpvoted ? "remove" : "upvote";
      const response = await fetch("/api/ledger/upvote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resultId, action }),
      });

      if (!response.ok) throw new Error("Failed to upvote");

      const data = await response.json();
      const newLikes = data.likes || 0;

      // Update local state
      setLikes(newLikes);
      const newUpvotedState = !isUpvoted;
      setIsUpvoted(newUpvotedState);

      // Persist to localStorage
      if (newUpvotedState) {
        localStorage.setItem(upvotedKey, "true");
      } else {
        localStorage.removeItem(upvotedKey);
      }

      // Notify parent
      onLikesChange?.(newLikes);

      // Show animation
      setShowPulse(true);
      setTimeout(() => setShowPulse(false), 600);

      // Analytics
      track("ledger_upvote", {
        resultId,
        action,
        totalLikes: newLikes,
      });
    } catch (error) {
      console.error("Failed to upvote:", error);
      // Revert optimistic update
      setIsUpvoted(!isUpvoted);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleUpvote}
      disabled={isLoading}
      className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all duration-200 active:scale-95 disabled:opacity-50 ${
        isUpvoted
          ? "bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 border border-rose-300 dark:border-rose-700"
          : "bg-[var(--color-bg-secondary)] dark:bg-[var(--color-dark-border)] text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text)] border border-transparent hover:bg-[var(--color-bg-secondary)] dark:hover:bg-[var(--color-dark-border)] hover:border-rose-300 dark:hover:border-rose-700"
      }`}
      aria-pressed={isUpvoted}
      aria-label={isUpvoted ? "Remove upvote" : "Upvote this justification"}
      title={isUpvoted ? "Remove upvote" : "Upvote this justification"}
    >
      {/* Heart icon with animation */}
      <span
        className={`inline-block transition-transform ${
          showPulse ? "animate-[scale_0.6_ease-out_0.3s]" : ""
        } ${isUpvoted ? "scale-110" : "scale-100"}`}
      >
        {isUpvoted ? "❤️" : "🤍"}
      </span>

      {/* Like counter */}
      <span className="text-sm font-semibold tabular-nums min-w-[2ch] text-center">
        {likes > 0 ? likes : ""}
      </span>
    </button>
  );
}
