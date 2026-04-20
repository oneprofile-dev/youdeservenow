#!/usr/bin/env node
/**
 * Checks every Amazon /dp/ URL in data/products.json for dead ASINs.
 * Dead products (404 or "couldn't find that page") are replaced with
 * an Amazon search URL using the product name + affiliate tag.
 *
 * Usage:
 *   node scripts/check-amazon-links.mjs            # check + save results to dead-links.json
 *   node scripts/check-amazon-links.mjs --fix      # apply saved dead-links.json to products.json
 *   node scripts/check-amazon-links.mjs --check-and-fix  # check then immediately fix in one pass
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PRODUCTS_PATH = join(__dirname, "../data/products.json");
const DEAD_CACHE_PATH = join(__dirname, "../data/dead-links.json");
const FIX_ONLY = process.argv.includes("--fix");
const CHECK_AND_FIX = process.argv.includes("--check-and-fix");
const DELAY_MS = 800;
const AFFILIATE_TAG = "youdeserven07-20";

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Accept-Language": "en-US,en;q=0.9",
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
};

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function searchUrl(productName) {
  const query = encodeURIComponent(productName.toLowerCase());
  return `https://www.amazon.com/s?k=${query}&tag=${AFFILIATE_TAG}`;
}

function extractAsin(url) {
  const m = url.match(/\/dp\/([A-Z0-9]{10})/);
  return m ? m[1] : null;
}

async function checkUrl(url) {
  try {
    const res = await fetch(url, {
      headers: HEADERS,
      redirect: "follow",
      signal: AbortSignal.timeout(10_000),
    });

    if (res.status === 404) return { alive: false, reason: "HTTP 404" };
    if (res.status >= 500) return { alive: null, reason: `HTTP ${res.status} (server error – skipping)` };

    const text = await res.text();
    if (
      text.includes("we couldn't find that page") ||
      text.includes("couldn&#39;t find that page")
    ) {
      return { alive: false, reason: "Error page in body" };
    }
    if (text.includes("Robot Check") || text.includes("make sure you're not a robot")) {
      return { alive: null, reason: "CAPTCHA – could not verify" };
    }

    return { alive: true, reason: "OK" };
  } catch (err) {
    return { alive: null, reason: `Request failed: ${err.message}` };
  }
}

function applyFixes(products, deadIds) {
  let patched = 0;
  for (const { id, replacement } of deadIds) {
    const idx = products.findIndex((x) => x.id === id);
    if (idx !== -1 && products[idx].affiliateUrl !== replacement) {
      products[idx].affiliateUrl = replacement;
      patched++;
    }
  }
  return patched;
}

async function runCheck(products) {
  const dpProducts = products.filter(
    (p) => p.affiliateUrl && p.affiliateUrl.includes("/dp/")
  );

  console.log(`\nChecking ${dpProducts.length} Amazon /dp/ links...\n`);

  const dead = [];
  const captcha = [];
  let checked = 0;

  for (const product of dpProducts) {
    checked++;
    const asin = extractAsin(product.affiliateUrl);
    process.stdout.write(
      `[${String(checked).padStart(3)}/${dpProducts.length}] ${asin} ${product.name.slice(0, 40).padEnd(40)} `
    );

    const { alive, reason } = await checkUrl(product.affiliateUrl);

    if (alive === true) {
      console.log("✓ alive");
    } else if (alive === false) {
      console.log(`✗ DEAD — ${reason}`);
      dead.push({ id: product.id, name: product.name, was: product.affiliateUrl, replacement: searchUrl(product.name) });
    } else {
      console.log(`? ${reason}`);
      captcha.push(product.id);
    }

    await sleep(DELAY_MS);
  }

  console.log(`\n── Summary ──────────────────────────────`);
  console.log(`  Checked : ${checked}`);
  console.log(`  Alive   : ${checked - dead.length - captcha.length}`);
  console.log(`  Dead    : ${dead.length}`);
  console.log(`  Unknown : ${captcha.length} (CAPTCHA or timeout)`);

  return dead;
}

async function main() {
  const products = JSON.parse(readFileSync(PRODUCTS_PATH, "utf8"));

  // --fix only: apply from saved cache without re-checking
  if (FIX_ONLY) {
    if (!existsSync(DEAD_CACHE_PATH)) {
      console.error(`No dead-links.json found. Run without --fix first to generate it.`);
      process.exit(1);
    }
    const deadIds = JSON.parse(readFileSync(DEAD_CACHE_PATH, "utf8"));
    console.log(`\nApplying ${deadIds.length} fixes from dead-links.json...`);
    const patched = applyFixes(products, deadIds);
    writeFileSync(PRODUCTS_PATH, JSON.stringify(products, null, 2) + "\n");
    console.log(`✓ Patched ${patched} dead links in products.json`);
    return;
  }

  // Check (and optionally fix immediately)
  const dead = await runCheck(products);

  if (dead.length === 0) {
    console.log("\nNo dead links found.");
    return;
  }

  // Save results so --fix can be applied without re-checking
  writeFileSync(DEAD_CACHE_PATH, JSON.stringify(dead, null, 2) + "\n");
  console.log(`\nSaved ${dead.length} dead link IDs to dead-links.json`);

  if (CHECK_AND_FIX) {
    const patched = applyFixes(products, dead);
    writeFileSync(PRODUCTS_PATH, JSON.stringify(products, null, 2) + "\n");
    console.log(`✓ Patched ${patched} dead links in products.json`);
  } else {
    console.log(`\nRun with --fix to apply these replacements (no re-check needed).`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
