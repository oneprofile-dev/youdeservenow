"use client";

import { ChallengeCard } from "./ChallengeCard";
import type { Challenge } from "@/lib/challenges";

interface ChallengesGridProps {
  challenges: Challenge[];
  userProgress?: Record<string, number>; // Map of challenge ID to current progress
  title?: string;
  description?: string;
}

/**
 * Responsive grid of challenge cards
 */
export function ChallengesGrid({
  challenges,
  userProgress = {},
  title = "Weekly Challenges",
  description = "Complete these challenges to unlock exclusive rewards",
}: ChallengesGridProps) {
  if (challenges.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text)]">
          No challenges available this week
        </p>
        <p className="text-sm text-[var(--color-text-tertiary)] dark:text-[var(--color-dark-text)] mt-2">
          Check back next week for new challenges!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-[var(--color-text-primary)] dark:text-[var(--color-dark-text)]">
          {title}
        </h2>
        <p className="text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text)]">
          {description}
        </p>
      </div>

      {/* Challenges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
        {challenges.map((challenge) => (
          <ChallengeCard
            key={challenge.id}
            challenge={challenge}
            userProgress={userProgress[challenge.id] || 0}
          />
        ))}
      </div>

      {/* Stats */}
      <div className="mt-8 p-4 rounded-lg bg-[var(--color-card-bg)] dark:bg-[var(--color-dark-border)] border border-[var(--color-card-border)] dark:border-[var(--color-dark-border)]">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-[var(--color-accent)]">{challenges.length}</div>
            <div className="text-xs text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text)]">
              Challenges
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-[#4CAF50]">
              {Object.values(userProgress).filter((p) => {
                const challenge = challenges.find(
                  (c) => userProgress[c.id] === p
                );
                return challenge && p >= challenge.goal;
              }).length}
            </div>
            <div className="text-xs text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text)]">
              Completed
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-[#FF9800]">
              {Math.round(
                (Object.values(userProgress).reduce((sum, p, i) => {
                  const challenge = challenges[i];
                  return sum + (challenge ? Math.min(p, challenge.goal) / challenge.goal : 0);
                }, 0) /
                  Math.max(challenges.length, 1)) *
                  100
              )}%
            </div>
            <div className="text-xs text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text)]">
              Overall Progress
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
