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
  };
}

export async function TrendingSection() {
  try {
    // Fetch top 3 by quality score (best overall quality)
    const trendingData = await getLeaderboard("quality", "all", 3);

    if (!trendingData || trendingData.length === 0) {
      return null; // No trending data yet, skip section
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
              What's trending now
            </h2>
          </div>
          <Link
            href="/leaderboards"
            className="text-sm text-[var(--color-accent)] hover:underline underline-offset-4 font-medium"
          >
            See leaderboards →
          </Link>
        </div>

        {/* Trending cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {trendingData.slice(0, 3).map((result, idx) => (
            <Link
              key={result.id}
              href={`/result/${result.id}`}
              className="group relative overflow-hidden rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-200 bg-white"
            >
              <div className="p-4">
                {/* Rank badge */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">
                    {idx === 0 ? "🥇" : idx === 1 ? "🥈" : "🥉"}
                  </span>
                  <span className="text-xs font-bold text-gray-500 uppercase">
                    #{idx + 1} Trending
                  </span>
                </div>

                {/* Category */}
                <span className="inline-block px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded mb-2 border border-blue-200">
                  {result.result?.product?.category || "Gift"}
                </span>

                {/* Title */}
                <h3 className="font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
                  {result.result?.input || `Gift #${result.id.slice(0, 8)}`}
                </h3>

                {/* Quick metrics */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between text-gray-600">
                    <span>❤️ {result.likes} likes</span>
                    <span>🔄 {result.shares} shares</span>
                  </div>
                  <div className="flex items-center justify-between text-gray-600">
                    <span>⭐ Quality: {result.qualityScore}</span>
                    <span>🛍️ {result.affiliateClicks} clicks</span>
                  </div>
                </div>
              </div>

              {/* Hover gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-blue-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-6 text-center">
          <Link
            href="/leaderboards"
            className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Explore Full Leaderboards
          </Link>
        </div>
      </section>
    );
  } catch {
    // Gracefully handle errors, don't show section
    return null;
  }
}
