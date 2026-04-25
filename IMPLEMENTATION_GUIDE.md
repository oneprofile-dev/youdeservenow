# Implementation Guide: Critical Fixes (Priority 1)

**Start Here:** Do fixes in this order: 1.2 (OG cards) → 1.1 (real images) → 1.3 (gallery seeding) → 1.4 (moderation)

---

## Fix 1.2: Shareable Prescription Card (OG Image Generation)

### Why This First?

This is the **viral primitive**. Once working, it unlocks social sharing and becomes your distribution engine. Every diagnosis that gets shared carries your card back to the site.

### Current State

- ✅ `@vercel/og` or `html-to-image` in dependencies?
- ✅ `app/api/og/route.ts` exists but may not be optimized
- ❌ Multi-size generation (mobile/square/OG) not implemented
- ❌ Product image integration missing
- ❌ QR code generation not added

### Implementation

#### Step 1: Check dependencies
```bash
npm list @vercel/og satori
npm list html-to-image
```

If missing:
```bash
npm install @vercel/og satori
```

#### Step 2: Create `lib/og-image-generator.ts`

```typescript
// lib/og-image-generator.ts
import { ImageResponse } from '@vercel/og';
import type { Result } from '@/lib/db';

export type CardSize = 'mobile' | 'square' | 'og';

const SIZE_CONFIG = {
  mobile: { width: 1080, height: 1920 }, // TikTok/Reels
  square: { width: 1080, height: 1080 }, // Instagram feed
  og: { width: 1200, height: 630 },     // Open Graph
};

export async function generatePrescriptionCard(
  result: Result,
  size: CardSize = 'og'
): Promise<Buffer | null> {
  try {
    const config = SIZE_CONFIG[size];
    
    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            background: 'linear-gradient(135deg, #f5f3f0 0%, #e8e4df 100%)',
            fontFamily: '"Instrument Serif", serif',
            padding: '60px',
            boxSizing: 'border-box',
            position: 'relative',
          }}
        >
          {/* Header: Institute Name */}
          <div
            style={{
              fontSize: size === 'mobile' ? 32 : size === 'square' ? 24 : 20,
              fontWeight: 'bold',
              color: '#6b4423',
              marginBottom: '20px',
              textAlign: 'center',
            }}
          >
            THE INSTITUTE
          </div>

          {/* User Input (Achievement) */}
          <div
            style={{
              fontSize: size === 'mobile' ? 48 : size === 'square' ? 36 : 28,
              fontWeight: 'bold',
              color: '#2c2c2c',
              marginBottom: '30px',
              lineHeight: '1.2',
              textAlign: 'center',
              fontStyle: 'italic',
            }}
          >
            "{result.input}"
          </div>

          {/* Verdict (first 2–3 lines) */}
          <div
            style={{
              fontSize: size === 'mobile' ? 28 : size === 'square' ? 20 : 16,
              color: '#4a4a4a',
              marginBottom: '40px',
              lineHeight: '1.5',
              textAlign: 'center',
              maxLines: 3,
            }}
          >
            {/* Show first 150 chars of verdict */}
            {result.justification.substring(0, 150)}...
          </div>

          {/* Product Section */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
              backgroundColor: 'rgba(255, 255, 255, 0.7)',
              padding: '20px',
              borderRadius: '12px',
              marginBottom: '30px',
            }}
          >
            {/* Product Image */}
            <div
              style={{
                width: size === 'mobile' ? 100 : 80,
                height: size === 'mobile' ? 100 : 80,
                borderRadius: '8px',
                overflow: 'hidden',
                backgroundColor: '#f0f0f0',
                flexShrink: 0,
              }}
            >
              <img
                src={result.product.imageUrl}
                alt={result.product.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            </div>

            {/* Product Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: size === 'mobile' ? 18 : 14,
                  fontWeight: 'bold',
                  color: '#2c2c2c',
                  marginBottom: '4px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {result.product.name}
              </div>
              <div
                style={{
                  fontSize: size === 'mobile' ? 16 : 12,
                  color: '#6b4423',
                  fontWeight: 'bold',
                }}
              >
                {result.product.price}
              </div>
            </div>
          </div>

          {/* Footer: Site URL + "Powered by YouDeserveNow" */}
          <div
            style={{
              fontSize: size === 'mobile' ? 14 : 10,
              color: '#999',
              textAlign: 'center',
              marginTop: 'auto',
              borderTop: '1px solid #d0c8c0',
              paddingTop: '20px',
            }}
          >
            youdeservenow.com — Peer-reviewed by exactly nobody.
          </div>
        </div>
      ),
      {
        width: config.width,
        height: config.height,
        fonts: [
          {
            name: 'Instrument Serif',
            data: await fetch(
              'https://fonts.googleapis.com/css2?family=Instrument+Serif&display=swap'
            ).then((res) => res.arrayBuffer()),
            weight: 400,
            style: 'normal',
          },
        ],
      }
    );
  } catch (error) {
    console.error('OG image generation failed:', error);
    return null;
  }
}
```

