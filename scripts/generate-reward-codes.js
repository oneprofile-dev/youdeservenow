#!/usr/bin/env node
/**
 * Bootstrap Script: Generate Reward Codes
 * 
 * Run: node scripts/generate-reward-codes.js [count]
 * Default: 1000 codes
 * 
 * These codes are used for:
 * - Streak rewards (7-day, 14-day, 30-day)
 * - Challenge completion rewards
 * - Referral bonuses
 */

const crypto = require("crypto");
const { kv } = require("@vercel/kv");

const REWARD_TYPES = {
  streak_7day: { name: "7-Day Streak", discount: 10 },
  streak_14day: { name: "14-Day Streak", discount: 15 },
  streak_30day: { name: "30-Day Streak", discount: 20 },
  challenge: { name: "Challenge Reward", discount: 10 },
  referral: { name: "Referral Bonus", discount: 15 },
};

function generateCodeString() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(4).toString("hex").toUpperCase();
  return `YDN_${timestamp}_${random}`;
}

async function generateRewardCodes(count = 1000) {
  console.log(`🚀 [bootstrap] Generating ${count} reward codes...\n`);

  const now = new Date();
  const expiresAt = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000); // 90 days
  let generated = 0;
  let errors = 0;

  // Distribute across reward types
  const codesPerType = Math.floor(count / Object.keys(REWARD_TYPES).length);
  let totalToGenerate = 0;

  try {
    for (const [type, config] of Object.entries(REWARD_TYPES)) {
      const typeCount = type === "referral" ? count - (codesPerType * 4) : codesPerType;
      totalToGenerate += typeCount;

      console.log(`  Generating ${typeCount} ${config.name} codes (${config.discount}% off)...`);

      for (let i = 0; i < typeCount; i++) {
        try {
          const code = generateCodeString();
          const reward = {
            code,
            type,
            discountPercent: config.discount,
            redeemed: false,
            createdAt: now.toISOString(),
            expiresAt: expiresAt.toISOString(),
          };

          // Store in Redis with 90-day TTL
          await kv.setex(
            `reward:code:${code}`,
            90 * 24 * 60 * 60,
            JSON.stringify(reward)
          );

          generated++;

          // Log progress every 100 codes
          if ((i + 1) % 100 === 0) {
            console.log(`    ✓ ${i + 1}/${typeCount} codes generated`);
          }
        } catch (error) {
          errors++;
          if (errors % 10 === 0) {
            console.warn(`    ⚠ Errors: ${errors}`);
          }
        }
      }

      console.log(`  ✅ Completed: ${typeCount} ${config.name} codes\n`);
    }

    if (generated > 0) {
      // Track total generated
      await kv.set("rewards:total_generated", generated.toString());
    }

    const successRate = ((generated / totalToGenerate) * 100).toFixed(1);
    console.log(`\n✅ [bootstrap] Reward codes generation complete!`);
    console.log(`   Generated: ${generated} codes`);
    console.log(`   Errors: ${errors}`);
    console.log(`   Success rate: ${successRate}%\n`);
  } catch (error) {
    console.error("\n❌ [bootstrap] Error:", error.message, "\n");
    process.exit(1);
  }
}

const count = parseInt(process.argv[2]) || 1000;
generateRewardCodes(count);
