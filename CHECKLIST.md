# YouDeserveNow — Quick Reference Checklist

## 🎯 Priority 1: Critical Fixes (This Week)

### 1.1 — Replace picsum.photos with real product images
- [ ] Set up Amazon Product Advertising API credentials
  - [ ] Get API Key ID and Secret
  - [ ] Set `AMAZON_PA_API_KEY` env var
  - [ ] Set `AMAZON_PA_API_SECRET` env var
  - [ ] Set `AMAZON_PA_PARTNER_TAG` env var
- [ ] Create `lib/amazon-pa-api.ts` with PA-API client
- [ ] Create `scripts/update-product-images.mjs` migration
- [ ] Run migration to update all product images
- [ ] Verify products.json has real image URLs (not picsum.photos)
- [ ] Test on homepage, gallery, and result pages
- [ ] Deploy and monitor affiliate click-through rate

**Owner:** ___________  
**Status:** 🔴 Not started  
**Effort:** 4–6 hours  
**ROI:** 3–10x affiliate CTR increase

---

### 1.2 — Build shareable Prescription Card (OG images)
- [ ] Verify `@vercel/og` is in package.json (or install it)
- [ ] Create `lib/og-image-generator.ts` with 3-size generation
  - [ ] 1080×1920 (TikTok/Reels)
  - [ ] 1080×1080 (Instagram feed)
  - [ ] 1200×630 (Open Graph)
- [ ] Create `app/api/og-card/route.ts` endpoint
- [ ] Update result page `generateMetadata()` to use new OG endpoint
- [ ] Create `components/ResultShareButtons.tsx` component
  - [ ] Download as image (all 3 sizes)
  - [ ] Share to X/Twitter
  - [ ] Share to TikTok
  - [ ] Share to Instagram
  - [ ] Share to Facebook
  - [ ] Copy link button
- [ ] Add ResultShareButtons to result page display
- [ ] Test: Paste result URL into Slack, X, iMessage — card should appear
- [ ] Test: Download buttons work for all 3 sizes
- [ ] Deploy and monitor social share rate

**Owner:** ___________  
**Status:** 🔴 Not started  
**Effort:** 6–8 hours  
**ROI:** Viral coefficient increases from 0 to >0.5

---

### 1.3 — Clean gallery & pre-seed with curated content
- [ ] Create `scripts/seed-gallery.ts` with 50–100 curated entries
- [ ] Populate with hand-picked, genuinely funny diagnoses
- [ ] Tag entries with `featured: true`, `published: true`
- [ ] Create script to hide/delete test entries
  - [ ] Remove "ping" entry
  - [ ] Remove "test rate limit" entry
  - [ ] Remove "I did things" entry
- [ ] Run seed script against database
- [ ] Verify Wall of Fame shows >10 entries
- [ ] Verify Gallery shows only curated entries
- [ ] Test on homepage — should no longer say "No results yet"
- [ ] Deploy and monitor first-time visitor bounce rate

**Owner:** ___________  
**Status:** 🔴 Not started  
**Effort:** 2–3 hours  
**ROI:** Improves first-visit conversion by 20–30%

---

### 1.4 — Implement content moderation
- [ ] Verify OpenAI SDK in package.json (or install @ai-sdk/openai)
- [ ] Create `lib/moderation.ts` with OpenAI Moderation API integration
- [ ] Integrate moderation check into `app/api/generate/route.ts`
  - [ ] Check input before generation
  - [ ] Block flagged content gracefully
  - [ ] Return friendly error message
- [ ] Add moderation flag to result database schema
- [ ] Test with benign input → should pass
- [ ] Test with violence keywords → should block
- [ ] Test with self-harm keywords → should block
- [ ] Test with sexual abuse keywords → should block
- [ ] Monitor moderation rate (target <2% false positives)
- [ ] Deploy and monitor gallery for harmful content

**Owner:** ___________  
**Status:** 🔴 Not started  
**Effort:** 1–2 hours  
**ROI:** Prevents brand damage, enables confident scaling