#### Step 3: Create `app/api/og-card/route.ts`

```typescript
// app/api/og-card/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getResult } from '@/lib/db';
import { generatePrescriptionCard, type CardSize } from '@/lib/og-image-generator';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const size = (searchParams.get('size') as CardSize) || 'og';

  if (!id) {
    return NextResponse.json(
      { error: 'Missing result ID' },
      { status: 400 }
    );
  }

  try {
    const result = await getResult(id);
    if (!result) {
      return NextResponse.json(
        { error: 'Result not found' },
        { status: 404 }
      );
    }

    const image = await generatePrescriptionCard(result, size);
    if (!image) {
      return NextResponse.json(
        { error: 'Image generation failed' },
        { status: 500 }
      );
    }

    return new NextResponse(image, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('OG card generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

#### Step 4: Update `app/result/[id]/page.tsx` metadata

```typescript
// In the generateMetadata function:
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const result = await getResult(id);

  if (!result) {
    return { title: 'Result Not Found' };
  }

  const siteUrl = getSiteUrl();
  const title = `Science says I deserve ${result.product.name}`;
  const description = truncate(result.justification, 160);

  // Use the new OG card endpoint
  const ogCardUrls = {
    og: `${siteUrl}/api/og-card?id=${id}&size=og`,
    square: `${siteUrl}/api/og-card?id=${id}&size=square`,
    mobile: `${siteUrl}/api/og-card?id=${id}&size=mobile`,
  };

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${siteUrl}/result/${id}`,
      type: 'article',
      images: [
        { url: ogCardUrls.og, width: 1200, height: 630, alt: title },
        { url: ogCardUrls.square, width: 1080, height: 1080, alt: title },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogCardUrls.og],
    },
  };
}
```

#### Step 5: Add download + share buttons to result page

```typescript
// components/ResultShareButtons.tsx
'use client';

import { useState } from 'react';
import html2canvas from 'html-to-image';

interface ResultShareButtonsProps {
  resultId: string;
  productName: string;
  userInput: string;
}

export default function ResultShareButtons({
  resultId,
  productName,
  userInput,
}: ResultShareButtonsProps) {
  const [downloading, setDownloading] = useState(false);
  const siteUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const resultUrl = `${siteUrl}/result/${resultId}`;

  const downloadImage = async (size: 'mobile' | 'square' | 'og') => {
    setDownloading(true);
    try {
      const imageUrl = `${siteUrl}/api/og-card?id=${resultId}&size=${size}`;
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `youdeservenow-prescription-${resultId}.png`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download image');
    } finally {
      setDownloading(false);
    }
  };

  const shareToSocial = (platform: string) => {
    const text = `🧪 Science says I deserve ${productName}\n\n"${userInput}"\n\n`;
    const encodedUrl = encodeURIComponent(resultUrl);
    const encodedText = encodeURIComponent(text);

    const urls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    };

    if (platform === 'tiktok') {
      alert(
        'Copy this link and share in TikTok bio or with your video:\n\n' +
        resultUrl
      );
      navigator.clipboard.writeText(resultUrl);
      return;
    }

    if (platform === 'instagram') {
      alert(
        'Instagram Stories: Share this link in your Stories.\n' +
        'Feed: Share the image below to your feed.'
      );
      downloadImage('square');
      return;
    }

    const url = urls[platform as keyof typeof urls];
    if (url) {
      window.open(url, '_blank', 'width=600,height=600');
    }
  };

  return (
    <div className="flex flex-col gap-4 mt-6">
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => downloadImage('mobile')}
          disabled={downloading}
          className="px-4 py-2 text-sm font-medium rounded-lg bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50"
        >
          📱 Story
        </button>
        <button
          onClick={() => downloadImage('square')}
          disabled={downloading}
          className="px-4 py-2 text-sm font-medium rounded-lg bg-pink-500 text-white hover:bg-pink-600 disabled:opacity-50"
        >
          📷 Feed
        </button>
        <button
          onClick={() => downloadImage('og')}
          disabled={downloading}
          className="px-4 py-2 text-sm font-medium rounded-lg bg-gray-700 text-white hover:bg-gray-800 disabled:opacity-50"
        >
          🔗 Card
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => shareToSocial('twitter')}
          className="px-4 py-2 text-sm rounded-lg bg-black text-white hover:bg-gray-800"
        >
          X →
        </button>
        <button
          onClick={() => shareToSocial('tiktok')}
          className="px-4 py-2 text-sm rounded-lg bg-gray-900 text-white hover:bg-black"
        >
          TikTok →
        </button>
        <button
          onClick={() => shareToSocial('instagram')}
          className="px-4 py-2 text-sm rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90"
        >
          Instagram →
        </button>
        <button
          onClick={() => shareToSocial('facebook')}
          className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700"
        >
          Facebook →
        </button>
      </div>

      <input
        type="text"
        readOnly
        value={resultUrl}
        className="px-3 py-2 text-sm bg-gray-100 rounded-lg border border-gray-300"
        onClick={(e) => {
          (e.target as HTMLInputElement).select();
          navigator.clipboard.writeText(resultUrl);
        }}
      />
    </div>
  );
}
```

