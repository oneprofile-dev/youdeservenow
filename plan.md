# YouDeserveNow.com — Claude Code Build Plan
## Production-Ready, Enterprise-Quality, Vercel-Deployed

---

## VISION

A single-page web app where anyone types what they accomplished today, and an AI responds with a hilarious "scientific justification" for why they deserve a specific trending product — complete with an affiliate link to buy it. Results are shareable as beautiful cards on social media with #YouDeserveNow. The site grows organically through shares, SEO from a public gallery, and earns revenue through affiliate commissions and display ads.

---

## TECH STACK

| Layer | Technology | Why |
|-------|-----------|-----|
| Framework | **Next.js 15 (App Router)** | Best Vercel integration, SSR for SEO, API routes for backend |
| Language | **TypeScript** | Production safety, enterprise quality |
| Styling | **Tailwind CSS 4** | Rapid, consistent, responsive design |
| Fonts | **Google Fonts: Instrument Serif (display) + Satoshi (body)** | Premium, warm, modern — avoids AI-slop fonts |
| AI Engine | **Gemini 2.5 Flash-Lite API** (primary) | 1,500 free requests/day, no credit card |
| AI Fallback | **Groq API** (Llama 3.3 70B) | 1,000 free requests/day backup |
| Database | **Vercel KV (Redis)** or **Vercel Postgres** free tier | Store gallery results, rate limiting |
| Image Gen | **html-to-image** (npm package) | Generate shareable cards client-side |
| Analytics | **Vercel Analytics** (free) | Built-in, zero config |
| Deployment | **Vercel** (free Hobby tier) | Auto-deploy from GitHub, global CDN |
| Domain | **youdeservenow.com** | Already owned |

---

## PROJECT STRUCTURE

```
youdeservenow/
├── app/
│   ├── layout.tsx              # Root layout — fonts, metadata, analytics
│   ├── page.tsx                # HOME — the one-input experience
│   ├── result/[id]/
│   │   └── page.tsx            # Shareable result page (SSR for OG tags)
│   ├── gallery/
│   │   └── page.tsx            # Public gallery of best results (SEO engine)
│   ├── api/
│   │   ├── generate/
│   │   │   └── route.ts        # POST — calls Gemini, returns justification
│   │   ├── share/
│   │   │   └── route.ts        # POST — saves result to DB, returns share URL
│   │   └── products/
│   │       └── route.ts        # GET — returns trending products with affiliate links
│   └── globals.css             # Tailwind + custom styles
├── components/
│   ├── Hero.tsx                # Landing hero with input box
│   ├── ResultCard.tsx          # The "scientific justification" display
│   ├── ShareCard.tsx           # Styled card for social sharing (screenshot-able)
│   ├── ProductRecommendation.tsx # Affiliate product with CTA
│   ├── Gallery.tsx             # Grid of past results
│   ├── Footer.tsx              # Minimal footer — links, legal
│   ├── Header.tsx              # Logo + nav
│   ├── LoadingAnimation.tsx    # Engaging loading state while AI generates
│   └── ShareButtons.tsx        # X, TikTok, Copy Link, Download Image
├── lib/
│   ├── gemini.ts               # Gemini API client with retry + fallback to Groq
│   ├── groq.ts                 # Groq API client (fallback)
│   ├── products.ts             # Product database + category mapping
│   ├── prompt.ts               # THE prompt — the soul of the app
│   ├── rate-limit.ts           # Rate limiting per IP (prevent abuse)
│   ├── db.ts                   # Database client (Vercel KV or Postgres)
│   └── utils.ts                # Helpers — ID generation, sanitization
├── public/
│   ├── og-image.png            # Default Open Graph image
│   ├── favicon.ico             # Favicon
│   └── fonts/                  # Self-hosted fonts if needed
├── data/
│   └── products.json           # Curated product database with affiliate links
├── .env.local                  # API keys (never committed)
├── .env.example                # Template for required env vars
├── next.config.ts              # Next.js configuration
├── tailwind.config.ts          # Tailwind configuration
├── tsconfig.json               # TypeScript config
├── package.json                # Dependencies
├── vercel.json                 # Vercel-specific config (optional)
└── README.md                   # Setup + deployment instructions
```

---

## CORE FILES — DETAILED SPECIFICATIONS

### 1. `lib/prompt.ts` — THE SOUL OF THE APP

