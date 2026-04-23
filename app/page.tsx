import { Suspense } from "react";
import dynamic from "next/dynamic";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Footer from "@/components/Footer";
import DailyRitual from "@/components/DailyRitual";
import DaypartPartnerStrip from "@/components/DaypartPartnerStrip";
import PrescriptionCollections from "@/components/PrescriptionCollections";
import { TrendingSection } from "@/components/TrendingSection";
import { getRecentResults, getResult } from "@/lib/db";
import type { Result } from "@/lib/db";
import Link from "next/link";
import PageViewTracker from "@/components/PageViewTracker";
import HomeFaqJsonLd from "@/components/HomeFaqJsonLd";
import type { HeroAudience } from "@/lib/hero-audience-copy";

// Lazy load Gallery - heavy component with many images
const Gallery = dynamic(() => import("@/components/Gallery"), {
  loading: () => <div className="h-96 bg-[var(--color-card-bg)] dark:bg-[var(--color-dark-border)] rounded-lg animate-pulse" />,
  ssr: true,
});

interface HomeProps {
  searchParams: Promise<{ ref?: string; audience?: string }>;
}

export default async function Home({ searchParams }: HomeProps) {
  const { ref, audience: audienceParam } = await searchParams;

  let initialAudience: HeroAudience | undefined;
  if (audienceParam === "loved_one" || audienceParam === "we") {
    initialAudience = audienceParam;
  }
  const { results } = await getRecentResults(0, 4);

  // Fetch the referral result (best-effort — never blocks render on failure)
  let referralResult: Result | undefined;
  if (ref && /^[a-z0-9]{6}$/.test(ref)) {
    try {
      const found = await getResult(ref);
      if (found) {
        referralResult = found;

        // Track the referral click in KV (best-effort)
        if (process.env.KV_REST_API_URL) {
          import("@vercel/kv")
            .then(({ kv }) => kv.incr(`ref:clicks:${ref}`))
            .catch(() => {});
        }
      }
    } catch {
      // Never block the homepage for a bad ref param
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-bg-primary)] dark:bg-[var(--color-dark-bg)]">
      <Header />

      <main className="flex-1">
        {ref && referralResult && (
          <PageViewTracker event="referral_landed" props={{ ref_id: ref, category: referralResult.product.category }} />
        )}
        <HomeFaqJsonLd />
        <Hero referralResult={referralResult} initialAudience={initialAudience} />

        <DailyRitual highlightProduct={results[0]?.product?.name} />

        <DaypartPartnerStrip />

        {/* Video — "See the science in action" */}
        <section className="max-w-3xl mx-auto px-4 sm:px-6 mt-16 mb-4">
          <div className="text-center mb-5">
            <p className="text-xs uppercase tracking-widest text-[var(--color-accent)] font-semibold mb-2">
              The Institute in Action
            </p>
            <h2
              className="text-2xl text-[var(--color-text-primary)] dark:text-[var(--color-dark-text)]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              See the science work
            </h2>
          </div>
          <div className="relative w-full rounded-2xl overflow-hidden border border-[var(--color-card-border)] dark:border-[var(--color-dark-border)] shadow-lg" style={{ paddingBottom: "56.25%" }}>
            <iframe
              src="https://www.youtube-nocookie.com/embed/hpI76kEKE5I?rel=0&modestbranding=1"
              title="YouDeserveNow — The Institute in Action"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            />
          </div>
        </section>

        <PrescriptionCollections />

        {/* Trending section */}
        <Suspense fallback={null}>
          <TrendingSection />
        </Suspense>

        {/* Gallery preview */}
        {results.length > 0 && (
          <section className="max-w-5xl mx-auto px-4 sm:px-6 mt-20 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-xs uppercase tracking-widest text-[var(--color-accent)] font-semibold mb-1">
                  Recent Diagnoses
                </p>
                <h2
                  className="text-2xl text-[var(--color-text-primary)] dark:text-[var(--color-dark-text)]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  What others deserved
                </h2>
              </div>
              <Link
                href="/gallery"
                className="text-sm text-[var(--color-accent)] hover:underline underline-offset-4 font-medium"
              >
                See all →
              </Link>
            </div>
            <Gallery results={results} compact />
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
