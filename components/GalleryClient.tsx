"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Result } from "@/lib/db";
import { truncate, formatDate } from "@/lib/utils";

const CATEGORIES = [
  "all",
  "comfort",
  "tech",
  "fitness",
  "kitchen",
  "selfcare",
  "snacks",
  "home",
  "trending",
];

interface GalleryClientProps {
  results: Result[];
  total: number;
}

export default function GalleryClient({ results, total }: GalleryClientProps) {
  const [activeCategory, setActiveCategory] = useState("all");

  const filtered = useMemo(
    () =>
      activeCategory === "all"
        ? results
        : results.filter((r) => r.product.category === activeCategory),
    [results, activeCategory]
  );

  return (
    <div>
      {/* Verdict counter — social proof */}
      <div className="text-center mb-10">
        <p className="text-xs uppercase tracking-widest text-[var(--color-accent)] font-semibold mb-2">
          Institute Research Database
        </p>
        <div
          className="text-5xl sm:text-6xl text-[var(--color-text-primary)] dark:text-[var(--color-dark-text)] mb-2"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {total.toLocaleString()}
        </div>
        <p className="text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text)]">
          scientific verdicts issued to date
        </p>
      </div>

      {/* Category filter tabs */}
      <div className="flex flex-wrap gap-2 mb-8 justify-center">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-sm capitalize border transition-all ${
              activeCategory === cat
                ? "bg-[var(--color-accent)] text-white border-[var(--color-accent)]"
                : "border-[var(--color-card-border)] dark:border-[var(--color-dark-border)] text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Result count for active filter */}
      {activeCategory !== "all" && (
        <p className="text-center text-sm text-[var(--color-text-tertiary)] dark:text-[var(--color-dark-text)] mb-6">
          {filtered.length} verdict{filtered.length !== 1 ? "s" : ""} in{" "}
          <span className="text-[var(--color-accent)] font-medium capitalize">
            {activeCategory}
          </span>
        </p>
      )}

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((result) => (
            <Link
              key={result.id}
              href={`/result/${result.id}`}
              className="group block bg-[var(--color-card-bg)] dark:bg-[var(--color-dark-surface)] border border-[var(--color-card-border)] dark:border-[var(--color-dark-border)] rounded-xl p-4 hover:border-[var(--color-accent)] hover:shadow-md transition-all duration-200"
            >
              {/* Product thumbnail */}
              <div className="flex items-center gap-3 mb-3">
                <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-[var(--color-bg-secondary)] flex-shrink-0">
                  <Image
                    src={result.product.imageUrl}
                    alt={result.product.name}
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-[var(--color-accent)] font-medium uppercase tracking-wider">
                    {result.product.category}
                  </p>
                  <p className="text-sm font-semibold text-[var(--color-text-primary)] dark:text-[var(--color-dark-text)] truncate">
                    {result.product.name}
                  </p>
                </div>
              </div>

              {/* Input */}
              <p className="text-xs italic text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text)] mb-2 line-clamp-1">
                &ldquo;{result.input}&rdquo;
              </p>

              {/* Justification snippet */}
              <p
                className="text-sm text-[var(--color-text-primary)] dark:text-[var(--color-dark-text)] line-clamp-3 leading-relaxed"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {truncate(result.justification, 140)}
              </p>

              {/* Footer */}
              <div className="mt-3 pt-3 border-t border-[var(--color-card-border)] dark:border-[var(--color-dark-border)] flex items-center justify-between">
                <span className="text-xs text-[var(--color-text-tertiary)] dark:text-[var(--color-dark-text)]">
                  {formatDate(result.createdAt)}
                </span>
                <span className="text-xs text-[var(--color-accent)] group-hover:underline font-medium">
                  Read →
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-[var(--color-text-tertiary)] dark:text-[var(--color-dark-text)]">
          <p className="text-lg" style={{ fontFamily: "var(--font-display)" }}>
            No verdicts in this category yet.
          </p>
          <p className="text-sm mt-2">
            Be the first —{" "}
            <Link href="/" className="text-[var(--color-accent)] hover:underline">
              get your scientific justification
            </Link>
          </p>
        </div>
      )}
    </div>
  );
}
