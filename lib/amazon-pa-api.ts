/**
 * Amazon Product Advertising API (PA-API) Client
 * Fetches real product images, prices, and details
 * 
 * Requires:
 * - AMAZON_PA_API_KEY (Access Key ID)
 * - AMAZON_PA_API_SECRET (Secret Access Key)
 * - AMAZON_PA_PARTNER_TAG (Affiliate tag)
 * 
 * Setup: https://docs.aws.amazon.com/paapi5/latest/doc/
 */

import crypto from 'crypto';

const API_HOST = 'webapi.amazon.com';
const API_REGION = 'us-east-1';
const SERVICE_NAME = 'ProductAdvertisingAPI';

/**
 * Interface for PA-API search result
 */
export interface ProductAdvertisingResult {
  imageUrl?: string;
  title?: string;
  price?: string;
  asin?: string;
  affiliateUrl?: string;
  error?: string;
}

/**
 * Calculate AWS Signature V4 for PA-API request
 */
function sign(
  key: string | Buffer,
  msg: string,
  algorithm: string = 'sha256'
): Buffer {
  return crypto.createHmac(algorithm, key).update(msg).digest();
}

/**
 * Make authenticated request to PA-API
 */
async function makeAmazonRequest(
  action: string,
  payload: Record<string, unknown>
): Promise<ProductAdvertisingResult> {
  const keyId = process.env.AMAZON_PA_API_KEY;
  const keySecret = process.env.AMAZON_PA_API_SECRET;
  const partnerTag = process.env.AMAZON_PA_PARTNER_TAG;

  if (!keyId || !keySecret || !partnerTag) {
    console.error('Missing Amazon PA-API credentials');
    return { error: 'PA-API not configured' };
  }

  try {
    const now = new Date();
    const amzDate = now.toISOString().replace(/[:\-]|\.\d{3}/g, '');
    const datestamp = amzDate.slice(0, 8);

    // Prepare request
    const host = API_HOST;
    const uri = `/paapi5/${action}`;
    const method = 'POST';
    const canonicalUri = uri;
    const canonicalQuerystring = '';

    // Headers for signing
    const headers: Record<string, string> = {
      'content-encoding': 'amz-1.0',
      'content-type': 'application/x-amz-json-1.1',
      host,
      'x-amz-date': amzDate,
      'x-amz-target': `com.amazon.paapi5.v1.ProductAdvertisingAPIv1.${action}`,
    };

    // Payload hash
    const payloadHash = crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex');

    // Canonical headers string
    let canonicalHeaders = '';
    const headerKeys = Object.keys(headers).sort();
    for (const key of headerKeys) {
      canonicalHeaders += `${key}:${headers[key]}\n`;
    }

    const signedHeaders = headerKeys.join(';');

    // Canonical request
    const canonicalRequest = [method, canonicalUri, canonicalQuerystring, canonicalHeaders, signedHeaders, payloadHash]
      .join('\n');

    // String to sign
    const credentialScope = `${datestamp}/${API_REGION}/${SERVICE_NAME}/aws4_request`;
    const canonicalRequestHash = crypto.createHash('sha256').update(canonicalRequest).digest('hex');
    const stringToSign = ['AWS4-HMAC-SHA256', amzDate, credentialScope, canonicalRequestHash].join('\n');

    // Signature
    const kSecret = `AWS4${keySecret}`;
    const kDate = sign(kSecret, datestamp);
    const kRegion = sign(kDate, API_REGION);
    const kService = sign(kRegion, SERVICE_NAME);
    const kSigning = sign(kService, 'aws4_request');
    const signature = crypto.createHmac('sha256', kSigning).update(stringToSign).digest('hex');

    // Authorization header
    const authorization = `AWS4-HMAC-SHA256 Credential=${keyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

    // Make request
    const response = await fetch(`https://${host}${uri}`, {
      method,
      headers: {
        ...headers,
        Authorization: authorization,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error(`PA-API error: ${response.status} ${response.statusText}`);
      return { error: `PA-API error: ${response.status}` };
    }

    return await response.json();
  } catch (error) {
    console.error('PA-API request failed:', error);
    return { error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Search for product by keywords and extract image URL + price
 */
export async function searchProductImage(
  keywords: string
): Promise<ProductAdvertisingResult> {
  if (!keywords || keywords.length === 0) {
    return { error: 'No keywords provided' };
  }

  try {
    const result = await makeAmazonRequest('SearchItems', {
      PartnerTag: process.env.AMAZON_PA_PARTNER_TAG,
      Keywords: keywords,
      SearchIndex: 'All',
      ItemCount: 1,
      Resources: [
        'Images.Primary.Large',
        'Offers.Listings.Price',
        'ItemInfo.Title',
      ],
    });

    // Handle API errors
    if ('error' in result) {
      return result;
    }

    // Extract first item from search results
    const items = (result as any).SearchResult?.Items;
    if (!items || items.length === 0) {
      return { error: 'No products found' };
    }

    const item = items[0];

    // Build affiliate URL
    const partnerTag = process.env.AMAZON_PA_PARTNER_TAG;
    const affiliateUrl = `https://www.amazon.com/dp/${item.ASIN}?tag=${partnerTag}`;

    return {
      asin: item.ASIN,
      title: item.ItemInfo?.Title?.DisplayValue,
      imageUrl: item.Images?.Primary?.Large?.URL,
      price: item.Offers?.Listings?.[0]?.Price?.DisplayPrice,
      affiliateUrl,
    };
  } catch (error) {
    console.error('Product search failed:', error);
    return { error: error instanceof Error ? error.message : 'Search failed' };
  }
}

/**
 * Get product details by ASIN (if already owned)
 */
export async function getProductByAsin(asin: string): Promise<ProductAdvertisingResult> {
  if (!asin || asin.length === 0) {
    return { error: 'No ASIN provided' };
  }

  try {
    const result = await makeAmazonRequest('GetItems', {
      PartnerTag: process.env.AMAZON_PA_PARTNER_TAG,
      ItemIds: [asin],
      Resources: [
        'Images.Primary.Large',
        'Offers.Listings.Price',
        'ItemInfo.Title',
      ],
    });

    if ('error' in result) {
      return result;
    }

    const items = (result as any).Items;
    if (!items || items.length === 0) {
      return { error: 'Product not found' };
    }

    const item = items[0];
    const partnerTag = process.env.AMAZON_PA_PARTNER_TAG;

    return {
      asin: item.ASIN,
      title: item.ItemInfo?.Title?.DisplayValue,
      imageUrl: item.Images?.Primary?.Large?.URL,
      price: item.Offers?.Listings?.[0]?.Price?.DisplayPrice,
      affiliateUrl: `https://www.amazon.com/dp/${asin}?tag=${partnerTag}`,
    };
  } catch (error) {
    console.error('Get product failed:', error);
    return { error: error instanceof Error ? error.message : 'Failed to get product' };
  }
}

/**
 * Batch search for multiple products
 */
export async function searchMultipleProducts(
  keywords: string[]
): Promise<ProductAdvertisingResult[]> {
  const results = await Promise.all(keywords.map((kw) => searchProductImage(kw)));
  return results;
}
