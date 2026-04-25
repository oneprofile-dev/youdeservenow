# YouDeserveNow — Implementation Status & Action Plan

**Last Updated:** April 25, 2026  
**Status:** Foundation built, virality layer needed

---

## Executive Summary

YouDeserveNow has **strong foundations** but is leaving 90%+ of its growth and revenue on the table due to 6 critical gaps. The concept is genuinely viral; the execution gaps are fixable in 2–3 weeks.

**Current Health:**
- ✅ Core AI generation working (Gemini + Groq fallback)
- ✅ Multi-language support (11 languages)
- ✅ Rate limiting, input sanitization, profanity filter
- ✅ Persona-based product matching
- ✅ Affiliate links to Amazon
- ✅ Gallery, voting, teams, gift flow exist
- ✅ Dead link detection & replacement system
- ❌ **Real product images** — still using stock placeholders from `picsum.photos`
- ❌ **Shareable OG cards** — not optimized for social virality
- ❌ **Gallery seeding** — empty/polluted with test entries
- ❌ **Content moderation** — no safety classifier
- ❌ **Accounts/streaks** — no auth system
- ❌ **Email/notifications** — no re-engagement loop

---

## Priority 1: Critical Fixes (This Week)

### 1.1: Replace picsum.photos with real product images ⚡ **HIGHEST ROI**

**Current:** Every product uses `https://picsum.photos/seed/[slug]/400/400` — random landscape photos.  
**Problem:** No one clicks "buy a Cooling Blanket" when the image is a beach. Expected revenue impact: **90%+ loss vs. real images**.

**Implementation:**
- [ ] Set up Amazon Product Advertising API (PA-API 5.0) with affiliate tag
- [ ] Build `lib/amazon-pa-api.ts` to fetch product images + details
- [ ] Update `data/products.json` — replace all `picsum.photos` URLs with real Amazon images
- [ ] Implement aggressive caching (Cloudflare R2 or Vercel Blob) — Amazon URLs expire
- [ ] Fallback: ShareASale, CJ Affiliate, Rakuten feeds for non-Amazon products
- [ ] Test: Verify all product cards load real images on homepage, gallery, result pages

**Expected Impact:** 3–10x affiliate click-through rate  
**Effort:** 4–6 hours  
**Owner:** [Assign]

---

### 1.2: Build shareable Prescription Card (OG images) ⚡ **HIGHEST GROWTH**

**Current:** Result page is plain text. No visual artifact to share.  
**Problem:** People share images, not paragraphs. This is your viral primitive.

**Implementation:**
- [ ] Install `@vercel/og` and `satori` (already in dependencies? check)
- [ ] Create `lib/og-image-generator.ts`:
  - Input → User's achievement in quotes
  - "Institute of [Funny Name]" header
  - Verdict in 2–3 punchy lines
  - Product as inset image + price
  - QR code linking back to result
  - Branded watermark
- [ ] Generate **3 sizes**:
  - **1080×1920** (TikTok/Reels/Stories — primary viral)
  - **1080×1080** (Instagram feed, Threads)
  - **1200×630** (Open Graph/X/LinkedIn)
- [ ] Set as `og:image` on `/result/[slug]` pages
- [ ] Add "Download as image" button on result page
- [ ] Add "Share to TikTok/Instagram/X" buttons with pre-filled captions

**Expected Impact:** This converts "one-time visit" → "spreads while you sleep"  
**Effort:** 6–8 hours  
**Owner:** [Assign]

**Code sketch:**
```typescript
// lib/og-image-generator.ts
import { ImageResponse } from '@vercel/og';

export async function generatePrescriptionCard(result: Result, size: 'mobile' | 'square' | 'og') {
  return new ImageResponse((
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(...)',
      fontFamily: 'Instrument Serif',
    }}>
      <h1>{result.input}</h1>
      <p>{result.justification}</p>
      <img src={result.product.imageUrl} />
      {/* QR code, watermark, etc */}
    </div>
  ));
}
```

---

### 1.3: Clean gallery & pre-seed with curated content

**Current:** Wall of Fame shows "0 justifications," gallery has test entries ("ping", "test rate limit").  
**Problem:** New visitors see an abandoned project. First impression = bounce.

**Implementation:**
- [ ] Create `scripts/seed-gallery.ts` with 50–100 hand-picked, genuinely funny diagnoses
- [ ] Tag entries: `featured: true`, `curated: true`, `published: true`
- [ ] Hide test entries behind env flag or delete them
- [ ] Add admin queue to manually promote best entries to "Featured"
- [ ] Populate Wall of Fame with 20–30 absurd, screenshot-worthy entries
- [ ] Update Gallery component to show curated entries by default

