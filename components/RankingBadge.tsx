"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";

interface RankingBadgeProps {
  resultId: string;
}

interface RankEntry {
  id: string;
  rank: number;
  likes: number;
  shares: number;
  affiliateClicks: number;
  qualityScore: number;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function RankingBadge({ resultId }: RankingBadgeProps) {
  const [mounted, setMounted] = useState(false);

  // Fetch rank for this result
  const { data } = useSWR(
    mounted ? `/api/leaderboards?sort=likes&resultId=${resultId}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // 1 minute
    }
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !data?.data || !data.data.length) return null;

  const entry: RankEntry = data.data[0];

  if (!entry || entry.rank > 100) return null; // Only show if in top 100

  // Determine badge color based on rank
  const getBadgeStyle = (rank: number) => {
    if (rank <= 3)
      return "bg-gradient-to-r from-yellow-100 to-yellow-50 border-yellow-300 text-yellow-800";
    if (rank <= 10)
      return "bg-gradient-to-r from-blue-100 to-blue-50 border-blue-300 text-blue-800";
    if (rank <= 50)
      return "bg-gradient-to-r from-purple-100 to-purple-50 border-purple-300 text-purple-800";
    return "bg-gradient-to-r from-gray-100 to-gray-50 border-gray-300 text-gray-800";
  };

  const getMedalEmoji = (rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return null;
  };

  const medal = getMedalEmoji(entry.rank);

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold transition-all ${getBadgeStyle(
        entry.rank
      )}`}
    >
      {medal && <span className="text-sm">{medal}</span>}
      <span>
        #{entry.rank} Ranked
        {entry.rank <= 10 ? " 🔥" : ""}
      </span>
      <span className="hidden sm:inline text-opacity-75">
        ({entry.likes} likes)
      </span>
    </div>
  );
}