This is the most important file. The AI prompt must produce outputs that are:
- **Funny enough to screenshot and share**
- **Pseudo-scientific (deadpan, absurd authority)**
- **Specific to a real product with affiliate link**
- **Varied — never repetitive across generations**

```typescript
export function buildPrompt(userInput: string, product: Product): string {
  return `You are the world's most prestigious (fictional) Institute for Deserved Rewards.

The user accomplished something today: "${userInput}"

Based on this achievement, write a SHORT (3-4 sentences max) pseudo-scientific justification for why they absolutely MUST reward themselves with: ${product.name}.

RULES:
- Invent a fake but realistic-sounding study, journal, or institute name
- Use scientific-sounding language but make it absurd and funny
- Reference fake statistics (be specific — "73.2% of participants")
- The tone is DEADPAN. You are completely serious. This is urgent science.
- End with a dramatic one-liner that feels like a prescription
- Do NOT use emojis
- Do NOT break character — you are a serious scientist
- Keep it under 280 characters if possible for Twitter shareability
- The product recommendation must feel like an inevitable scientific conclusion

EXAMPLE OUTPUT STYLE:
"A 2024 study in the Journal of Domestic Resilience found that post-cleaning dopamine crashes affect 73.2% of adults. The recommended intervention? Immediate olfactory restoration. You need a Yankee Candle (Vanilla Cupcake, 3-wick). This is neuroscience, not a suggestion."

Generate the justification now:`;
}
```

### 2. `lib/products.ts` — PRODUCT CATEGORY MAPPING

```typescript
export interface Product {
  id: string;
  name: string;
  category: string;
  affiliateUrl: string;       // Amazon Associates or other affiliate link
  imageUrl: string;           // Product image
  price: string;              // Display price
  keywords: string[];         // Trigger keywords from user input
}

// Category mapping logic:
// "workout" | "gym" | "ran" | "exercise"  →  fitness gear
// "work" | "meeting" | "deadline" | "boss" →  comfort/relaxation items
// "cleaned" | "organized" | "laundry"     →  home/candles/comfort
// "cooked" | "meal prep" | "recipe"       →  kitchen gadgets
// "studied" | "exam" | "homework"         →  tech/gadgets/treats
// "survived" | "monday" | "tough day"     →  self-care/wellness
// DEFAULT (no match)                      →  trending/popular items
```

**Product Database (data/products.json):**
- Start with 50-100 curated products across 8 categories
- All with Amazon Associates affiliate links (tag=youdeservenow-20)
- Include: weighted blankets, candles, skincare, headphones, snack boxes, massage guns, journals, gadgets, cozy socks, bath bombs, etc.
- Each product has multiple keyword triggers
- Rotate randomly within matched category for variety

### 3. `lib/gemini.ts` — AI CLIENT WITH FALLBACK

```typescript
// Primary: Gemini 2.5 Flash-Lite (free tier)
// Fallback: Groq Llama 3.3 70B (free tier)
// Strategy: Try Gemini first. If rate-limited (429), fall to Groq.
// If both fail, return a pre-written funny fallback response.

// Key implementation details:
// - Timeout: 10 seconds max per request
// - Retry: 1 retry on Gemini before falling to Groq
// - Cache: Cache identical inputs for 1 hour (Vercel KV)
// - Safety: Strip any harmful/inappropriate content from output
// - Rate limit: Max 5 requests per IP per minute (prevent abuse)
```

### 4. `app/page.tsx` — THE HOME PAGE

**Design Vision: "Luxury editorial meets internet culture"**

The page should feel like opening a premium magazine that's also deeply funny. Think Aesop skincare branding meets Cards Against Humanity copywriting.

**Layout (single scroll, no navigation needed):**

```
┌─────────────────────────────────────────────┐
│                                             │
│   [Logo: YouDeserveNow wordmark]            │
│                                             │
│   ─────────────────────────────             │
│                                             │
│        What did you accomplish              │
│             today?                          │
│                                             │
│   ┌─────────────────────────────────────┐   │
│   │  I survived a 3-hour meeting...  |→ │   │
│   └─────────────────────────────────────┘   │
│                                             │
│        [Subtle rotating placeholder          │
│         examples that inspire input]        │
│                                             │
│   ─────────────────────────────             │
│                                             │
│   "Backed by absolutely no real science."   │
│                                             │
│   ─────────────────────────────             │
│                                             │
│   [Gallery preview: 3-4 recent results]     │
│   [See all results →]                       │
│                                             │
│   ─────────────────────────────             │
│                                             │
│   Footer: About | Privacy | #YouDeserveNow  │
│                                             │
└─────────────────────────────────────────────┘
```

