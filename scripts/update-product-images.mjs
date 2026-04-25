#!/usr/bin/env node

/**
 * Update Product Images from picsum.photos to Real Amazon Images
 * 
 * Usage: node scripts/update-product-images.mjs
 * 
 * Requires:
 * - AMAZON_PA_API_KEY
 * - AMAZON_PA_API_SECRET
 * - AMAZON_PA_PARTNER_TAG
 * 
 * This script:
 * 1. Reads data/products.json
 * 2. For each product with picsum.photos URL:
 *    - Searches Amazon for the product
 *    - Fetches real image URL
 *    - Updates price
 *    - Adds ASIN
 * 3. Writes updated products.json
 * 4. Reports success rate
 */

import fs from 'fs';
import crypto from 'crypto';

// Read env vars
const API_KEY = process.env.AMAZON_PA_API_KEY;
const API_SECRET = process.env.AMAZON_PA_API_SECRET;
const PARTNER_TAG = process.env.AMAZON_PA_PARTNER_TAG;

if (!API_KEY || !API_SECRET || !PARTNER_TAG) {
  console.error('❌ Missing environment variables:');
  console.error('  - AMAZON_PA_API_KEY');
  console.error('  - AMAZON_PA_API_SECRET');
  console.error('  - AMAZON_PA_PARTNER_TAG');
  process.exit(1);
}

const API_HOST = 'webapi.amazon.com';
const API_REGION = 'us-east-1';
const SERVICE_NAME = 'ProductAdvertisingAPI';

/**
 * Calculate AWS Signature V4
 */
function sign(key, msg) {
  return crypto.createHmac('sha256', key).update(msg).digest();
}

/**
 * Make PA-API request
 */
async function makeAmazonRequest(action, payload) {
  try {
    const now = new Date();
    const amzDate = now.toISOString().replace(/[:\-]|\.\d{3}/g, '');
    const datestamp = amzDate.slice(0, 8);

    const host = API_HOST;
    const uri = `/paapi5/${action}`;
    const method = 'POST';

    const headers = {
      'content-encoding': 'amz-1.0',
      'content-type': 'application/x-amz-json-1.1',
      host,
      'x-amz-date': amzDate,
      'x-amz-target': `com.amazon.paapi5.v1.ProductAdvertisingAPIv1.${action}`,
    };

    const payloadHash = crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex');

    let canonicalHeaders = '';
    const headerKeys = Object.keys(headers).sort();
    for (const key of headerKeys) {
      canonicalHeaders += `${key}:${headers[key]}\n`;
    }

    const signedHeaders = headerKeys.join(';');
    const canonicalRequest = [method, uri, '', canonicalHeaders, signedHeaders, payloadHash].join('\n');

    const credentialScope = `${datestamp}/${API_REGION}/${SERVICE_NAME}/aws4_request`;
    const canonicalRequestHash = crypto.createHash('sha256').update(canonicalRequest).digest('hex');
    const stringToSign = ['AWS4-HMAC-SHA256', amzDate, credentialScope, canonicalRequestHash].join('\n');

    const kSecret = `AWS4${API_SECRET}`;
    const kDate = sign(kSecret, datestamp);
    const kRegion = sign(kDate, API_REGION);
    const kService = sign(kRegion, SERVICE_NAME);
    const kSigning = sign(kService, 'aws4_request');
    const signature = crypto.createHmac('sha256', kSigning).update(stringToSign).digest('hex');

    const authorization = `AWS4-HMAC-SHA256 Credential=${API_KEY}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

    const response = await fetch(`https://${host}${uri}`, {
      method,
      headers: { ...headers, Authorization: authorization },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.warn(`  ⚠️  PA-API error: ${response.status} ${response.statusText}`);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.warn(`  ⚠️  Request failed: ${error.message}`);
    return null;
  }
}

/**
 * Search for product and extract image
 */
async function searchProductImage(keywords) {
  if (!keywords) return null;

  const result = await makeAmazonRequest('SearchItems', {
    PartnerTag: PARTNER_TAG,
    Keywords: keywords,
    SearchIndex: 'All',
    ItemCount: 1,
    Resources: [
      'Images.Primary.Large',
      'Offers.Listings.Price',
      'ItemInfo.Title',
    ],
  });

  if (!result) return null;

  const items = result.SearchResult?.Items;
  if (!items || items.length === 0) return null;

  const item = items[0];
  return {
    asin: item.ASIN,
    imageUrl: item.Images?.Primary?.Large?.URL,
    price: item.Offers?.Listings?.[0]?.Price?.DisplayPrice,
    title: item.ItemInfo?.Title?.DisplayValue,
  };
}

/**
 * Main script
 */
async function main() {
  console.log('🔄 Updating product images from Amazon PA-API...\n');

  // Read products
  const productsPath = './data/products.json';
  const products = JSON.parse(fs.readFileSync(productsPath, 'utf-8'));

  let updated = 0;
  let failed = 0;
  let skipped = 0;

  // Process each product
  for (let i = 0; i < products.length; i++) {
    const product = products[i];

    // Check if needs update
    if (!product.imageUrl?.includes('picsum.photos')) {
      skipped++;
      continue;
    }

    process.stdout.write(`[${i + 1}/${products.length}] ${product.name.substring(0, 40).padEnd(40)} `);

    try {
      const result = await searchProductImage(product.name);

      if (result && result.imageUrl) {
        products[i].imageUrl = result.imageUrl;
        products[i].asin = result.asin;
        if (result.price) {
          products[i].price = result.price;
        }
        console.log('✅');
        updated++;
      } else {
        console.log('❌ No image found');
        failed++;
      }
    } catch (error) {
      console.log('❌ Error');
      failed++;
    }

    // Respectful rate limiting (500ms between requests)
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  // Save updated products
  fs.writeFileSync(productsPath, JSON.stringify(products, null, 2));

  // Report
  console.log(`\n📊 Summary:`);
  console.log(`  ✅ Updated: ${updated}/${products.length}`);
  console.log(`  ❌ Failed: ${failed}`);
  console.log(`  ⏭️  Skipped: ${skipped}`);
  console.log(`\n✨ Done! Updated ${productsPath}`);

  if (failed > 0) {
    console.log(`\n⚠️  ${failed} products failed. You may need to manually update these.`);
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
