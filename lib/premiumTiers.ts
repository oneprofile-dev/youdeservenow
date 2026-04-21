import { kv } from "@vercel/kv";

export interface PremiumTier {
  id: "bronze" | "silver" | "gold" | "platinum";
  name: string;
  minPoints: number;
  maxPoints: number;
  rewards: string[];
  bonusMultiplier: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  points: number;
  unlockCondition: string;
}

export interface Badge {
  id: string;
  userId: string;
  achievementId: string;
  unlockedAt: number;
}

// Premium tiers definition
export const PREMIUM_TIERS: PremiumTier[] = [
  {
    id: "bronze",
    name: "Bronze",
    minPoints: 0,
    maxPoints: 499,
    rewards: ["5% affiliate bonus", "Basic leaderboard access"],
    bonusMultiplier: 1.0,
  },
  {
    id: "silver",
    name: "Silver",
    minPoints: 500,
    maxPoints: 1499,
    rewards: ["10% affiliate bonus", "Priority support", "Weekly challenges bonus"],
    bonusMultiplier: 1.1,
  },
  {
    id: "gold",
    name: "Gold",
    minPoints: 1500,
    maxPoints: 4999,
    rewards: [
      "15% affiliate bonus",
      "24/7 support",
      "Seasonal challenges",
      "Early reward access",
    ],
    bonusMultiplier: 1.25,
  },
  {
    id: "platinum",
    name: "Platinum",
    minPoints: 5000,
    maxPoints: Infinity,
    rewards: [
      "20% affiliate bonus",
      "VIP support",
      "Custom rewards",
      "Exclusive leaderboard",
      "Referral bonuses",
    ],
    bonusMultiplier: 1.5,
  },
];

// Achievement definitions
export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first_purchase",
    name: "First Steps",
    description: "Make your first purchase",
    icon: "🏃",
    points: 10,
    unlockCondition: "purchase_count=1",
  },
  {
    id: "power_user",
    name: "Power User",
    description: "Complete 50 leaderboards",
    icon: "⚡",
    points: 50,
    unlockCondition: "leaderboard_count=50",
  },
  {
    id: "challenge_master",
    name: "Challenge Master",
    description: "Complete 20 weekly challenges",
    icon: "🎯",
    points: 100,
    unlockCondition: "challenge_count=20",
  },
  {
    id: "influencer",
    name: "Influencer",
    description: "Get 100 referral clicks",
    icon: "📢",
    points: 200,
    unlockCondition: "referral_clicks=100",
  },
  {
    id: "gold_digger",
    name: "Gold Digger",
    description: "Reach Gold tier",
    icon: "🏅",
    points: 150,
    unlockCondition: "tier=gold",
  },
  {
    id: "platinum_pro",
    name: "Platinum Pro",
    description: "Reach Platinum tier",
    icon: "👑",
    points: 300,
    unlockCondition: "tier=platinum",
  },
];

// Get user's current tier
export async function getUserTier(
  userId: string
): Promise<PremiumTier | null> {
  const points = (await kv.get<number>(`user:${userId}:points`)) || 0;
  const tier = PREMIUM_TIERS.find(
    (t) => points >= t.minPoints && points <= t.maxPoints
  );
  return tier || null;
}

// Add points to user
export async function addUserPoints(userId: string, points: number) {
  await kv.incrbyfloat(`user:${userId}:points`, points);
  return await kv.get<number>(`user:${userId}:points`);
}

// Award achievement
export async function awardAchievement(
  userId: string,
  achievementId: string
): Promise<Badge | null> {
  // Check if already awarded
  const existing = await kv.get(
    `user:${userId}:achievement:${achievementId}`
  );
  if (existing) return null;

  const achievement = ACHIEVEMENTS.find((a) => a.id === achievementId);
  if (!achievement) return null;

  const badge: Badge = {
    id: `badge:${Date.now()}:${Math.random().toString(36).substr(2, 9)}`,
    userId,
    achievementId,
    unlockedAt: Date.now(),
  };

  await Promise.all([
    kv.hset(`badge:${badge.id}`, badge as unknown as Record<string, unknown>),
    kv.set(`user:${userId}:achievement:${achievementId}`, 1),
    kv.lpush(`user:${userId}:badges`, badge.id),
    addUserPoints(userId, achievement.points),
  ]);

  return badge;
}

// Get user badges
export async function getUserBadges(userId: string): Promise<Badge[]> {
  const badgeIds = await kv.lrange(`user:${userId}:badges`, 0, -1);
  const badges = [];

  for (const id of badgeIds) {
    const badge = await kv.hgetall(`badge:${id}`);
    if (badge) badges.push(badge as unknown as Badge);
  }

  return badges;
}

// Get achievement details
export async function getAchievementDetails(achievementId: string) {
  return ACHIEVEMENTS.find((a) => a.id === achievementId);
}

// Check and auto-award achievements
export async function checkAndAwardAchievements(
  userId: string,
  stats: Record<string, number>
) {
  const awarded = [];

  for (const achievement of ACHIEVEMENTS) {
    // Parse condition
    const [key, expectedValue] = achievement.unlockCondition.split("=");
    const actualValue = stats[key];

    if (actualValue !== undefined) {
      const expected = parseInt(expectedValue);

      if (key === "tier") {
        // Special case for tier achievements
        if (String(actualValue) === expectedValue) {
          const badge = await awardAchievement(userId, achievement.id);
          if (badge) awarded.push(badge);
        }
      } else if (actualValue >= expected) {
        const badge = await awardAchievement(userId, achievement.id);
        if (badge) awarded.push(badge);
      }
    }
  }

  return awarded;
}

// Get leaderboard by tier
export async function getTierLeaderboard(
  tier: "bronze" | "silver" | "gold" | "platinum",
  limit: number = 10
) {
  // This would query users filtered by tier
  // Simplified implementation - in production would use more efficient querying
  const keys = await kv.keys("user:*:points");
  const users = [];

  for (const key of keys) {
    const points = await kv.get<number>(key);
    const userId = key.split(":")[1];
    const userTier = await getUserTier(userId);

    if (userTier?.id === tier) {
      users.push({ userId, points: points || 0 });
    }
  }

  return users
    .sort((a, b) => b.points - a.points)
    .slice(0, limit);
}