---

## 🚀 Priority 2: Virality Mechanics (Week 2)

### 2.1 — Lightweight accounts + public profiles
- [ ] Set up auth system (magic link or Google sign-in)
- [ ] Create `User` model with email, username, streak, totalDiagnoses
- [ ] Build `app/u/[username]/page.tsx` public profile page
- [ ] Profile displays: streak, diagnosis count, level, top diagnoses
- [ ] Make profiles shareable as OG images
- [ ] Add "My Profile" link in header (authenticated users)
- [ ] Test profile generation and sharing
- [ ] Deploy and monitor profile share rate

**Owner:** ___________  
**Status:** 🔴 Not started  
**Effort:** 8–10 hours

---

### 2.2 — Activate Gift flow
- [ ] Verify `/gift` endpoint exists
- [ ] Add post-diagnosis CTA: "Gift someone?"
- [ ] Track sender → recipient → new user conversion
- [ ] Both sender and recipient get badge
- [ ] Add email notification to recipient (if email collected)
- [ ] Test end-to-end gift flow
- [ ] Deploy and monitor gift-to-signup conversion

**Owner:** ___________  
**Status:** 🔴 Not started  
**Effort:** 2–3 hours

---

### 2.3 — Couples/partner mode
- [ ] Create "Diagnose as a couple" flow
- [ ] Two inputs → joint prescription
- [ ] Single shareable link
- [ ] Both partners can share independently
- [ ] Test on mobile and desktop
- [ ] Deploy and monitor couples flow adoption

**Owner:** ___________  
**Status:** 🔴 Not started  
**Effort:** 3–4 hours

---

### 2.4 — Daily themed prompt rotation
- [ ] Create themed prompts (Monday: Survival, Wednesday: Domestic, etc.)
- [ ] Add to homepage hero section
- [ ] Rotate daily
- [ ] Set up email/push notifications (if email system exists)
- [ ] Test rotation and notifications
- [ ] Deploy and monitor engagement lift

**Owner:** ___________  
**Status:** 🔴 Not started  
**Effort:** 2–3 hours

---

## 💰 Priority 3: Monetization (Week 3+)

### 3.1 — Premium Diagnosis ($4.99)
- [ ] Create `app/premium` checkout page
- [ ] Integrate Stripe or payment provider
- [ ] Premium features: custom institute name, long-form, PDF, 5 products
- [ ] Add upgrade CTA after free diagnosis
- [ ] Test end-to-end purchase flow
- [ ] Deploy and monitor conversion rate (target 1–3%)

**Owner:** ___________  
**Status:** 🔴 Not started

---

### 3.2 — Subscription (Institute Pass, $4.99/mo)
- [ ] Create subscription model
- [ ] Unlimited premium diagnoses
- [ ] Monthly retrospective PDF
- [ ] Priority Wall of Fame placement
- [ ] Test signup and recurring billing
- [ ] Deploy and monitor (target 0.5% MAU subscribed)

**Owner:** ___________  
**Status:** 🔴 Not started

---

### 3.3 — Print-on-demand merch
- [ ] Partner with Printful/Printify
- [ ] Create 5 SKUs:
  - [ ] Framed print ($24.99)
  - [ ] Diploma ($19.99)
  - [ ] Mug ($14.99)
  - [ ] T-shirt ($24.99)
  - [ ] Sticker pack ($7.99)
- [ ] Integrate into result page CTA
- [ ] Test ordering and shipping
- [ ] Deploy and monitor sell-through

**Owner:** ___________  
**Status:** 🔴 Not started

---

### 3.4 — Affiliate localization
- [ ] Detect user country via Cloudflare geo headers
- [ ] Create mapping: country → Amazon storefront
  - [ ] US → .com
  - [ ] UK → .co.uk
  - [ ] Canada → .ca
  - [ ] Germany → .de
  - [ ] France → .fr
  - [ ] Italy → .it
  - [ ] Spain → .es
  - [ ] Japan → .co.jp
  - [ ] India → .in
  - [ ] Brazil → .com.br
  - [ ] Mexico → .com.mx
  - [ ] Australia → .com.au
