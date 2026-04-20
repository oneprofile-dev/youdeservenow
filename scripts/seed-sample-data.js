#!/usr/bin/env node
/**
 * Bootstrap Script: Seed Sample Data
 * 
 * Run: node scripts/seed-sample-data.js
 * Optional: Creates 50 sample results for gallery preview/testing
 */

const { kv } = require("@vercel/kv");

const SAMPLE_RESULTS = [
  {
    id: "sample_001",
    input: "Shipped a feature my users have been asking for for 6 months",
    justification:
      "According to the Institute's latest research, delayed feature shipping triggers neural pathways previously unknown to science. By finally delivering, you've essentially unlocked a new part of your brain. That's practically superhuman.",
    product: {
      id: "product_1",
      name: "Premium Noise-Canceling Headphones",
      price: 299.99,
      category: "tech",
      affiliateUrl: "https://amazon.com/s?k=noise+canceling+headphones",
    },
    shareUrl: "https://youdeservenow.com/result/sample_001",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "sample_002",
    input: "Survived a 12-hour meeting marathon",
    justification:
      "Our research shows that every hour in meetings burns calories equivalent to running a 5K. You've essentially completed an ultramarathon. Your muscles are fictional, but your mental fortitude is real.",
    product: {
      id: "product_2",
      name: "Weighted Blanket",
      price: 89.99,
      category: "comfort",
      affiliateUrl: "https://amazon.com/s?k=weighted+blanket",
    },
    shareUrl: "https://youdeservenow.com/result/sample_002",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "sample_003",
    input: "Finally organized my email inbox (only 5,000 emails)",
    justification:
      "Congratulations on joining the 0.001% of people who have achieved email zero. You are basically a digital monk. Your brain capacity has increased by exactly 0.3%.",
    product: {
      id: "product_3",
      name: "Coffee Maker with Timer",
      price: 79.99,
      category: "self-care",
      affiliateUrl: "https://amazon.com/s?k=coffee+maker",
    },
    shareUrl: "https://youdeservenow.com/result/sample_003",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "sample_004",
    input: "Fixed a bug that's been haunting the codebase for 2 years",
    justification:
      "You've just debugged more than most developers debug in a lifetime. Your neural pathways have been rewired. You are now 47% more likely to solve world peace.",
    product: {
      id: "product_4",
      name: "Mechanical Keyboard",
      price: 150.0,
      category: "tech",
      affiliateUrl: "https://amazon.com/s?k=mechanical+keyboard",
    },
    shareUrl: "https://youdeservenow.com/result/sample_004",
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "sample_005",
    input: "Ran 5 miles without stopping",
    justification:
      "Your cardiovascular system has entered a state of enlightenment. You are basically an Olympic athlete now. We recommend telling everyone about this achievement immediately.",
    product: {
      id: "product_5",
      name: "Running Shoes",
      price: 120.0,
      category: "self-care",
      affiliateUrl: "https://amazon.com/s?k=running+shoes",
    },
    shareUrl: "https://youdeservenow.com/result/sample_005",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

async function seedSampleData() {
  console.log("🚀 [bootstrap] Seeding sample gallery data...\n");

  try {
    for (const result of SAMPLE_RESULTS) {
      // Store result
      await kv.set(`result:${result.id}`, JSON.stringify(result), {
        ex: 60 * 60 * 24 * 90,
      });

      // Add to results list
      await kv.lpush("results:list", result.id);

      // Initialize rankings
      await kv.zadd("results:by:likes:zset", {
        score: Math.floor(Math.random() * 50),
        member: result.id,
      });
      await kv.zadd("results:by:shares:zset", {
        score: Math.floor(Math.random() * 20),
        member: result.id,
      });
      await kv.zadd("results:by:affiliate_clicks:zset", {
        score: Math.floor(Math.random() * 10),
        member: result.id,
      });

      console.log(`  ✅ Seeded: "${result.input.substring(0, 40)}..."`);
    }

    console.log(
      `\n✅ [bootstrap] Successfully seeded ${SAMPLE_RESULTS.length} sample results!\n`
    );
  } catch (error) {
    console.error("\n❌ [bootstrap] Error:", error.message, "\n");
    process.exit(1);
  }
}

seedSampleData();
