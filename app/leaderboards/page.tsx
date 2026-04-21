import { Suspense } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { LeaderboardContent } from "@/components/LeaderboardContent";
import { LeaderboardSkeleton } from "@/components/LeaderboardSkeleton";

export const metadata = {
  title: "Leaderboards | You Deserve Now",
  description: "See the most loved, shared, and recommended gifts.",
};

export default function LeaderboardsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-bg-primary)] dark:bg-[var(--color-dark-bg)]">
      <Header />
      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <h1
                  className="text-4xl sm:text-5xl font-bold text-[var(--color-text-primary)] dark:text-[var(--color-dark-text)] mb-2"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Leaderboards
                </h1>
                <p className="text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text)]">
                  Discover the most loved gifts and inspire others
                </p>
              </div>
            </div>

            {/* Info cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-8">
              <div className="bg-[var(--color-card-bg)] dark:bg-[var(--color-dark-surface)] rounded-lg p-3 sm:p-4 border border-[var(--color-card-border)] dark:border-[var(--color-dark-border)]">
                <div className="text-2xl sm:text-3xl mb-1">💝</div>
                <div className="text-xs sm:text-sm font-medium text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text)]">
                  Most Loved
                </div>
              </div>
              <div className="bg-[var(--color-card-bg)] dark:bg-[var(--color-dark-surface)] rounded-lg p-3 sm:p-4 border border-[var(--color-card-border)] dark:border-[var(--color-dark-border)]">
                <div className="text-2xl sm:text-3xl mb-1">🔄</div>
                <div className="text-xs sm:text-sm font-medium text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text)]">
                  Most Shared
                </div>
              </div>
              <div className="bg-[var(--color-card-bg)] dark:bg-[var(--color-dark-surface)] rounded-lg p-3 sm:p-4 border border-[var(--color-card-border)] dark:border-[var(--color-dark-border)]">
                <div className="text-2xl sm:text-3xl mb-1">⭐</div>
                <div className="text-xs sm:text-sm font-medium text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text)]">
                  Top Quality
                </div>
              </div>
            </div>
          </div>

          {/* Leaderboard content with suspense fallback */}
          <Suspense fallback={<LeaderboardSkeleton />}>
            <LeaderboardContent />
          </Suspense>
        </div>
      </main>
      <Footer />
    </div>
  );
}
