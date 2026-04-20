import crypto from "crypto";
import { getKV } from "./kv";
import { z } from "zod";

export const RewardCodeSchema = z.object({
  code: z.string(),
  type: z.enum(["streak_7day", "streak_14day", "streak_30day", "challenge", "referral"]),
  discountPercent: z.number().min(5).max(50),
  redeemed: z.boolean(),
  redeemedBy: z.string().optional(),
  redeemedAt: z.string().optional(),
  createdAt: z.string(),
  expiresAt: z.string(),
});

export type RewardCode = z.infer<typeof RewardCodeSchema>;

/**
 * Generate a batch of discount codes
 * Run: npm run generate-codes
 * Can be run periodically or on-demand
 */
export async function generateBatchRewardCodes(
  count: number = 1000,
  type: RewardCode["type"] = "challenge",
  discountPercent: number = 10
): Promise<string[]> {
  const kv = await getKV();
  if (!kv) {
    console.log(`[rewards] Skipping: KV not available`);
    return [];
  }

  const codes: string[] = [];
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000); // 90 days

  for (let i = 0; i < count; i++) {
    const code = generateCodeString();
    const reward: RewardCode = {
      code,
      type,
      discountPercent,
      redeemed: false,
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
    };

    try {
      // Store in Redis with 90-day TTL
      await kv.setex(
        `reward:code:${code}`,
        90 * 24 * 60 * 60,
        JSON.stringify(reward)
      );

      codes.push(code);

      // Log progress every 100 codes
      if ((i + 1) % 100 === 0) {
        console.log(`[rewards] Generated ${i + 1}/${count} codes`);
      }
    } catch (error) {
      console.error(`[rewards] Error generating code:`, error);
      break;
    }
  }

  console.log(`✅ [rewards] Generated ${codes.length} reward codes`);
  return codes;
}

/**
 * Get a reward code
 */
export async function getRewardCode(code: string): Promise<RewardCode | null> {
  const kv = await getKV();
  if (!kv) return null;

  try {
    const raw = await kv.get<string>(`reward:code:${code}`);
    if (!raw) return null;

    const parsed = typeof raw === "string" ? JSON.parse(raw) : (raw as RewardCode);
    return RewardCodeSchema.parse(parsed);
  } catch (error) {
    console.error(`[rewards] Error fetching code:`, error);
    return null;
  }
}

/**
 * Redeem a reward code (one-time use)
 */
export async function redeemRewardCode(code: string, userId: string): Promise<boolean> {
  const kv = await getKV();
  if (!kv) return false;

  try {
    const raw = await kv.get<string>(`reward:code:${code}`);
    if (!raw) return false;

    const parsed = typeof raw === "string" ? JSON.parse(raw) : (raw as RewardCode);
    const reward = RewardCodeSchema.parse(parsed);

    // Check if already redeemed
    if (reward.redeemed) {
      console.warn(`[rewards] Code already redeemed: ${code}`);
      return false;
    }

    // Check if expired
    if (new Date(reward.expiresAt) < new Date()) {
      console.warn(`[rewards] Code expired: ${code}`);
      return false;
    }

    // Mark as redeemed
    const updated: RewardCode = {
      ...reward,
      redeemed: true,
      redeemedBy: userId,
      redeemedAt: new Date().toISOString(),
    };

    await kv.set(`reward:code:${code}`, JSON.stringify(updated), {
      ex: 90 * 24 * 60 * 60,
    });

    // Track redemption
    await kv.incr(`rewards:redeemed:count`);
    await kv.lpush(`rewards:redeemed:list`, JSON.stringify({ code, userId, redeemedAt: new Date().toISOString() }));

    console.log(`✅ [rewards] Code redeemed: ${code} by ${userId}`);
    return true;
  } catch (error) {
    console.error(`[rewards] Error redeeming code:`, error);
    return false;
  }
}

/**
 * Generate reward code for streak tier
 * Called when user achieves streak milestone
 */
export async function generateStreakReward(sessionId: string, streakDays: number): Promise<string | null> {
  const kv = await getKV();
  if (!kv) return null;

  let type: RewardCode["type"];
  let discountPercent: number;

  if (streakDays >= 30) {
    type = "streak_30day";
    discountPercent = 20;
  } else if (streakDays >= 14) {
    type = "streak_14day";
    discountPercent = 15;
  } else if (streakDays >= 7) {
    type = "streak_7day";
    discountPercent = 10;
  } else {
    return null;
  }

  try {
    const code = generateCodeString();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

    const reward: RewardCode = {
      code,
      type,
      discountPercent,
      redeemed: false,
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
    };

    await kv.setex(`reward:code:${code}`, 90 * 24 * 60 * 60, JSON.stringify(reward));

    // Store mapping for user
    await kv.lpush(`user:${sessionId}:reward:codes`, code);

    console.log(`✅ [rewards] Streak reward generated for ${sessionId}: ${code} (${discountPercent}% off)`);
    return code;
  } catch (error) {
    console.error(`[rewards] Error generating streak reward:`, error);
    return null;
  }
}

/**
 * Get user's available rewards
 */
export async function getUserRewards(sessionId: string): Promise<RewardCode[]> {
  const kv = await getKV();
  if (!kv) return [];

  try {
    const codes = await kv.lrange<string>(`user:${sessionId}:reward:codes`, 0, -1);
    const rewards: RewardCode[] = [];

    for (const code of codes) {
      const reward = await getRewardCode(code);
      if (reward && !reward.redeemed) {
        rewards.push(reward);
      }
    }

    return rewards;
  } catch (error) {
    console.error(`[rewards] Error fetching user rewards:`, error);
    return [];
  }
}

/**
 * Helper: Generate a random reward code string
 * Format: YDN_TIMESTAMP_RANDOM
 */
function generateCodeString(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(4).toString("hex").toUpperCase();
  return `YDN_${timestamp}_${random}`;
}

/**
 * Get reward statistics
 */
export async function getRewardStats(): Promise<{
  totalGenerated: number;
  totalRedeemed: number;
  redemptionRate: number;
}> {
  const kv = await getKV();
  if (!kv) {
    return { totalGenerated: 0, totalRedeemed: 0, redemptionRate: 0 };
  }

  try {
    const redeemed = (await kv.get<number>(`rewards:redeemed:count`)) || 0;

    // Estimate total generated (rough, since codes expire)
    // In production, maintain a separate counter
    const totalGenerated = redeemed > 0 ? Math.round(redeemed / 0.15) : 0; // Assume ~15% redemption

    return {
      totalGenerated,
      totalRedeemed: redeemed,
      redemptionRate: totalGenerated > 0 ? (redeemed / totalGenerated) * 100 : 0,
    };
  } catch (error) {
    console.error(`[rewards] Error fetching stats:`, error);
    return { totalGenerated: 0, totalRedeemed: 0, redemptionRate: 0 };
  }
}
