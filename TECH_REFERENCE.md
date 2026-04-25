# Technical Implementation Reference

**For:** Developers implementing Priority 1 fixes  
**Reference:** Detailed code snippets, env vars, and API integrations  
**Status:** Updated April 25, 2026

---

## Dependencies Check

Before you start, verify these packages are installed:

```bash
npm list @vercel/og satori html-to-image nanoid resend @ai-sdk/openai
```

If missing, add them:
```bash
npm install @vercel/og satori
# or
npm install html-to-image
# or
npm install @ai-sdk/openai
```

---

## Environment Variables Required

### For Fix 1.1 (Amazon PA-API)

```bash
# Get these from Amazon Associates > Settings > API Access
AMAZON_PA_API_KEY="AKIAIOSFODNN7EXAMPLE"
AMAZON_PA_API_SECRET="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
AMAZON_PA_PARTNER_TAG="youdeserven07-20"  # Your affiliate tag

# Store in .env.local (never commit)
```

### For Fix 1.4 (Content Moderation)

```bash
# If using OpenAI Moderation API (not Groq)
OPENAI_API_KEY="sk-proj-..."

# Already have this? Good, moderation uses the same key
```

---

## File Structure After Implementation

```
lib/
  ├── og-image-generator.ts       ← Fix 1.2 (NEW)
  ├── amazon-pa-api.ts            ← Fix 1.1 (NEW)
  ├── moderation.ts               ← Fix 1.4 (NEW)
  ├── gemini.ts                   ← existing
  ├── db.ts                        ← existing
  └── products.ts                 ← existing (update imageUrl)

components/
  ├── ResultShareButtons.tsx       ← Fix 1.2 (NEW)
  └── ResultCard.tsx              ← existing (add share buttons)

app/api/
  ├── og-card/
  │   └── route.ts                ← Fix 1.2 (NEW)
  ├── generate/
  │   └── route.ts                ← Fix 1.4 (update with moderation)
  └── (other routes)

data/
  └── products.json               ← Fix 1.1 (update imageUrl fields)

scripts/
  ├── seed-gallery.ts             ← Fix 1.3 (NEW)
  ├── update-product-images.mjs   ← Fix 1.1 (NEW)
  └── (other scripts)
```

---

## API Reference: Key Functions

### Fix 1.2: OG Image Generation

```typescript
// Signature
async function generatePrescriptionCard(
  result: Result,
  size: 'mobile' | 'square' | 'og'
): Promise<Buffer | null>

// Usage
const image = await generatePrescriptionCard(result, 'og');
```

**Input:** `Result` object with `input`, `justification`, `product`  
**Output:** PNG buffer (1200×630 for `og`, 1080×1920 for `mobile`, 1080×1080 for `square`)  
**Caching:** Vercel caches for 1 hour, stale-while-revalidate for 24 hours

**Route:** `GET /api/og-card?id=[resultId]&size=og`

---

### Fix 1.1: Amazon PA-API Search

```typescript
// Signature
async function searchProducts(keywords: string): Promise<{
  imageUrl?: string;
  price?: string;
  asin?: string;
}>

// Usage
const result = await searchProducts('Yoga Mat Premium');
// Returns: {
//   imageUrl: 'https://m.media-amazon.com/images/...',
//   price: '$29.99',
//   asin: 'B0ABC123DEF'
// }
```

**Note:** PA-API requires 3+ qualifying sales in last 180 days to activate. If not eligible, fallback to ShareASale or CJ Affiliate feeds.

---

### Fix 1.4: Content Moderation

```typescript
// Signature
async function checkContentSafety(input: string): Promise<{
  flagged: boolean;
  categories?: Record<string, boolean>;
  reason?: string;
}>

// Usage
const safety = await checkContentSafety(userInput);
if (safety.flagged) {
  // Block and show friendly error
  return errorResponse('This topic isn\'t research yet...');
}
```

