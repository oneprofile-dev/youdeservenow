"use client";

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

  return (
    <div className="space-y-2">
      {/* Progress bar */}
      <div className="relative h-3 bg-[var(--color-card-bg)] dark:bg-[var(--color-dark-border)] rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${
            isComplete ? "bg-gradient-to-r from-[#4CAF50] to-[#45a049]" : "bg-gradient-to-r from-[#2196F3] to-[#1976D2]"
          }`}
          style={{ width: `${percentComplete}%` }}
        />
      </div>

      {/* Progress text */}
      <div className="flex items-center justify-between">
        <div className="text-xs text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text)]">
          <span className="font-semibold text-[var(--color-accent)]">{current}</span>
          <span> / {goal} {goalLabel}</span>
        </div>

        {isComplete && (
          <div className="text-xs font-semibold text-green-600 dark:text-green-400 flex items-center gap-1">
            ✓ Unlocked
          </div>
        )}
      </div>

      {/* Reward preview */}
      {isComplete && (
        <div className="mt-2 p-2 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
          <div className="text-xs font-semibold text-green-700 dark:text-green-400">
            🎁 {reward}
          </div>
        </div>
      )}
    </div>
  );
}