**After submission, the page transforms:**

```
┌─────────────────────────────────────────────┐
│                                             │
│   THE SCIENCE IS IN.                        │
│                                             │
│   ┌─────────────────────────────────────┐   │
│   │                                     │   │
│   │   "According to the Institute of    │   │
│   │    Post-Meeting Recovery (2024),     │   │
│   │    92.7% of survivors require        │   │
│   │    immediate noise-canceling         │   │
│   │    headphone therapy..."             │   │
│   │                                     │   │
│   │   ┌─────────────────────────────┐   │   │
│   │   │  [Product Image]            │   │   │
│   │   │  Sony WH-1000XM5            │   │   │
│   │   │  $278.00                    │   │   │
│   │   │  [CLAIM YOUR REWARD →]      │   │   │
│   │   └─────────────────────────────┘   │   │
│   │                                     │   │
│   │   ─── Share your diagnosis ───      │   │
│   │   [𝕏] [TikTok] [Copy] [↓ Image]    │   │
│   │                                     │   │
│   └─────────────────────────────────────┘   │
│                                             │
│   [Try another →]                           │
│                                             │
└─────────────────────────────────────────────┘
```

### 5. `app/result/[id]/page.tsx` — SHAREABLE RESULT PAGE

**Critical for virality and SEO.** Each generated result gets a unique URL like:
`youdeservenow.com/result/a7x9k2`

This page must have:
- **Dynamic Open Graph meta tags** (so links preview beautifully on X/TikTok/iMessage)
- **og:title** → "I [user's achievement] and science says I deserve..."
- **og:image** → Server-rendered share card image (or fallback to a template)
- **og:description** → The first line of the AI justification
- **The full result card** with affiliate link
- **"Get YOUR justification →"** CTA back to home page
- **Structured data** (JSON-LD) for Google rich results

### 6. `app/gallery/page.tsx` — THE SEO ENGINE

A paginated grid of all public results. Each card links to its `/result/[id]` page.

**SEO value:** Every result becomes an indexed page. Search queries like:
- "why do I deserve a weighted blanket"
- "reward yourself after a hard day"
- "treat yourself science says"

...all lead here. This is the passive growth engine.

### 7. `components/ShareCard.tsx` — THE VIRAL MECHANIC

A beautifully designed card that users can:
1. **Screenshot** (optimized for mobile screenshot dimensions)
2. **Download as PNG** (using html-to-image library)
3. **Share directly** to X/TikTok with pre-filled text + #YouDeserveNow

The card design must be:
- **Instantly recognizable** as a YouDeserveNow result
- **Clean enough** to look good as a screenshot in any feed
- **Branded** with the logo and URL subtly included
- **Dimensions:** 1080x1350px (Instagram portrait) or 1080x1920px (TikTok/Story)

---

## DESIGN SYSTEM

### Color Palette
```css
:root {
  /* Primary — warm cream/ivory (not white) */
  --bg-primary: #FBF8F3;
  --bg-secondary: #F3EDE4;

  /* Text — rich warm blacks */
  --text-primary: #1A1814;
  --text-secondary: #6B6560;
  --text-tertiary: #9C9590;

  /* Accent — confident warm gold */
  --accent: #C8963E;
  --accent-hover: #B8862E;

  /* Result card — cream with subtle border */
  --card-bg: #FFFFFF;
  --card-border: #E8E0D6;

  /* CTA button — deep charcoal with gold text */
  --cta-bg: #1A1814;
  --cta-text: #FBF8F3;

  /* Dark mode */
  --dark-bg: #121210;
  --dark-surface: #1E1D1A;
  --dark-text: #F0EBE3;
  --dark-border: #2E2D2A;
}
```

### Typography
```css
/* Display/Headlines: Instrument Serif — warm, editorial, premium */
font-family: 'Instrument Serif', serif;

/* Body/UI: Satoshi — geometric, clean, modern but warm */
font-family: 'Satoshi', sans-serif;

/* Monospace (for the "science" text): JetBrains Mono or similar */
font-family: 'JetBrains Mono', monospace;
```

