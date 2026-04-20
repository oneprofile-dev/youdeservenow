import { getKV } from "./kv";
import { z } from "zod";

export const ChallengeSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime(),
  goal: z.number().positive(),
  goalLabel: z.string(), // e.g., "gifts sent", "shares", "personalities"
  reward: z.string(), // e.g., "10% off"
  rewardValue: z.number(), // e.g., 10 for 10% off
  category: z.enum(["gifts", "streaks", "personalities", "shares"]),
  criteria: z.enum(["gifts_sent", "shares_received", "personality_reveals"]),
  active: z.boolean(),
});

export type Challenge = z.infer<typeof ChallengeSchema>;

export const CHALLENGE_TEMPLATES = [
  {
    title: "Monday Momentum",
    description: "Send 5 meaningful gifts this week",
    goal: 5,
    goalLabel: "gifts sent",
    reward: "10% off",
    rewardValue: 10,
    category: "gifts" as const,
    criteria: "gifts_sent" as const,
  },
  {
    title: "Personality Clash",
    description: "Match someone of the opposite personality type",
    goal: 3,
    goalLabel: "personalities",
    reward: "15% off",
    rewardValue: 15,
    category: "personalities" as const,
    criteria: "personality_reveals" as const,
  },
  {
    title: "Streak Hero",
    description: "Maintain your streak for 7 consecutive days",
    goal: 7,
    goalLabel: "days",
    reward: "20% off",
    rewardValue: 20,
    category: "streaks" as const,
    criteria: "gifts_sent" as const, // Use gifts as proxy for daily engagement
  },
  {
    title: "Share Sensation",
    description: "Get 10 shares on your justifications",
    goal: 10,
    goalLabel: "shares",
    reward: "Legendary Badge",
    rewardValue: 25,
    category: "shares" as const,
    criteria: "shares_received" as const,
  },
];

/**
 * Generate weekly challenges (idempotent)
 * Run once per week via Vercel Cron
 */
export async function generateWeeklyChallenges(): Promise<Challenge[]> {
  const kv = await getKV();
  if (!kv) return [];

  const now = new Date();
  const weekStart = getWeekStart(now);
  const weekKey = `challenges:week:${weekStart.getTime()}`;

  // Check if already generated this week
  const existing = await kv.get<Challenge[]>(weekKey);
  if (existing) return existing;

  const challenges: Challenge[] = [];

  for (let i = 0; i < CHALLENGE_TEMPLATES.length; i++) {
    const template = CHALLENGE_TEMPLATES[i];
    const startDate = new Date(weekStart);
    const endDate = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);

    const challenge: Challenge = {
      id: `challenge_${weekStart.getTime()}_${i}`,
      ...template,
      startsAt: startDate.toISOString(),
      endsAt: endDate.toISOString(),
      active: true,
    };

    challenges.push(challenge);

    // Store in Redis (TTL: 14 days — covers challenge week + grace period)
    await kv.setex(
      `challenge:${challenge.id}`,
      14 * 24 * 60 * 60,
      JSON.stringify(challenge)
    );

    // Add to active challenges sorted set
    await kv.zadd("challenges:active", {
      score: startDate.getTime(),
      member: challenge.id,
    });
  }

  // Cache this week's challenges
  await kv.setex(weekKey, 7 * 24 * 60 * 60, JSON.stringify(challenges));

  console.log(`✅ Generated ${challenges.length} weekly challenges`);
  return challenges;
}

/**
 * Get active challenges
 */
export async function getActiveChallenges(): Promise<Challenge[]> {
  const kv = await getKV();
  if (!kv) return [];

  try {
    const now = Date.now();
    const challengeIds = (await kv.zrange("challenges:active", 0, -1)) as string[];

    const challenges: Challenge[] = [];
    for (const id of challengeIds) {
      const raw = await kv.get<string>(`challenge:${id}`);
      if (raw) {
        const challenge = typeof raw === "string" ? JSON.parse(raw) : (raw as Challenge);

        // Check if challenge is still active
        const endTime = new Date(challenge.endsAt).getTime();
        if (endTime > now) {
          challenges.push(challenge);
        }
      }
    }

    return challenges.slice(0, 4); // Return up to 4 active challenges
  } catch (error) {
    console.error("[challenges] Error fetching active challenges:", error);
    return [];
  }
}

/**
 * Track user progress on a challenge
 */
export async function updateUserChallengeProgress(
  challengeId: string,
  sessionId: string,
  progress: number
): Promise<void> {
  const kv = await getKV();
  if (!kv) return;

  try {
    const key = `challenge:${challengeId}:user:${sessionId}:progress`;
    await kv.set(key, progress.toString(), { ex: 14 * 24 * 60 * 60 }); // 14 days

    // Update leaderboard
    await kv.zadd(`challenge:${challengeId}:leaderboard`, {
      score: progress,
      member: sessionId,
    });

    // Invalidate cache
    await kv.del(`challenge:${challengeId}:leaderboard:cache`);
  } catch (error) {
    console.error("[challenges] Error updating progress:", error);
  }
}

/**
 * Get user's progress on a specific challenge
 */
export async function getUserChallengeProgress(
  challengeId: string,
  sessionId: string
): Promise<number> {
  const kv = await getKV();
  if (!kv) return 0;

  try {
    const key = `challenge:${challengeId}:user:${sessionId}:progress`;
    const value = await kv.get<number>(key);
    return value || 0;
  } catch {
    return 0;
  }
}

/**
 * Get challenge leaderboard (top 100 participants)
 */
export async function getChallengeLeaderboard(challengeId: string, limit: number = 100) {
  const kv = await getKV();
  if (!kv) return [];

  try {
    const cacheKey = `challenge:${challengeId}:leaderboard:cache`;
    const cached = await kv.get<LeaderboardEntry[]>(cacheKey);
    if (cached) return cached;

    const entries = (await kv.zrange(`challenge:${challengeId}:leaderboard`, 0, limit - 1, {
      withScores: true,
      rev: true,
    })) as Array<string | number>;

    const leaderboard: LeaderboardEntry[] = [];
    for (let i = 0; i < entries.length; i += 2) {
      const sessionId = entries[i] as string;
      const progress = (entries[i + 1] as number) || 0;

      leaderboard.push({
        rank: leaderboard.length + 1,
        sessionId,
        progress,
      });
    }

    // Cache for 5 minutes
    await kv.setex(cacheKey, 300, JSON.stringify(leaderboard));
    return leaderboard;
  } catch (error) {
    console.error("[challenges] Error fetching leaderboard:", error);
    return [];
  }
}

interface LeaderboardEntry {
  rank: number;
  sessionId: string;
  progress: number;
}

/**
 * Check if user has completed challenge
 */
export async function hasCompletedChallenge(
  challengeId: string,
  sessionId: string,
  goalProgress: number,
  goal: number
): Promise<boolean> {
  return goalProgress >= goal;
}

/**
 * Helper: Get start of current week (Monday 00:00 UTC)
 */
function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getUTCDay();
  const diff = d.getUTCDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), diff, 0, 0, 0, 0));
}
