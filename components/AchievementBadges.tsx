"use client";

import { useEffect, useState } from "react";
import { Badge, ACHIEVEMENTS } from "@/lib/premiumTiers";

export function AchievementBadges({ userId }: { userId: string }) {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        const res = await fetch(`/api/achievements?userId=${userId}`);
        if (res.ok) {
          const data = await res.json();
          setBadges(data.badges || []);
        }
      } catch (error) {
        console.error("Failed to fetch badges:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBadges();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex gap-2">
        {Array(4)
          .fill(0)
          .map((_, i) => (
            <div
              key={i}
              className="w-12 h-12 rounded-full bg-gray-200 animate-pulse"
            />
          ))}
      </div>
    );
  }

  const unlockedIds = new Set(badges.map((b) => b.achievementId));

  return (
    <div className="space-y-4">
      <h3 className="font-bold text-gray-900">Achievements</h3>
      
      {/* Unlocked Badges */}
      {badges.length > 0 && (
        <div>
          <p className="text-xs text-gray-600 mb-2">Unlocked</p>
          <div className="flex gap-2 flex-wrap">
            {badges.map((badge) => {
              const achievement = ACHIEVEMENTS.find((a) => a.id === badge.achievementId);
              return (
                <div
                  key={badge.id}
                  className="relative group"
                  title={achievement?.name}
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-lg hover:scale-110 transition-transform cursor-pointer">
                    <span className="text-xl">{achievement?.icon}</span>
                  </div>
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    {achievement?.name}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Locked Achievements */}
      <div>
        <p className="text-xs text-gray-600 mb-2">
          Coming up ({ACHIEVEMENTS.length - badges.length} locked)
        </p>
        <div className="flex gap-2 flex-wrap opacity-40">
          {ACHIEVEMENTS.filter((a) => !unlockedIds.has(a.id)).map(
            (achievement) => (
              <div
                key={achievement.id}
                className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center"
                title={achievement.name}
              >
                <span className="text-xl opacity-50">{achievement.icon}</span>
              </div>
            )
          )}
        </div>
      </div>

      {/* Achievement Details */}
      <div className="mt-4 space-y-2">
        {ACHIEVEMENTS.map((achievement) => (
          <div key={achievement.id} className="flex items-center gap-3 p-2 rounded border border-gray-100 hover:bg-gray-50">
            <span className="text-xl">{achievement.icon}</span>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                {achievement.name}
              </p>
              <p className="text-xs text-gray-600">{achievement.description}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold text-blue-600">
                +{achievement.points} pts
              </p>
              {unlockedIds.has(achievement.id) && (
                <p className="text-xs text-green-600">✓ Unlocked</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
