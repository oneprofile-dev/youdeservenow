"use client";

import { useEffect, useState } from "react";
import { track } from "@vercel/analytics/react";
import { getStreakFromCookies, getStreakLabel, isRareDiagnosis } from "@/lib/streak";

export default function StreakBadge() {
  const [streak, setStreak] = useState<{ count: number; isNew: boolean } | null>(null);

  useEffect(() => {
    const data = getStreakFromCookies();
    if (data.count > 1) {
      setStreak(data);
      if (data.isNew) {
        track("streak_incremented", { streak_count: data.count });
      }
    }
  }, []);

  if (!streak) return null;

  const rare = isRareDiagnosis(streak.count);
  const label = getStreakLabel(streak.count);
  const nextMilestone = streak.count % 7 === 0 ? streak.count + 7 : Math.ceil(streak.count / 7) * 7;
  const daysToNextMilestone = nextMilestone - streak.count;

  return (
    <div
      className={`inline-flex items-center gap-2 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-full text-xs font-semibold border ${
        rare
          ? "border-[#C8963E] bg-[#C8963E]/10 text-[#C8963E]"
          : "border-[var(--color-card-border)] dark:border-[var(--color-dark-border)] bg-[var(--color-bg-secondary)] dark:bg-[var(--color-dark-bg)] text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text)]"
      } ${streak.isNew ? "animate-[fade-in_0.5s_ease-out]" : ""}`}
      aria-label={`${streak.count}-day streak. ${daysToNextMilestone} days until your next milestone!`}
    >
      <span aria-hidden="true">{rare ? "🔥" : "⚡"}</span>
      <span>
        {streak.count}-day streak
        {rare && <span className="ml-1 opacity-70">· {label}</span>}
        {!rare && <span className="ml-1 opacity-60 text-[10px]">+{daysToNextMilestone}</span>}
      </span>
    </div>
  );
}
