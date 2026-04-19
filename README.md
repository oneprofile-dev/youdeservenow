# YouDeserveNow.com

> Tell us what you accomplished. We'll provide the peer-reviewed scientific justification for your treat.

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env.local
```

Fill in your API keys:

| Variable | Where to get it | Required |
|----------|----------------|----------|
| `GEMINI_API_KEY` | [ai.google.dev](https://ai.google.dev) — free, no credit card | Yes |
| `GROQ_API_KEY` | [console.groq.com](https://console.groq.com) — free | Recommended |
| `AMAZON_AFFILIATE_TAG` | [affiliate-program.amazon.com](https://affiliate-program.amazon.com) | For revenue |
| `NEXT_PUBLIC_SITE_URL` | Your domain e.g. `https://youdeservenow.com` | Production |
| `KV_REST_API_URL` + `KV_REST_API_TOKEN` | Vercel KV dashboard | Production |

### 3. Run dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 4. Build for production

```bash
npm run build
```

## Deploy to Vercel

1. Push this repo to GitHub
2. Import at [vercel.com/new](https://vercel.com/new)
3. Add environment variables in Vercel dashboard
4. Add a Vercel KV database (Storage tab → Create → KV)
5. Deploy — done

### Connect your domain

In Vercel → Settings → Domains → add `youdeservenow.com`. Update DNS at your registrar to point to Vercel's nameservers or A record.

## Update affiliate links

Open `data/products.json` and replace each `affiliateUrl` with your real Amazon Associates link. Format:

```
https://www.amazon.com/dp/ASIN?tag=YOUR_TAG-20
```

## Tech stack

- **Next.js 15** (App Router) — framework
- **Tailwind CSS 4** — styling
- **Gemini 2.0 Flash-Lite** — AI generation (primary)
- **Groq Llama 3.3 70B** — AI fallback
- **Vercel KV** — database (Redis)
- **html-to-image** — share card downloads
- **Vercel Analytics** — built-in analytics

## Project structure

```
app/
  page.tsx              # Home page
  result/[id]/page.tsx  # Shareable result page
  gallery/page.tsx      # Public gallery (SEO)
  api/generate/route.ts # AI generation endpoint
  api/products/route.ts # Product listing endpoint
components/             # React components
lib/                    # Core logic (AI, DB, products)
data/products.json      # 60 curated products
```
