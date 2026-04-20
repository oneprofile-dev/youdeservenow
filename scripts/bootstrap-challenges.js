#!/usr/bin/env node
/**
 * Bootstrap Script: Generate Weekly Challenges
 * 
 * Run: node scripts/bootstrap-challenges.js
 * Idempotent: Safe to run multiple times (checks if already generated)
 */

const { kv } = require("@vercel/kv");

const CHALLENGE_TEMPLATES = [
  {
    title: "Monday Momentum",
    description: "Send 5 meaningful gifts this week",
    goal: 5,
    goalLabel: "gifts sent",
    reward: "10% off",
    rewardValue: 10,
    category: "gifts",
    criteria: "gifts_sent",
  },
  {
    title: "Personality Clash",
    description: "Match someone of the opposite personality type",
    goal: 3,
    goalLabel: "personalities",
    reward: "15% off",
    rewardValue: 15,
    category: "personalities",
    criteria: "personality_reveals",
  },
  {
    title: "Streak Hero",
    description: "Maintain your streak for 7 consecutive days",
    goal: 7,
    goalLabel: "days",
    reward: "20% off",
    rewardValue: 20,
    category: "streaks",
    criteria: "gifts_sent",
  },
  {
    title: "Share Sensation",
    description: "Get 10 shares on your justifications",
    goal: 10,
    goalLabel: "shares",
    reward: "Legendary Badge",
    rewardValue: 25,
    category: "shares",
    criteria: "shares_received",
  },
];

function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getUTCDay();
  const diff = d.getUTCDate() - day + (day === 0 ? -6 : 1);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), diff, 0, 0, 0, 0));
}

async function bootstrapChallenges() {
  console.log("🚀 [bootstrap] Starting challenge generation...\n");

  const now = new Date();
  const weekStart = getWeekStart(now);
  const weekKey = `challenges:week:${weekStart.getTime()}`;

  try {
    // Check if already generated this week
    const existing = await kv.get(weekKey);
    if (existing) {
      console.log("✅ [bootstrap] Challenges already generated this week. Skipping.\n");
      return;
    }

    const challenges = [];

    for (let i = 0; i < CHALLENGE_TEMPLATES.length; i++) {
      const template = CHALLENGE_TEMPLATES[i];
      const startDate = new Date(weekStart);
      const endDate = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);

      const challenge = {
        id: `challenge_${weekStart.getTime()}_${i}`,
        ...template,
        startsAt: startDate.toISOString(),
        endsAt: endDate.toISOString(),
        active: true,
      };

      challenges.push(challenge);

      // Store in Redis (TTL: 14 days)
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

      console.log(`  ✅ Created: "${challenge.title}"`);
    }

    // Cache this week's challenges
    await kv.setex(weekKey, 7 * 24 * 60 * 60, JSON.stringify(challenges));

    console.log(`\n✅ [bootstrap] Successfully generated ${challenges.length} weekly challenges!\n`);
  } catch (error) {
    console.error("\n❌ [bootstrap] Error:", error.message, "\n");
    process.exit(1);
  }
}

bootstrapChallenges();