### Design Principles
1. **Warm, not cold** — cream backgrounds, warm grays, gold accents (not blue/purple)
2. **Editorial, not startup** — feels like a magazine, not a SaaS landing page
3. **Trust through restraint** — minimal elements, generous whitespace, no clutter
4. **Humor through contrast** — the design is serious/premium; the CONTENT is funny
5. **Mobile-first** — 70%+ traffic will be mobile from social media
6. **Dark mode** — full dark mode support (many Gen Z users prefer dark)
7. **Accessible** — WCAG AA compliant, keyboard navigable, screen reader friendly
8. **Fast** — target Lighthouse score 95+ on all metrics

---

## API ROUTE SPECIFICATIONS

### `POST /api/generate`

**Request:**
```json
{
  "input": "I survived a 3-hour meeting without falling asleep"
}
```

**Server logic:**
1. Rate-limit check (5/min per IP via Vercel KV)
2. Input sanitization (strip HTML, limit to 500 chars, block profanity)
3. Match input keywords → product category → select random product
4. Build prompt with selected product
5. Call Gemini Flash-Lite API (fallback to Groq on failure)
6. Parse response, validate output quality
7. Save to database with unique ID
8. Return result

**Response:**
```json
{
  "id": "a7x9k2",
  "input": "I survived a 3-hour meeting without falling asleep",
  "justification": "A 2024 study in the Journal of Corporate Endurance found that...",
  "product": {
    "name": "Sony WH-1000XM5 Headphones",
    "price": "$278.00",
    "imageUrl": "https://...",
    "affiliateUrl": "https://amazon.com/dp/...?tag=youdeservenow-20",
    "category": "tech"
  },
  "shareUrl": "https://youdeservenow.com/result/a7x9k2",
  "createdAt": "2026-04-18T..."
}
```

### `GET /api/products?category=wellness`

Returns products for a given category. Used for the gallery and fallback.

---

## ENVIRONMENT VARIABLES

```env
# .env.example — copy to .env.local and fill in

# Gemini API (get free key at ai.google.dev)
GEMINI_API_KEY=your_gemini_api_key

# Groq API (get free key at console.groq.com)
GROQ_API_KEY=your_groq_api_key

# Amazon Associates tag
AMAZON_AFFILIATE_TAG=youdeservenow-20

# Vercel KV (auto-provisioned in Vercel dashboard)
KV_REST_API_URL=
KV_REST_API_TOKEN=

# Site URL
NEXT_PUBLIC_SITE_URL=https://youdeservenow.com

# Optional: Google AdSense
NEXT_PUBLIC_ADSENSE_ID=

# Optional: Vercel Analytics
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=
```

---

## DEPLOYMENT — STEP BY STEP

### What Claude Code Does (Automated):

1. **Scaffolds** the entire Next.js 15 project with TypeScript + Tailwind
2. **Writes** every file listed above — production-ready, typed, tested
3. **Creates** the product database (50+ products with placeholder affiliate links)
4. **Builds** the AI integration with Gemini + Groq fallback
5. **Implements** rate limiting, input sanitization, error handling
6. **Designs** all components with the warm editorial design system
7. **Configures** SEO — meta tags, OG images, sitemap, robots.txt
8. **Sets up** dark mode with system preference detection
9. **Adds** share functionality — X, copy link, download image
10. **Creates** the gallery page with pagination
11. **Writes** README with complete setup instructions
12. **Initializes** git repo ready for GitHub push

### Manual Steps You Must Do:

#### STEP 1: Get API Keys (15 minutes)
1. Go to **ai.google.dev** → Get API key → Copy it (free, no credit card)
2. Go to **console.groq.com** → Sign up → API Keys → Create → Copy it (free)
3. Go to **affiliate-program.amazon.com** → Sign up for Amazon Associates → Get your tracking tag (e.g., `youdeservenow-20`)

#### STEP 2: Set Up GitHub Repo (5 minutes)
1. Create a new GitHub repo called `youdeservenow`
2. Push the Claude Code output to this repo:
   ```bash
   cd youdeservenow
   git init
   git add .
   git commit -m "Initial commit — YouDeserveNow.com"
   git remote add origin https://github.com/YOUR_USERNAME/youdeservenow.git
   git push -u origin main
   ```

#### STEP 3: Deploy to Vercel (10 minutes)
1. Go to **vercel.com** → Sign up with GitHub (free)
2. Click **"Add New Project"**
3. Import the `youdeservenow` GitHub repo
4. Vercel auto-detects Next.js — leave all settings as default
5. Add Environment Variables in the Vercel dashboard:
   - `GEMINI_API_KEY` → paste your Gemini key
   - `GROQ_API_KEY` → paste your Groq key
   - `AMAZON_AFFILIATE_TAG` → your Amazon tag
   - `NEXT_PUBLIC_SITE_URL` → `https://youdeservenow.com`