**Seed examples:**
```json
{
  "input": "I meal-prepped for the entire week without abandoning halfway through",
  "justification": "A peer-reviewed 2024 study in the Journal of Domestic Discipline...",
  "product": "OXO Food Storage Containers",
  "featured": true
}
```

**Expected Impact:** Converts first-time visitors from "dead site" to "active community"  
**Effort:** 2–3 hours  
**Owner:** [Assign]

---

### 1.4: Implement content moderation

**Current:** Gallery can contain entries like "I hunted down my daughter's rapist and shot him" with product recommendation. Brand-existential risk.

**Implementation:**
- [ ] Use OpenAI Moderation API (free, built-in) to flag unsafe content
- [ ] Check every user input before saving to DB
- [ ] Categories: violence, self-harm, sexual abuse, hate speech
- [ ] For flagged inputs, graceful redirect: *"The Institute does not have research on this category. Try something smaller..."*
- [ ] Never publish flagged inputs to gallery
- [ ] Add "Report this diagnosis" button on result + gallery pages

**Code sketch:**
```typescript
// lib/moderation.ts
import { openai } from '@ai-sdk/openai';

export async function checkModerationStatus(input: string) {
  const result = await openai.moderation.create({
    input,
    model: 'text-moderation-latest',
  });
  
  if (result.results[0].flagged) {
    return {
      flagged: true,
      categories: result.results[0].categories,
    };
  }
  return { flagged: false };
}

// In /api/generate route:
const modStatus = await checkModerationStatus(body.input);
if (modStatus.flagged) {
  return NextResponse.json({
    error: 'The Institute does not have research on this category...',
  }, { status: 400 });
}
```

**Expected Impact:** Prevents brand damage, enables confident scaling  
**Effort:** 1–2 hours  
**Owner:** [Assign]

---

## Priority 2: Virality Mechanics (Week 2)

### 2.1: Lightweight accounts + public profiles

**Unlocks:** Streaks, leaderboards, profile sharing (each profile = viral artifact)

**Implementation:**
- [ ] Add magic-link auth (email + 6-digit code, or Google sign-in)
- [ ] Create `User` model: email, username, createdAt, streak, totalDiagnoses, level
- [ ] Build public profiles: `youdeservenow.com/u/[username]`
  - Streak count
  - Total diagnoses
  - "Doctorate level" (based on streak/volume)
  - Favorite institute name
  - Top 5 diagnoses
- [ ] Make profiles shareable as OG images
- [ ] Add "My Profile" link in header (authenticated users)

**Effort:** 8–10 hours  
**Owner:** [Assign]

---

### 2.2: Activate the Gift flow (already exists — supercharge)

**Current:** `/gift` exists but isn't promoted.

**Implementation:**
- [ ] After user gets their own diagnosis, prompt: *"Know someone who deserves this? Send them a free prescription."*
- [ ] Recipient gets personalized link: `/gift?from=[senderName]&recipient=[recipientName]`
- [ ] Both sender and recipient get "Gifted Diagnostician" badge
- [ ] Add email notification to recipient (if collected)
- [ ] Track gift metrics: sender → recipient → new user conversion

**Expected Impact:** Every gift is a high-conversion invite (framed as care, not promotion)  
**Effort:** 2–3 hours  
**Owner:** [Assign]

---

### 2.3: Couples/partner mode

**Implementation:**
- [ ] New flow: "Diagnose as a couple"
- [ ] Two people log their wins → joint prescription with both names
- [ ] Single shared link, both can share independently
- [ ] Both become users
- [ ] Seasonal copy: Valentine's, anniversaries, "hard week together"

**Effort:** 3–4 hours  
**Owner:** [Assign]

---

### 2.4: Daily themed prompt rotation

**Implementation:**
- [ ] Homepage features "Today's Research Focus":
  - Monday: "Survival Diagnostics"
  - Wednesday: "Domestic Victories"
  - Friday: "Friday Wins"
  - Sunday: "7-day Retrospective Prescription"
- [ ] Database of 7+ themed prompts, rotate daily
- [ ] Show in hero section with special styling
- [ ] Email/push notifications for daily reminders

**Effort:** 2–3 hours  
**Owner:** [Assign]

---

## Priority 3: Monetization Layer (Week 3+)

### 3.1: Premium Diagnosis ($4.99 one-time)

- [ ] Custom institute name of user's choice
- [ ] Long-form prescription (5 paragraphs vs. 1)
- [ ] Fictitious co-authors they nominate
- [ ] High-res printable PDF with seal + signature
- [ ] 5 product picks instead of 1

**Expected:** 1–3% conversion of free users = $4k–12k/mo at 100k MAU

