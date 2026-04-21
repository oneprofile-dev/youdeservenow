"use client";

import { useState } from "react";

type SortType = "likes" | "shares" | "affiliate_clicks" | "quality";

interface LeaderboardFiltersProps {
  sort: SortType;
  onSortChange: (sort: SortType) => void;
  category: string;
  onCategoryChange: (category: string) => void;
  limit: number;
  onLimitChange: (limit: number) => void;
}

const categories = [
  { value: "all", label: "All Categories", icon: "🎁" },
  { value: "comfort", label: "Comfort", icon: "🌙" },
  { value: "tech", label: "Tech", icon: "💻" },
  { value: "gag", label: "Gag Gifts", icon: "😂" },
  { value: "experiences", label: "Experiences", icon: "🎭" },
  { value: "self-care", label: "Self Care", icon: "✨" },
];

const sortOptions: Array<{
  value: SortType;
  label: string;
  icon: string;
  description: string;
}> = [
  {
    value: "likes",
    label: "Most Loved",
    icon: "❤️",
    description: "Highest number of likes",
  },
  {
    value: "shares",
    label: "Most Shared",
    icon: "🔄",
    description: "Highest number of shares",
  },
  {
    value: "affiliate_clicks",
    label: "Most Purchased",
    icon: "🛍️",
    description: "Most affiliate clicks",
  },
  {
    value: "quality",
    label: "Top Quality",
    icon: "⭐",
    description: "Weighted quality score",
  },
];

export function LeaderboardFilters({
  sort,
  onSortChange,
  category,
  onCategoryChange,
  limit,
  onLimitChange,
}: LeaderboardFiltersProps) {
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);

  const currentCategory = categories.find((c) => c.value === category);
  const currentSort = sortOptions.find((s) => s.value === sort);

  return (
    <div className="space-y-4">
      {/* Sort buttons - horizontal scroll on mobile */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-2">
        <div className="text-sm font-semibold text-[var(--color-text-primary)] dark:text-[var(--color-dark-text)] flex items-center">
          Sort by:
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
          {sortOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => onSortChange(option.value)}
              aria-label={`Sort by ${option.label}`}
              className={`flex-shrink-0 px-3 sm:px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 whitespace-nowrap min-h-11 ${
                sort === option.value
                  ? "bg-[var(--color-accent)] text-white shadow-md"
                  : "bg-[var(--color-card-bg)] dark:bg-[var(--color-dark-surface)] border border-[var(--color-card-border)] dark:border-[var(--color-dark-border)] text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
              }`}
              title={option.description}
            >
              <span className="mr-1">{option.icon}</span>
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Category and limit filters */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        {/* Category dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowCategoryMenu(!showCategoryMenu)}
            aria-expanded={showCategoryMenu}
            aria-label="Filter by category"
            className="w-full sm:w-auto px-4 py-2.5 min-h-11 bg-[var(--color-card-bg)] dark:bg-[var(--color-dark-surface)] border border-[var(--color-card-border)] dark:border-[var(--color-dark-border)] rounded-lg font-medium text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text)] hover:border-[var(--color-accent)] transition-colors flex items-center justify-between gap-2"
          >
            <span>
              {currentCategory?.icon} {currentCategory?.label}
            </span>
            <svg
              className={`w-4 h-4 transition-transform flex-shrink-0 ${
                showCategoryMenu ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </button>

          {/* Category menu */}
          {showCategoryMenu && (
            <div className="absolute top-full left-0 mt-1 w-full sm:w-48 bg-[var(--color-card-bg)] dark:bg-[var(--color-dark-surface)] border border-[var(--color-card-border)] dark:border-[var(--color-dark-border)] rounded-lg shadow-lg z-10">
              <div className="py-1">
                {categories.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => {
                      onCategoryChange(cat.value);
                      setShowCategoryMenu(false);
                    }}
                    className={`w-full px-4 py-3 text-left text-sm transition-colors min-h-11 ${
                      category === cat.value
                        ? "bg-[var(--color-accent)]/10 text-[var(--color-accent)] font-medium"
                        : "text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text)] hover:bg-[var(--color-bg-secondary)] dark:hover:bg-[var(--color-dark-border)]"
                    }`}
                  >
                    <span className="mr-2">{cat.icon}</span>
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Results per page */}
        <select
          value={limit}
          onChange={(e) => onLimitChange(Number(e.target.value))}
          aria-label="Results per page"
          className="px-4 py-2.5 min-h-11 bg-[var(--color-card-bg)] dark:bg-[var(--color-dark-surface)] border border-[var(--color-card-border)] dark:border-[var(--color-dark-border)] rounded-lg font-medium text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text)] hover:border-[var(--color-accent)] transition-colors cursor-pointer"
        >
          <option value={10}>Show 10</option>
          <option value={25}>Show 25</option>
          <option value={50}>Show 50</option>
          <option value={100}>Show 100</option>
        </select>
      </div>

      {/* Info bar */}
      <div className="flex items-start gap-2 text-xs text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text)] bg-[var(--color-bg-secondary)] dark:bg-[var(--color-dark-surface)] rounded-lg p-4 border border-[var(--color-card-border)] dark:border-[var(--color-dark-border)]">
        <svg
          className="w-4 h-4 flex-shrink-0 mt-0.5"
          fill="currentColor"
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
            clipRule="evenodd"
          />
        </svg>
        <span>
          Rankings update in real-time. Quality score is weighted by likes (0.5x),
          shares (1x), and purchases (2x).
        </span>
      </div>
    </div>
  );
}
