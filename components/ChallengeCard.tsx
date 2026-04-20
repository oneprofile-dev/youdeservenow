"use client";

import { Challenge } from "@/lib/challenges";
import { ChallengeProgress } from "./ChallengeProgress";
import { format, formatDistanceToNow } from "date-fns";

interface ChallengeCardProps {
  challenge: Challenge;
  userProgress?: number; // Current progress toward goal (default 0)
  compact?: boolean;
}

const CHALLENGE_EMOJI: Record<string, string> = {
  gifts: "🎁",
  streaks: "🔥",
  personalities: "🧬",
  shares: "📤",
};

/**
 * Individual challenge card with progress
 */
export function ChallengeCard({ challenge, userProgress = 0, compact = false }: ChallengeCardProps) {
  const emoji = CHALLENGE_EMOJI[challenge.category] || "⭐";
  const endsAt = new Date(challenge.endsAt);
  const timeRemaining = formatDistanceToNow(endsAt, { addSuffix: true });

  if (compact) {
    // Compact horizontal layout for leaderboards
    return (
      <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--color-card-bg)] dark:bg-[var(--color-dark-border)] border border-[var(--color-card-border)] dark:border-[var(--color-dark-border)]">
        <div className="text-2xl flex-shrink-0">{emoji}</div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)] dark:text-[var(--color-dark-text)] truncate">
            {challenge.title}
          </h3>
          <p className="text-xs text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text)]">
            {userProgress}/{challenge.goal} {challenge.goalLabel}
          </p>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="text-xs font-bold text-[var(--color-accent)]">
            {Math.round((userProgress / challenge.goal) * 100)}%
          </div>
        </div>
      </div>
    );
  }

  // Full card layout
  return (
    <div className="p-4 rounded-xl bg-[var(--color-card-bg)] dark:bg-[var(--color-dark-surface)] border border-[var(--color-card-border)] dark:border-[var(--color-dark-border)] space-y-3 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">{emoji}</span>
            <h3 className="text-lg font-bold text-[var(--color-text-primary)] dark:text-[var(--color-dark-text)]">
              {challenge.title}
            </h3>
          </div>
          <p className="text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text)]">
            {challenge.description}
          </p>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="text-xs font-semibold text-[var(--color-accent)] mb-1">Reward</div>
          <div className="font-bold text-sm text-[#FF9800]">{challenge.reward}</div>
        </div>
      </div>

      {/* Progress */}
      <ChallengeProgress
        current={userProgress}
        goal={challenge.goal}
        goalLabel={challenge.goalLabel}
        rewardValue={challenge.rewardValue}
        reward={challenge.reward}
      />

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-[var(--color-text-tertiary)] dark:text-[var(--color-dark-text)] pt-2 border-t border-[var(--color-card-border)] dark:border-[var(--color-dark-border)]">
        <span>📅 Ends {timeRemaining}</span>
        <span className="font-semibold">Weekly Challenge</span>
      </div>
    </div>
  );
}
