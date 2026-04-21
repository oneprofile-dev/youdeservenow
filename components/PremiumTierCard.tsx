"use client";

import { useEffect, useState } from "react";
import { PremiumTier } from "@/lib/premiumTiers";

export function PremiumTierCard({ userId }: { userId: string }) {
  const [tier, setTier] = useState<PremiumTier | null>(null);
  const [points, setPoints] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTier = async () => {
      try {
        const res = await fetch(`/api/tier?userId=${userId}`);
        if (res.ok) {
          const data = await res.json();
          setTier(data.tier);
          setPoints(data.points);
        }
      } catch (error) {
        console.error("Failed to fetch tier:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTier();
  }, [userId]);

  if (loading) {
    return <div className="bg-gray-200 animate-pulse h-48 rounded-lg" />;
  }

  if (!tier) return null;

  const tierColors = {
    bronze: "from-amber-700 to-amber-600",
    silver: "from-gray-400 to-gray-300",
    gold: "from-yellow-500 to-yellow-600",
    platinum: "from-blue-400 to-cyan-400",
  };

  const tierIcons = {
    bronze: "🥉",
    silver: "🥈",
    gold: "🥇",
    platinum: "👑",
  };

  const nextTier = [
    { id: "bronze", name: "Bronze" },
    { id: "silver", name: "Silver" },
    { id: "gold", name: "Gold" },
    { id: "platinum", name: "Platinum" },
  ].find((t) => t.id === tier.id) || null;

  const tierIndex = [
    "bronze",
    "silver",
    "gold",
    "platinum",
  ].indexOf(tier.id);
  const nextIndex = Math.min(tierIndex + 1, 3);
  const nextTierName = [
    "Silver",
    "Gold",
    "Platinum",
    "Platinum",
  ][tierIndex];
  const nextTierPoints = [
    500, 1500, 5000, Infinity,
  ][nextIndex];
  const pointsToNext = Math.max(0, nextTierPoints - points);

  return (
    <div
      className={`bg-gradient-to-br ${tierColors[tier.id]} text-white rounded-lg p-6 shadow-lg`}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm opacity-90 mb-1">Your Tier</p>
          <p className="text-3xl font-bold">{tierIcons[tier.id]} {tier.name}</p>
        </div>
        <div className="text-right">
          <p className="text-sm opacity-90">Points</p>
          <p className="text-2xl font-bold">{Math.floor(points)}</p>
        </div>
      </div>

      {/* Progress to next tier */}
      {tier.id !== "platinum" && (
        <div className="mb-4">
          <div className="flex justify-between text-xs mb-1">
            <span>Progress to {nextTierName}</span>
            <span>{pointsToNext} points needed</span>
          </div>
          <div className="w-full bg-white bg-opacity-30 rounded-full h-2">
            <div
              className="bg-white h-2 rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(
                  100,
                  ((points - tier.minPoints) /
                    (tier.maxPoints - tier.minPoints)) *
                    100
                )}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Rewards */}
      <div>
        <p className="text-xs opacity-90 mb-2 font-semibold">Tier Benefits:</p>
        <ul className="text-xs space-y-1">
          {tier.rewards.map((reward, i) => (
            <li key={i} className="opacity-90">
              ✓ {reward}
            </li>
          ))}
        </ul>
      </div>

      {/* Bonus multiplier */}
      <div className="mt-4 pt-4 border-t border-white border-opacity-30">
        <p className="text-xs">
          Earning multiplier: <span className="font-bold">×{tier.bonusMultiplier}</span>
        </p>
      </div>
    </div>
  );
}
