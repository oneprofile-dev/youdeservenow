"use client";

import Link from "next/link";
import { useState } from "react";
import type { LeaderboardEntry } from "@/lib/leaderboards";

interface LeaderboardCardProps {
  entry: LeaderboardEntry;
}

export function LeaderboardCard({ entry }: LeaderboardCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Determine medal color based on rank
  const getMedalEmoji = (rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return null;
  };

  const medal = getMedalEmoji(entry.rank);

  // Format numbers with K/M notation
  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative group transition-all duration-200 ${
        isHovered ? "scale-102" : "scale-100"
      }`}
    >
      <div
        className={`relative border rounded-lg overflow-hidden transition-all duration-200 ${
          isHovered
            ? "border-gray-300 shadow-lg bg-white"
            : "border-gray-200 shadow-sm bg-white"
        }`}
      >
        {/* Rank badge with optional medal */}
        <div
          className={`absolute top-3 left-3 flex items-center gap-1 transition-all duration-200 ${
            medal ? "text-lg" : ""
          }`}
        >
          {medal && <span className="text-xl">{medal}</span>}
          <span
            className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold transition-colors ${
              entry.rank <= 3
                ? "bg-yellow-100 text-yellow-700"
                : entry.rank <= 10
                  ? "bg-blue-100 text-blue-700"
                  : entry.rank <= 50
                    ? "bg-gray-100 text-gray-700"
                    : "bg-gray-50 text-gray-600"
            }`}
          >
            #{entry.rank}
          </span>
        </div>

        {/* Main content */}
        <Link href={`/result/${entry.id}`}>
          <div className="p-4 sm:p-6 cursor-pointer">
            {/* Category and Persona */}
            <div className="mb-3 flex items-center gap-2">
              <span className="inline-block px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full border border-blue-200">
                {entry.result?.product?.category || "Gift"}
              </span>
              {entry.result?.product?.name && (
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide line-clamp-1">
                  {entry.result.product.name}
                </span>
              )}
            </div>

            {/* Title */}
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 line-clamp-2">
              {entry.result?.input || `Gift #${entry.id.slice(0, 8)}`}
            </h3>

            {/* Metrics grid */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {/* Likes */}
              <div
                className={`p-3 rounded-lg transition-colors ${
                  isHovered ? "bg-pink-50 border border-pink-200" : "bg-gray-50"
                }`}
              >
                <div className="text-xs text-gray-600 font-medium mb-1">
                  ❤️ Likes
                </div>
                <div className="text-lg sm:text-xl font-bold text-pink-600">
                  {formatNumber(entry.likes)}
                </div>
              </div>

              {/* Shares */}
              <div
                className={`p-3 rounded-lg transition-colors ${
                  isHovered ? "bg-green-50 border border-green-200" : "bg-gray-50"
                }`}
              >
                <div className="text-xs text-gray-600 font-medium mb-1">
                  🔄 Shares
                </div>
                <div className="text-lg sm:text-xl font-bold text-green-600">
                  {formatNumber(entry.shares)}
                </div>
              </div>

              {/* Affiliate Clicks */}
              <div
                className={`p-3 rounded-lg transition-colors ${
                  isHovered ? "bg-purple-50 border border-purple-200" : "bg-gray-50"
                }`}
              >
                <div className="text-xs text-gray-600 font-medium mb-1">
                  🛍️ Clicks
                </div>
                <div className="text-lg sm:text-xl font-bold text-purple-600">
                  {formatNumber(entry.affiliateClicks)}
                </div>
              </div>
            </div>

            {/* Quality score bar */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-600">
                  Quality Score
                </span>
                <span className="text-sm font-bold text-gray-900">
                  {entry.qualityScore}
                </span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min((entry.qualityScore / 100) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </Link>

        {/* Hover overlay button */}
        {isHovered && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/5 rounded-lg pointer-events-none">
            <div className="text-sm font-semibold text-gray-700 bg-white px-4 py-2 rounded-lg shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
              View Details
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