**Categories checked:** violence, self-harm, sexual abuse, hate speech, harassment  
**Cost:** Free (OpenAI Moderation API)  
**Latency:** ~200ms  
**Accuracy:** 99%+ precision (very few false positives)

---

## Data Schema Updates

### Result Type (Fix 1.2)

Existing `lib/db.ts` `Result` type:

```typescript
interface Result {
  id: string;
  input: string;
  justification: string;
  product: {
    id: string;
    name: string;
    category: string;
    price: string;
    affiliateUrl: string;
    imageUrl: string;        // ← NOW: real Amazon URL instead of picsum
  };
  shareUrl: string;
  createdAt: string;
  audience?: 'self' | 'loved_one' | 'we';
  voice?: 'classic' | 'warm';
  gift?: { recipientName: string; senderName?: string };
  published?: boolean;       // ← NEW: for seeding (Fix 1.3)
  featured?: boolean;        // ← NEW: for curated gallery
  moderated?: boolean;       // ← NEW: content moderation flag (Fix 1.4)
}
```

---

## Common Pitfalls & Solutions

### Pitfall 1: OG image takes too long to generate

**Solution:** Use edge functions, cache aggressively
```typescript
// In route.ts
export const runtime = 'edge'; // Run in Vercel Edge, not serverless
```

### Pitfall 2: Amazon PA-API returns "Unauthorized"

**Solution:** Check these in order
1. API Key ID is correct (not the Secret)
2. Secret is correct
3. Partner Tag matches your affiliate account
4. Your account has 3+ qualifying sales in last 180 days
5. Timestamp is correct (not off by >5 minutes)

### Pitfall 3: Product images don't load in OG card

**Solution:** Use absolute URLs, not relative
```typescript
// ✅ CORRECT
imageUrl: "https://m.media-amazon.com/images/..."

// ❌ WRONG
imageUrl: "/images/product.jpg"
```

### Pitfall 4: Moderation blocking too much content

**Solution:** Adjust threshold or review categories
```typescript
// Only block if multiple categories flagged
if (Object.values(categories).filter(Boolean).length > 2) {
  flagged = true;
}
```

### Pitfall 5: Gallery seed script fails halfway through

**Solution:** Add checkpointing
```typescript
// Track which IDs were already seeded
const seededIds = await getAlreadySeededIds();
for (const entry of entries) {
  if (seededIds.includes(entry.id)) continue; // Skip
  // ... seed entry ...
}
```

---

## Testing Checklist

### For OG Cards (Fix 1.2)

```bash
# 1. Local test
curl "http://localhost:3000/api/og-card?id=abc123&size=og" > test.png
open test.png  # View in system image viewer

# 2. Slack test
# Paste result URL into Slack → image should render

# 3. Twitter test
# Paste result URL into Twitter Draft → image should appear

# 4. Size verification
# Test all 3 sizes load and have correct dimensions
```

### For Product Images (Fix 1.1)

```bash
# 1. Check products.json
grep "picsum.photos" data/products.json
# Should return: (nothing) — all images updated

# 2. Homepage visual test
# View homepage on desktop and mobile
# All product thumbnails should load without broken images

# 3. Result page test
# Generate a result, verify product image loads
# Check product links are clickable
```

### For Moderation (Fix 1.4)

```bash
# 1. Benign test
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{"input":"I cleaned my apartment"}' \
# Should return: successful generation

# 2. Violence test
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{"input":"I murdered someone"}' \
# Should return: friendly error message
```

---

## Performance Targets

After implementation, monitor these metrics:

| Metric | Target | How to Measure |
|--------|--------|----------------|
| OG image generation latency | <2 seconds | Vercel Analytics / CloudWatch |
| PA-API search latency | <1.5 seconds | API logs |
| Moderation check latency | <300ms | Middleware logs |
| OG image cache hit rate | >90% | Vercel cache metrics |
| Product image load time | <200ms | Lighthouse |

