import { Suspense } from "react";
import Link from "next/link";
import { LeaderboardContent } from "@/components/LeaderboardContent";
import { LeaderboardSkeleton } from "@/components/LeaderboardSkeleton";

export const metadata = {
  title: "Leaderboards | You Deserve Now",
  description: "See the most loved, shared, and recommended gifts.",
};

export default function LeaderboardsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                Leaderboards
              </h1>
              <p className="text-gray-600">
                Discover the most loved gifts and inspire others
              </p>
            </div>
            <Link
              href="/"
              className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
            >
              ← Back to home
            </Link>
          </div>

          {/* Info cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-8">
            <div className="bg-blue-50 rounded-lg p-3 sm:p-4 border border-blue-100">
              <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-1">
                💝
              </div>
              <div className="text-xs sm:text-sm font-medium text-gray-700">
                Most Loved
              </div>
            </div>
            <div className="bg-green-50 rounded-lg p-3 sm:p-4 border border-green-100">
              <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-1">
                🔄
              </div>
              <div className="text-xs sm:text-sm font-medium text-gray-700">
                Most Shared
              </div>
            </div>
            <div className="bg-purple-50 rounded-lg p-3 sm:p-4 border border-purple-100">
              <div className="text-2xl sm:text-3xl font-bold text-purple-600 mb-1">
                ⭐
              </div>
              <div className="text-xs sm:text-sm font-medium text-gray-700">
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
    </div>
  );
}
