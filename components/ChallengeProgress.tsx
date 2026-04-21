"use client";

import { useEffect, useState } from "react";

interface ChallengeProgressProps {
  current: number;
  goal: number;
  goalLabel: string;
  rewardValue: number;
  reward: string;
}

/**
 * Visual progress indicator for challenge completion
 */
export function ChallengeProgress({
  current,
  goal,
  goalLabel,
  rewardValue,
  reward,
}: ChallengeProgressProps) {
  const percentComplete = Math.min((current / goal) * 100, 100);
  const isComplete = current >= goal;
  const [animatedPercent, setAnimatedPercent] = useState(0);
  const [showReward, setShowReward] = useState(false);

  // Animate progress bar
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedPercent(percentComplete);
    }, 200); // Small delay for smooth entrance

    return () => clearTimeout(timer);
  }, [percentComplete]);

  // Animate reward reveal
  useEffect(() => {
    if (isComplete) {
      const timer = setTimeout(() => {
        setShowReward(true);
      }, 600); // After progress animation completes
      return () => clearTimeout(timer);
    } else {
      setShowReward(false);
    }
  }, [isComplete]);

  return (
    <div className="space-y-2 animate-slide-in-left">
      {/* Progress bar */}
      <div className="relative h-3 bg-[var(--color-card-bg)] dark:bg-[var(--color-dark-border)] rounded-full overflow-hidden shadow-inner">
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-out relative ${
            isComplete
              ? "bg-gradient-to-r from-[#4CAF50] via-[#66BB6A] to-[#45a049] animate-glow"
              : "bg-gradient-to-r from-[#2196F3] via-[#42A5F5] to-[#1976D2]"
          }`}
          style={{ width: `${animatedPercent}%` }}
        >
          {/* Animated shine effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
        </div>

        {/* Completion sparkle */}
        {isComplete && (
          <div className="absolute right-0 top-0 h-full w-4 bg-gradient-to-l from-yellow-400 to-transparent animate-pulse" />
        )}
      </div>

      {/* Progress text */}
      <div className="flex items-center justify-between">
        <div className="text-xs text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text)]">
          <span className="font-semibold text-[var(--color-accent)] tabular-nums">{current}</span>
          <span> / {goal} {goalLabel}</span>
          <span className="ml-2 text-[var(--color-text-tertiary)]">
            ({animatedPercent.toFixed(0)}%)
          </span>
        </div>

        {isComplete && (
          <div className="text-xs font-semibold text-green-600 dark:text-green-400 flex items-center gap-1 animate-bounce-in">
            ✓ Unlocked
          </div>
        )}
      </div>

      {/* Reward preview */}
      {showReward && (
        <div className="mt-2 p-3 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 animate-pop shadow-sm">
          <div className="flex items-center gap-2">
            <div className="text-lg animate-float">🎁</div>
            <div>
              <div className="text-sm font-semibold text-green-700 dark:text-green-400">
                {reward}
              </div>
              <div className="text-xs text-green-600 dark:text-green-500">
                {rewardValue}% discount • Ready to claim
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