- [ ] Use Amazon OneLink or geni.us for auto-geo-redirection
- [ ] Add regional partners: Flipkart (India), Mercado Libre (LATAM), Rakuten (Japan)
- [ ] Test link generation by country
- [ ] Deploy and monitor uplift (target 5x from localization)

**Owner:** ___________  
**Status:** 🔴 Not started

---

## 📊 Metrics to Track (Weekly)

- [ ] **New unique visitors/day**
- [ ] **% of visitors who submit diagnosis** (target >40%)
- [ ] **Affiliate CTR** (target >8%)
- [ ] **Social share rate** (target >25%)
- [ ] **7-day return rate** (target >25%)
- [ ] **K-factor** (viral coefficient, target >0.5)
- [ ] **Premium upgrade rate** (target >1%)
- [ ] **Wall of Fame engagement** (voting participation)

---

## 🎬 Launch Sequence

### Week 1 (Foundation)
**Owner:** Full team  
**Goal:** Ship all Priority 1 fixes
- Monday–Tuesday: OG cards (1.2)
- Tuesday–Wednesday: Product images (1.1)
- Wednesday: Gallery seeding (1.3)
- Thursday: Moderation (1.4)
- Friday: Testing & QA
- **Deploy:** Friday PM

### Week 2 (Virality)
**Owner:** TBD  
**Goal:** Ship Priority 2 (or subset)
- Monday–Wednesday: Accounts + profiles (2.1)
- Wednesday–Thursday: Gift activation (2.2)
- Thursday–Friday: Couples mode (2.3) or Daily themes (2.4)
- **Deploy:** Friday PM

### Week 3+ (Monetization)
**Owner:** TBD  
**Goal:** Launch revenue streams
- Premium tier (3.1)
- Affiliate localization (3.4)
- B2B Teams soft launch
- Press outreach begins

---

## 🔍 Success Metrics (After Week 1)

If you see these, you're on the right path:

- ✅ Affiliate clicks: **3–10x increase** (vs. baseline)
- ✅ Social shares: **25%+ of result viewers** click share buttons
- ✅ Gallery views: **>30% of new users** browse gallery
- ✅ Moderation blocks: **<2% of inputs** flagged
- ✅ Zero brand-damage incidents (moderation working)

If you DON'T see these, troubleshoot before moving to Priority 2.

---

## 🚨 Deployment Checklist

Before going live:

- [ ] All tests pass: `npm run test` (if tests exist)
- [ ] Type checking passes: `npm run type-check`
- [ ] Linting passes: `npm run lint`
- [ ] Lighthouse score ≥95 on all metrics
- [ ] OG cards render correctly on X, Slack, iMessage
- [ ] Product images load without broken links
- [ ] Gallery doesn't show "No results"
- [ ] Moderation doesn't block benign content
- [ ] Analytics tracking works
- [ ] Error logging works
- [ ] Rate limiting works

---

## 📞 Escalation Path

If stuck, escalate here:

| Issue | Owner | Escalation |
|-------|-------|-----------|
| Amazon PA-API auth failing | [Dev] | AWS support |
| OG image not rendering | [Dev] | Vercel support |
| Moderation too aggressive | [PM] | Adjust threshold |
| Gallery seeding incomplete | [Dev] | Use fallback seed data |
| Deployment failing | [DevOps] | Vercel logs |

---

## 🎯 The Bottom Line

**Ship 1.2 (OG cards) in next 7 days. This is your viral primitive.**

Everything else flows from this. A beautiful shareable card is the difference between "interesting site I visited once" and "thing I see on my feed multiple times a week."

Don't overthink it. Ship it. Measure it. Iterate.

---

*Last updated: April 25, 2026*