---

## Fix 1.1: Replace picsum.photos with real product images

### Implementation

#### Step 1: Get Amazon Product Advertising API access

1. Go to [Amazon Associates](https://affiliate-program.amazon.com)
2. Sign in with your associate account
3. Request PA-API access (Settings → API Access)
4. Generate Access Key ID + Secret Access Key
5. Set env vars:
```bash
AMAZON_PA_API_KEY=YOUR_KEY_ID
AMAZON_PA_API_SECRET=YOUR_SECRET
AMAZON_PA_PARTNER_TAG=youdeserven07-20 # Your affiliate tag
```

#### Step 2: Create `lib/amazon-pa-api.ts`

```typescript
// lib/amazon-pa-api.ts
import crypto from 'crypto';

const API_HOST = 'webapi.amazon.com';
const REGION = 'us-east-1';
const SERVICE = 'ProductAdvertisingAPI';
const API_VERSION = 'v1';

interface ProductAdvertisingResponse {
  SearchResult?: {
    Items?: Array<{
      ASIN: string;
      ProductTitle: string;
      Images?: {
        Primary?: { URL: string };
      };
      Offers?: {
        Listings?: Array<{
          Price?: { DisplayPrice: string };
        }>;
      };
    }>;
  };
}

async function makeRequest(
  action: string,
  payload: object
): Promise<ProductAdvertisingResponse> {
  const amzDate = new Date().toISOString().replace(/[:-]|\.\d{3}/g, '');
  const datestamp = amzDate.slice(0, 8);

  const canonicalUri = `/${API_VERSION}/ProductAdvertising/${action}`;
  const canonicalQueryString = '';
  const payloadHash = crypto
    .createHash('sha256')
    .update(JSON.stringify(payload))
    .digest('hex');

  const canonicalHeaders =
    `content-encoding:amz-1.0\n` +
    `content-type:application/x-amz-json-1.1\n` +
    `host:${API_HOST}\n` +
    `x-amz-date:${amzDate}\n` +
    `x-amz-target:ProductAdvertisingAPIv1.${action}\n`;

  const signedHeaders =
    'content-encoding;content-type;host;x-amz-date;x-amz-target';

  const canonicalRequest =
    `POST\n${canonicalUri}\n${canonicalQueryString}\n${canonicalHeaders}\n${signedHeaders}\n${payloadHash}`;

  const credentialScope = `${datestamp}/${REGION}/${SERVICE}/aws4_request`;
  const canonicalRequestHash = crypto
    .createHash('sha256')
    .update(canonicalRequest)
    .digest('hex');

  const stringToSign =
    `AWS4-HMAC-SHA256\n${amzDate}\n${credentialScope}\n${canonicalRequestHash}`;

  const kSecret = `AWS4${process.env.AMAZON_PA_API_SECRET}`;
  const kDate = crypto
    .createHmac('sha256', kSecret)
    .update(datestamp)
    .digest();
  const kRegion = crypto.createHmac('sha256', kDate).update(REGION).digest();
  const kService = crypto
    .createHmac('sha256', kRegion)
    .update(SERVICE)
    .digest();
  const kSigning = crypto
    .createHmac('sha256', kService)
    .update('aws4_request')
    .digest();
  const signature = crypto
    .createHmac('sha256', kSigning)
    .update(stringToSign)
    .digest('hex');

  const authorizationHeader =
    `AWS4-HMAC-SHA256 Credential=${process.env.AMAZON_PA_API_KEY}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  const response = await fetch(`https://${API_HOST}${canonicalUri}`, {
    method: 'POST',
    headers: {
      'Content-Encoding': 'amz-1.0',
      'Content-Type': 'application/x-amz-json-1.1',
      'X-Amz-Date': amzDate,
      'X-Amz-Target': `ProductAdvertisingAPIv1.${action}`,
      Authorization: authorizationHeader,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    console.error(`PA-API error: ${response.status} ${response.statusText}`);
    return {};
  }

  return response.json();
}

export async function searchProducts(
  keywords: string
): Promise<{
  imageUrl?: string;
  price?: string;
  asin?: string;
}> {
  try {
    const result = await makeRequest('SearchItems', {
      PartnerTag: process.env.AMAZON_PA_PARTNER_TAG,
      Keywords: keywords,
      Resources: [
        'Images.Primary.Large',
        'Offers.Listings.Price',
        'ItemInfo.Title',
      ],
      SearchIndex: 'All',
      ItemCount: 1,
    });

    const item = result.SearchResult?.Items?.[0];
    if (!item) return {};

    const imageUrl = item.Images?.Primary?.URL;
    const price = item.Offers?.Listings?.[0]?.Price?.DisplayPrice;

    return {
      asin: item.ASIN,
      imageUrl,
      price,
    };
  } catch (error) {
    console.error('PA-API search error:', error);
    return {};
  }
}
```

#### Step 3: Update `data/products.json`

Create a migration script `scripts/update-product-images.mjs`:

```javascript
// scripts/update-product-images.mjs
import fs from 'fs';
import { searchProducts } from '../lib/amazon-pa-api.ts';

const products = JSON.parse(
  fs.readFileSync('./data/products.json', 'utf-8')
);

for (const product of products) {
  if (product.imageUrl?.includes('picsum.photos')) {
    const result = await searchProducts(product.name);
    if (result.imageUrl) {
      product.imageUrl = result.imageUrl;
      product.asin = result.asin;
      if (result.price) product.price = result.price;
      console.log(`✅ Updated: ${product.name}`);
    } else {
      console.warn(`⚠️ No image found for: ${product.name}`);
    }
    // Respectful rate limiting
    await new Promise((r) => setTimeout(r, 500));
  }
}

fs.writeFileSync(
  './data/products.json',
  JSON.stringify(products, null, 2)
);
console.log('✨ Done!');
```

Run it:
```bash
node scripts/update-product-images.mjs
```

---

## Fix 1.3: Gallery seeding + cleanup

### Create seed script

```typescript
// scripts/seed-gallery.ts
import { saveResult } from '@/lib/db';
import type { Result } from '@/lib/db';

const SEED_RESULTS: Partial<Result>[] = [
  {
    input: 'I meal-prepped for the entire week without abandoning halfway through',
    justification:
      'A peer-reviewed 2024 study in the Journal of Domestic Discipline found that meal prep compliance is inversely proportional to fridge ownership. Your neural pathways have been rewired for structure. You are now 63% less likely to order takeout in a state of panic. Recommendation: OXO Food Storage Containers (Set of 10) — $24.99.',
    product: {
      id: 'oxo-storage',
      name: 'OXO Good Grips 10-Piece Storage Container Set',
      category: 'home',
      price: '$24.99',
      affiliateUrl: 'https://www.amazon.com/s?k=oxo+storage+containers&tag=youdeserven07-20',
      imageUrl: 'https://m.media-amazon.com/images/I/81nxmTJt0zL._AC_SX679_.jpg',
    },
  },
  {
    input: 'I actually responded to emails from 2 months ago',
    justification:
      'Congratulations on joining the 0.0001% of humans who achieve inbox triage. Your prefrontal cortex has expanded. You are now 47% more organized than the baseline human. The Institute recommends: Notability iPad App (Lifetime) or GoodNotes — $9.99.',
    product: {
      id: 'app-notability',
      name: 'GoodNotes 5 - Digital Notes App',
      category: 'productivity',
      price: '$9.99',
      affiliateUrl: 'https://www.amazon.com/s?k=goodnotes&tag=youdeserven07-20',
      imageUrl: 'https://example.com/goodnotes.jpg',
    },
  },
  // ... add 50+ more
];

async function seedGallery() {
  console.log(`🌱 Seeding ${SEED_RESULTS.length} gallery entries...`);

  for (const entry of SEED_RESULTS) {
    try {
      await saveResult({
        id: `seed_${Math.random().toString(36).slice(7)}`,
        input: entry.input!,
        justification: entry.justification!,
        product: entry.product!,
        shareUrl: `https://youdeservenow.com/result/seed_...`,
        createdAt: new Date().toISOString(),
        published: true,
        featured: true,
      });
      console.log(`✅ ${entry.input?.substring(0, 50)}...`);
    } catch (error) {
      console.error(`❌ Failed to seed:`, error);
    }
  }

  console.log('✨ Seeding complete!');
}

seedGallery().catch(console.error);
```

Run it:
```bash
npx tsx scripts/seed-gallery.ts
```

---

## Fix 1.4: Content moderation

### Add OpenAI Moderation API

Already have OpenAI? Update `lib/moderation.ts`:

```typescript
// lib/moderation.ts
import { openai } from '@ai-sdk/openai';

export async function checkContentSafety(input: string): Promise<{
  flagged: boolean;
  categories?: Record<string, boolean>;
  reason?: string;
}> {
  try {
    const result = await openai.moderation.create({
      model: 'text-moderation-latest',
      input,
    });

    const flagged = result.results[0]?.flagged ?? false;
    const categories = result.results[0]?.categories ?? {};

    if (flagged) {
      const violatedCategories = Object.entries(categories)
        .filter(([_, v]) => v)
        .map(([k]) => k)
        .join(', ');

      return {
        flagged: true,
        categories,
        reason: `Content flagged for: ${violatedCategories}`,
      };
    }

    return { flagged: false };
  } catch (error) {
    console.error('Moderation check failed:', error);
    // Fail open (don't block) on API errors
    return { flagged: false };
  }
}
```

### Integrate into `/api/generate`

```typescript
// In app/api/generate/route.ts, after input sanitization:

import { checkContentSafety } from '@/lib/moderation';

// ... existing code ...

const safeInput = sanitizeInput(body.input);

// NEW: Check moderation
const moderation = await checkContentSafety(safeInput);
if (moderation.flagged) {
  return NextResponse.json(
    {
      error:
        'The Institute does not have research on this category. Try telling us about something smaller — a meal you cooked, a meeting you survived, a walk you took.',
    },
    { status: 400 }
  );
}

// ... continue with generation ...
```

---

## Quick Wins Checklist

- [ ] Fix 1.2: OG card generation (6–8 hours)
  - [ ] Install `@vercel/og`
  - [ ] Create `lib/og-image-generator.ts`
  - [ ] Create `/api/og-card`
  - [ ] Update result page metadata
  - [ ] Add share buttons
  - [ ] Test: paste result URL into Slack, Twitter, iMessage

- [ ] Fix 1.1: Real product images (4–6 hours)
  - [ ] Set up Amazon PA-API
  - [ ] Create `lib/amazon-pa-api.ts`
  - [ ] Run image update migration
  - [ ] Verify all products have real images

- [ ] Fix 1.3: Gallery seeding (2–3 hours)
  - [ ] Create 50+ seed entries
  - [ ] Run seed script
  - [ ] Delete/hide test entries
  - [ ] Verify gallery looks active

- [ ] Fix 1.4: Content moderation (1–2 hours)
  - [ ] Add OpenAI Moderation API
  - [ ] Integrate into `/api/generate`
  - [ ] Test with flagged content

**Total: ~13–19 hours of focused work. Two senior devs could complete this in one week.**

---

## Testing Checklist

After implementing each fix:

1. **OG Cards:**
   - [ ] Test each size (mobile/square/og) renders correctly
   - [ ] Paste result URL into Slack → card appears
   - [ ] Paste result URL into X/Twitter → card appears
   - [ ] Paste into iMessage → card appears
   - [ ] Download button works for each size

2. **Product Images:**
   - [ ] All 70+ products show real images on homepage
   - [ ] Gallery cards load images without broken placeholders
   - [ ] Result pages display product images correctly
   - [ ] Mobile responsive (no cut-off images)

3. **Gallery Seeding:**
   - [ ] Wall of Fame shows >10 entries
   - [ ] Gallery sorted by date (newest first)
   - [ ] No "0 results" message
   - [ ] Test entries hidden from public view

4. **Moderation:**
   - [ ] Test with benign input → passes
   - [ ] Test with violence keyword → blocked gracefully
   - [ ] Error message is friendly, not scary
   - [ ] Database shows moderation flag in result metadata

---

## Deployment

After all fixes:

```bash
npm run build
npm run lint
npm run type-check

# Deploy to Vercel
vercel deploy --prod
```

Expected deployment time: **2–5 minutes**

---

## Success Metrics (Week 1)

After shipping these 4 fixes, measure:

- **Affiliate clicks:** 3–10x increase (from real product images)
- **Social shares:** 25%+ of result page viewers click share buttons
- **Gallery views:** >30% of new users browse gallery
- **Moderation blocks:** <2% of inputs flagged (calibrate threshold if too high)

If you see these signals, you're on the right path. Move to Priority 2.
