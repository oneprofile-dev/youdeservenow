/**
 * Cron job: Check Amazon link health weekly
 * POST /api/cron/check-links
 *
 * Vercel Cron Configuration:
 * - Frequency: Weekly (Monday 2 AM UTC)
 * - Endpoint: https://youdeservenow.com/api/cron/check-links
 * - Secret: CRON_SECRET environment variable
 */

import { NextRequest, NextResponse } from "next/server";
import {
  validateMultipleLinks,
  updateLinkHealthStats,
  findReplacementCandidate,
  logLinkReplacement,
} from "@/lib/link-health";
import { getAllProducts } from "@/lib/products";
import { kv } from "@vercel/kv";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  // Verify cron secret
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    console.log("🔍 Starting link health check...");

    // Load all products
    const products = getAllProducts();
    const asins = products.map((p) => p.asin);

    // Check link status
    console.log(`📊 Validating ${asins.length} links...`);
    const results = await validateMultipleLinks(asins);

    // Count results
    const deadAsins = results
      .filter((r) => r.status === "dead")
      .map((r) => r.asin);
    const aliveAsins = results
      .filter((r) => r.status === "alive")
      .map((r) => r.asin);

    console.log(
      `✓ Check complete: ${aliveAsins.length} alive, ${deadAsins.length} dead`
    );

    // Update statistics
    await updateLinkHealthStats(results);

    // Find replacements for dead products
    const replacements = [];
    const aliveProducts = products.filter((p) => aliveAsins.includes(p.asin));

    for (const deadAsin of deadAsins) {
      const deadProduct = products.find((p) => p.asin === deadAsin);
      if (!deadProduct) continue;

      const replacement = findReplacementCandidate(deadProduct, aliveProducts);
      if (replacement && replacement.confidence >= 50) {
        replacements.push(replacement);
        await logLinkReplacement(replacement);
      }
    }

    // Save dead links list
    await kv.set(
      "dead-links:current",
      deadAsins,
      { ex: 604800 } // 7 days TTL
    );

    // Save replacement map
    const replacementMap = Object.fromEntries(
      replacements.map((r) => [r.deadAsin, r.replacementAsin])
    );
    await kv.set("link-replacements:map", replacementMap, { ex: 604800 });

    console.log(`🔄 Found ${replacements.length} replacement candidates`);

    // Send notification (if configured)
    if (process.env.SLACK_WEBHOOK_URL && deadAsins.length > 0) {
      try {
        await fetch(process.env.SLACK_WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: `Link Health Check Report`,
            blocks: [
              {
                type: "section",
                text: {
                  type: "mrkdwn",
                  text: `*Link Health Check - ${new Date().toLocaleDateString()}*\n\n*Alive:* ${aliveAsins.length}\n*Dead:* ${deadAsins.length}\n*Replacement Candidates:* ${replacements.length}`,
                },
              },
            ],
          }),
        });
      } catch (error) {
        console.error("Failed to send Slack notification:", error);
      }
    }

    return NextResponse.json(
      {
        success: true,
        timestamp: new Date().toISOString(),
        summary: {
          total: asins.length,
          alive: aliveAsins.length,
          dead: deadAsins.length,
          replacements: replacements.length,
          replacementRate: `${((replacements.length / deadAsins.length) * 100).toFixed(1)}%`,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Link health check failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint for monitoring - returns current link health status
 */
export async function GET(req: NextRequest) {
  try {
    const stats = await kv.get("link-health:stats");
    const deadLinks = await kv.get("dead-links:current");
    const replacementMap = await kv.get("link-replacements:map");

    return NextResponse.json({
      status: "ok",
      stats,
      totalDead: Array.isArray(deadLinks) ? deadLinks.length : 0,
      replacementsAvailable: Object.keys(replacementMap || {}).length,
      nextCheck: "Weekly (Monday 2 AM UTC)",
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