6. Click **Deploy** — wait ~60 seconds
7. Your site is live at `youdeservenow.vercel.app`

#### STEP 4: Connect Custom Domain (10 minutes)
1. In Vercel dashboard → Settings → Domains → Add `youdeservenow.com`
2. Vercel gives you DNS records (typically a CNAME or A record)
3. Go to your domain registrar (GoDaddy) → DNS settings
4. Add the records Vercel provides
5. Wait for DNS propagation (usually 5-30 minutes)
6. HTTPS is automatic — Vercel handles SSL certificates

#### STEP 5: Set Up Vercel KV Database (5 minutes)
1. In Vercel dashboard → Storage → Create Database → KV
2. Select the free tier
3. Environment variables are auto-injected into your project
4. Redeploy (Vercel does this automatically)

#### STEP 6: Replace Placeholder Affiliate Links (30-60 minutes)
1. Open `data/products.json`
2. For each product, go to Amazon → find the product → get your affiliate link
3. Replace placeholder URLs with real affiliate links
4. Commit and push — Vercel auto-deploys

#### STEP 7: Seed Your Social Presence (ongoing, 30 days)
1. Generate 10-15 results on your own site
2. Screenshot or download the share cards
3. Post 2-3 per day on TikTok and X with #YouDeserveNow
4. Use trending sounds on TikTok
5. Engage with comments

---

## POST-LAUNCH ENHANCEMENTS (Future Iterations)

| Priority | Enhancement | Revenue Impact |
|----------|-------------|---------------|
| Week 2 | Add Google AdSense to result pages | +$50-150/mo at 1K daily |
| Week 3 | Add "email me my result" → build email list | Future marketing channel |
| Month 2 | Add TikTok Shop product tagging | +45-65% conversion lift |
| Month 2 | Implement og:image generation (Vercel OG) | Better social previews |
| Month 3 | Add seasonal product rotations | Higher relevance = more clicks |
| Month 3 | A/B test prompt variations | Optimize for funniest outputs |
| Month 6 | Add premium tier ($2.99/mo): unlimited, ad-free, save history | Recurring revenue |

---

## QUALITY CHECKLIST

Before considering the build complete, verify:

- [ ] Lighthouse Performance score ≥ 95
- [ ] Lighthouse Accessibility score ≥ 95
- [ ] Lighthouse SEO score = 100
- [ ] Mobile responsive — tested on iPhone SE through iPad Pro
- [ ] Dark mode — fully functional and beautiful
- [ ] Rate limiting — prevents abuse (5 req/min/IP)
- [ ] Error handling — graceful failures with fallback messages
- [ ] Input sanitization — XSS prevention, profanity filter
- [ ] OG meta tags — every page has correct previews
- [ ] Share cards — download and screenshot both work
- [ ] Affiliate links — all open in new tab with rel="noopener"
- [ ] FTC compliance — "This page contains affiliate links" disclosure
- [ ] Privacy policy — basic privacy page covering data usage
- [ ] 404 page — custom, on-brand, with "go home" CTA
- [ ] Favicon + Apple touch icon — branded
- [ ] Sitemap.xml — auto-generated from gallery pages
- [ ] robots.txt — allows crawling of gallery + result pages

---

## CLAUDE CODE PROMPT

Copy this entire document and provide it to Claude Code with the instruction:

> "Build this project exactly as specified. Create every file, write production-ready TypeScript, implement the design system with Tailwind, and ensure it's ready to deploy to Vercel. Start with the project scaffold, then build each file in order. Test that it builds successfully with `npm run build`. Output the complete project to the current directory."

---

## TOTAL COST

| Item | Cost |
|------|------|
| Domain (already owned) | $0 |
| Vercel Hobby tier | $0 |
| Gemini API free tier | $0 |
| Groq API free tier | $0 |
| Vercel KV free tier | $0 |
| Amazon Associates | $0 |
| **Total** | **$0** |

---

## ESTIMATED TIMELINE

| Task | Time |
|------|------|
| Claude Code generates project | 30-60 min |
| Get API keys | 15 min |
| GitHub + Vercel deploy | 15 min |
| Connect domain | 10 min |
| Replace affiliate links | 30-60 min |
| **Total to live site** | **~2-3 hours** |

---

*Built with the conviction that everyone deserves to celebrate their wins — and that the best products find people through humor, not ads.*