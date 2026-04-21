#!/usr/bin/env node

import { readFileSync, writeFileSync, existsSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const SEEDS_PATH = join(ROOT, "data/niche-product-seeds.json");
const OUTPUT_PATH = join(ROOT, "data/niche-products.json");
const ENV_LOCAL_PATH = join(ROOT, ".env.local");
const ENV_EXAMPLE_PATH = join(ROOT, ".env.example");

function parseEnvFile(path) {
  if (!existsSync(path)) return {};

  const env = {};
  for (const rawLine of readFileSync(path, "utf8").split("\n")) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const eqIndex = line.indexOf("=");
    if (eqIndex === -1) continue;

    const key = line.slice(0, eqIndex).trim();
    let value = line.slice(eqIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    env[key] = value;
  }

  return env;
}

function getAffiliateTag() {
  return (
    process.env.AMAZON_AFFILIATE_TAG ||
    parseEnvFile(ENV_LOCAL_PATH).AMAZON_AFFILIATE_TAG ||
    parseEnvFile(ENV_EXAMPLE_PATH).AMAZON_AFFILIATE_TAG ||
    "youdeserven07-20"
  );
}

function buildSearchUrl(query, affiliateTag) {
  return `https://www.amazon.com/s?k=${encodeURIComponent(query)}&tag=${affiliateTag}`;
}

function buildImageUrl(imageSeed) {
  return `https://picsum.photos/seed/${encodeURIComponent(imageSeed)}/400/400`;
}

function main() {
  const seeds = JSON.parse(readFileSync(SEEDS_PATH, "utf8"));
  const affiliateTag = getAffiliateTag();

  const nicheProducts = seeds.map((seed) => ({
    id: seed.id,
    name: seed.name,
    category: seed.category,
    price: seed.price,
    affiliateUrl: buildSearchUrl(seed.searchQuery, affiliateTag),
    imageUrl: buildImageUrl(seed.imageSeed || seed.id),
    keywords: seed.keywords,
    source: "niche-seed",
  }));

  writeFileSync(OUTPUT_PATH, JSON.stringify(nicheProducts, null, 2) + "\n");

  console.log(
    `Wrote ${nicheProducts.length} niche products to data/niche-products.json using tag ${affiliateTag}`
  );
}

main();
