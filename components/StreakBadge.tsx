"use client";

import { useEffect, useState } from "react";
import { getStreakFromCookies, getStreakLabel, isRareDiagnosis } from "@/lib/streak";

export default function StreakBadge() {
  const [streak, setStreak] = useState<{ count: number; isNew: boolean } | null>(null);

  useEffect(() => {
    const data = getStreakFromCookies();
    if (data.count > 1) setStreak(data);
  }, []);

  if (!streak) return null;

  const rare = isRareDiagnosis(streak.count);
  const label = getStreakLabel(streak.count);

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border ${
        rare
          ? "border-[#C8963E] bg-[#C8963E]/10 text-[#C8963E]"
          : "border-[var(--color-card-border)] dark:border-[var(--color-dark-border)] bg-[var(--color-bg-secondary)] dark:bg-[var(--color-dark-bg)] text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text)]"
      } ${streak.isNew ? "animate-[fade-in_0.5s_ease-out]" : ""}`}
    >
      <span>{rare ? "🔥" : "⚡"}</span>
      <span>
        {streak.count}-day streak
        {rare && <span className="ml-1 opacity-70">· {label}</span>}
      </span>
    </div>
  );
}
