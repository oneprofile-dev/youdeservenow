export function LeaderboardSkeleton() {
  return (
    <div className="space-y-4">
      {/* Filters skeleton */}
      <div className="space-y-3">
        <div className="flex gap-2">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-10 w-24 bg-gray-200 rounded-lg animate-pulse"
            />
          ))}
        </div>
        <div className="flex gap-3">
          <div className="h-10 w-40 bg-gray-200 rounded-lg animate-pulse" />
          <div className="h-10 w-32 bg-gray-200 rounded-lg animate-pulse" />
        </div>
      </div>

      {/* Cards skeleton */}
      <div className="space-y-3 pt-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-lg p-6">
            {/* Rank badge */}
            <div className="w-8 h-8 bg-gray-200 rounded-full mb-4 animate-pulse" />

            {/* Category */}
            <div className="mb-3 h-6 w-24 bg-gray-200 rounded-full animate-pulse" />

            {/* Title */}
            <div className="space-y-2 mb-4">
              <div className="h-6 bg-gray-200 rounded animate-pulse" />
              <div className="h-6 w-3/4 bg-gray-200 rounded animate-pulse" />
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[...Array(3)].map((_, j) => (
                <div key={j} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>

            {/* Quality score bar */}
            <div className="space-y-2">
              <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
              <div className="h-2 bg-gray-200 rounded-full animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
