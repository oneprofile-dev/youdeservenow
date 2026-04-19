import { Suspense } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Gallery from "@/components/Gallery";
import Footer from "@/components/Footer";
import { getRecentResults, getResult } from "@/lib/db";
import type { Result } from "@/lib/db";
import Link from "next/link";

interface HomeProps {
  searchParams: Promise<{ ref?: string }>;
}

export default async function Home({ searchParams }: HomeProps) {
  const { ref } = await searchParams;
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
        <Hero referralResult={referralResult} />

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