---

## Rollback Plan

If something breaks in production:

### Rollback OG Cards
```bash
# Remove OG image route
git revert [commit-hash]
# Revert to default og:image in metadata
# Result URLs will fall back to homepage OG image
# No user impact, just no pretty cards
```

### Rollback Product Images
```bash
# Restore picsum.photos URLs in products.json
git checkout main -- data/products.json
# Redeploy
vercel deploy --prod
# Back to stock images, but functionality restored
```

### Rollback Moderation
```bash
# Remove moderation check from /api/generate
git revert [commit-hash]
# All inputs accepted again
# No user impact, but brand risk increases
```

---

## Monitoring & Alerts

After deploying, set up alerts:

1. **OG image generation failures**: >1% error rate
2. **PA-API failures**: >5% error rate
3. **Moderation false positives**: >10% of inputs flagged
4. **Affiliate link CTR drop**: >20% decrease from baseline

---

## Links & Resources

- [Vercel OG Image Generation](https://vercel.com/docs/functions/og-image-generation)
- [Amazon Product Advertising API](https://webservices.amazon.com/paapi5/documentation/)
- [OpenAI Moderation API](https://platform.openai.com/docs/guides/moderation)
- [html-to-image docs](https://github.com/bubkis/html-to-image)
- [Satori docs](https://github.com/vercel/satori)

---

## Emergency Contacts

- **Vercel Issues**: support@vercel.com
- **Amazon PA-API Issues**: Associate support portal
- **OpenAI Moderation Issues**: support@openai.com

---

## Code Review Checklist

Before merging Fix 1–4, reviewer should verify:

- [ ] No hardcoded API keys in code (all env vars)
- [ ] Error handling is graceful (no 500s for bad input)
- [ ] Rate limiting still works (no DOS vector)
- [ ] Type safety maintained (TypeScript strict mode)
- [ ] Tests pass (if applicable)
- [ ] Lighthouse score ≥95
- [ ] No new security issues (CSP, XSS, CSRF)
- [ ] Caching headers set correctly
- [ ] Fallbacks work (Groq if Gemini fails, etc.)

---

## Git Commit Messages

For consistency:

```
feat: Replace picsum.photos with Amazon PA-API product images

- Fetch real product images from Amazon
- Update products.json with live URLs
- Add aggressive caching for image URLs
- Implement fallback to ShareASale for non-Amazon products

Fixes #123
```

```
feat: Add shareable prescription card OG image generation

- Generate 3-size cards (mobile, square, og)
- Set as og:image for each result
- Add download buttons for social media
- Test on Slack, Twitter, iMessage

Fixes #124
```

```
feat: Pre-seed gallery with curated entries

- Add 50+ hand-picked diagnoses
- Tag test entries as hidden
- Populate Wall of Fame with genuine entries
- Verify no "0 results" message on first visit

Fixes #125
```

```
feat: Add content moderation with OpenAI API

- Block violence, self-harm, sexual abuse, hate speech
- Check every user input before saving
- Graceful error message for flagged content
- Never publish flagged entries to gallery

Fixes #126
```

---

## Success Verification

After shipping, you should see:

✅ **In Vercel Analytics:**
- 25%+ of result page viewers share (vs. 0% before)
- 3–10x affiliate click-through rate increase
- <2s OG image generation latency

✅ **In Database:**
- >50 seeded gallery entries visible
- <2% of inputs flagged by moderation
- No violent/abusive content in public gallery

✅ **In User Behavior:**
- Social shares from result URLs appear in referrer logs
- First-time visitor bounce rate drops 20–30%
- Repeat visits increase (people return to see gallery)

✅ **In Revenue:**
- Affiliate commissions from real product images increase 3–10x

If you DON'T see these, investigate before moving to Priority 2.

---

*Reference Guide v1.0 — April 25, 2026*