---

### 3.2: Print-on-demand merch (Printful/Printify)

- Framed Prescription Print ($24.99)
- Diploma ($19.99)
- Mug ($14.99)
- T-shirt ($24.99)
- Sticker pack ($7.99)

**Margin:** 40–60% per unit

---

### 3.3: Subscription — "The Institute Pass" ($4.99/mo or $39/yr)

- Unlimited Premium diagnoses
- Custom institute branding saved to profile
- Priority Wall of Fame placement
- Monthly retrospective PDF
- Early access to themed seasons
- Couples plan: $7.99/mo

**Conservative target:** 0.5% MAU subscribed = $25k/yr at 100k MAU

---

### 3.4: Affiliate localization (fix existing revenue leak)

**Current:** US-only Amazon links on 11-language site.

**Implementation:**
- [ ] Detect user country (Cloudflare geo headers, free)
- [ ] Map to correct Amazon storefront: `.com`, `.co.uk`, `.ca`, `.de`, `.fr`, `.it`, `.es`, `.co.jp`, `.in`, `.com.br`, `.com.mx`, `.com.au`
- [ ] Use Amazon OneLink (free) or geni.us for geo-redirection
- [ ] Regional partners: Flipkart (India), Mercado Libre (LATAM), Rakuten (Japan)

**Expected uplift:** 5x revenue from existing traffic (11 languages × proper localization)

---

## Priority 4: SEO & Press (Week 3+)

### 4.1: SEO foundation

- [ ] Add structured data (`Review`/`Article` schema) on result pages
- [ ] Internal linking: each result links to 3 related diagnoses
- [ ] Create `/blog` with weekly "What [Demographic] Deserved This Week" posts
- [ ] Long-tail keyword targeting: "what do I deserve for [activity]"

### 4.2: Press hooks

**Target journalists:** Web Curios, Garbage Day, Dazed, BuzzFeed, The Verge, Mashable, NYT Style

**Pitch angles:**
- *"AI gives you a fake doctorate to justify online shopping"*
- *"Gen Z is using absurdist humor for self-care"*
- *"The website that tells you exactly what you deserve"*

**Cold-email template:** Send each journalist a *custom prescription* about their recent work as the hook.

---

## Metrics Dashboard (Essential)

Track weekly:

**Acquisition:**
- New unique visitors / day
- Top 5 referral sources
- Organic impressions (Search Console)

**Activation:**
- % of visitors who submit diagnosis (target >40%)
- Time-to-first-diagnosis (target <60s)

**Engagement:**
- Diagnoses per user per week
- 7-day return rate (target >25%)
- Streak distribution

**Virality (most important):**
- Share button click rate per result (target >25%)
- K-factor: new users per existing user/month (viral at >1.0)
- OG-image-driven traffic (via `/result/...` links)

**Monetization:**
- Affiliate CTR (target >8%)
- Affiliate conversion rate (target >2%)
- Revenue per active user per month
- Premium upgrade rate (target >1%)

---

## Things to Avoid

- ❌ **Don't add too many features at once** — gallery, gift, ledger, teams, shop already exist. Make 2–3 shine before adding more.
- ❌ **Don't drop the absurdist humor** — it's the moat. Lose the tone, lose the brand.
- ❌ **Don't paywall the core** — free diagnosis is the viral mechanic.
- ❌ **Don't over-index on Amazon** — diversify early (ShareASale, Impact, CJ, Rakuten).
- ❌ **Don't skip moderation** — get it tight before scaling.

---

## The One Thing (Next 48 Hours)

If you only do one thing this weekend: **Build the shareable Prescription Card image and set it as OG image for every result page.**

This single change converts the site from "interesting one-time visit" → "thing that spreads while you sleep."

A user creates a diagnosis → beautiful card renders → posts to Instagram → card does the marketing → friends click → loop closes.

Without that card, every share is text. With it, every share is an ad.

---

## Timeline

| Week | Focus | Owner |
|------|-------|-------|
| **Week 1** | Real product images + OG cards + gallery seeding + moderation | TBD |
| **Week 2** | Accounts + profiles + gift activation + couples mode | TBD |
| **Week 3** | Premium tier + affiliate localization + B2B Teams soft launch | TBD |
| **Week 4+** | Press outreach + TikTok content engine + merchandise | TBD |

---

## Next Steps

1. **Assign owners** to each Priority 1 task (realistically 2–3 people, 1 week)
2. **Start with OG cards + real product images** — these unlock everything else
3. **Ship one thing, then measure** — don't ship everything at once
4. **Build metrics dashboard** — get real data before optimizing further

The concept is genuinely viral. Now make the execution match.
