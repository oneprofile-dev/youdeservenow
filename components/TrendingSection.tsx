import Link from "next/link";
import { getLeaderboard } from "@/lib/leaderboards";

interface TrendingResult {
  id: string;
  likes: number;
  shares: number;
  affiliateClicks: number;
  qualityScore: number;
  result?: {
    category: string;
    persona: string;
    title?: string;
    input?: string;
    product?: { category?: string };
  };
}

export async function TrendingSection() {
  try {
    const trendingData = await getLeaderboard("quality", "all", 3);

    if (!trendingData || trendingData.length === 0) {
      return null;
    }

    return (
      <section className="max-w-5xl mx-auto px-4 sm:px-6 mt-20 mb-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs uppercase tracking-widest text-[var(--color-accent)] font-semibold mb-1">
              Community Favorites
            </p>
            <h2
              className="text-2xl text-[var(--color-text-primary)] dark:text-[var(--color-dark-text)]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              What&apos;s trending now
            </h2>
          </div>
          <Link
            href="/leaderboards"
            className="text-sm text-[var(--color-accent)] hover:underline underline-offset-4 font-medium"
          >
            See leaderboards →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {trendingData.slice(0, 3).map((result, idx) => (
            <Link
              key={result.id}
              href={`/result/${result.id}`}
              className="group relative overflow-hidden rounded-lg border border-[var(--color-card-border)] dark:border-[var(--color-dark-border)] hover:border-[var(--color-accent)] hover:shadow-lg transition-all duration-200 bg-[var(--color-card-bg)] dark:bg-[var(--color-dark-surface)]"
            >
              <div className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">
                    {idx === 0 ? "🥇" : idx === 1 ? "🥈" : "🥉"}
                  </span>
                  <span className="text-xs font-bold text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text)] uppercase">
                    #{idx + 1} Trending
                  </span>
                </div>

                <span className="inline-block px-2 py-1 bg-[var(--color-bg-secondary)] dark:bg-[var(--color-dark-bg)] text-[var(--color-accent)] text-xs font-medium rounded mb-2 border border-[var(--color-card-border)] dark:border-[var(--color-dark-border)]">
                  {(result as TrendingResult).result?.product?.category || "Gift"}
                </span>

                <h3 className="font-bold text-[var(--color-text-primary)] dark:text-[var(--color-dark-text)] mb-3 line-clamp-2 group-hover:text-[var(--color-accent)] transition-colors">
                  {(result as TrendingResult).result?.input || `Result #${result.id.slice(0, 8)}`}
                </h3>

                <div className="space-y-2 text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text)]">
                  <div className="flex items-center justify-between">
                    <span>❤️ {result.likes} likes</span>
                    <span>🔄 {result.shares} shares</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>⭐ Quality: {result.qualityScore}</span>
                    <span>🛍️ {result.affiliateClicks} clicks</span>
                  </div>
                </div>
              </div>

              <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-accent)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </Link>
          ))}
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/leaderboards"
            className="inline-block px-6 py-3 bg-[var(--color-cta-bg)] dark:bg-[var(--color-accent)] text-[var(--color-cta-text)] dark:text-[var(--color-dark-bg)] font-semibold rounded-lg hover:opacity-90 transition-opacity"
          >
            Explore Full Leaderboards
          </Link>
        </div>
      </section>
    );
  } catch {
    return null;
  }
}
