import Link from "next/link";
import Image from "next/image";
import type { Result } from "@/lib/db";
import { truncate, formatDate } from "@/lib/utils";

interface GalleryProps {
  results: Result[];
  compact?: boolean;
}

export default function Gallery({ results, compact = false }: GalleryProps) {
  if (results.length === 0) {
    return (
      <div className="text-center py-12 text-[var(--color-text-tertiary)] dark:text-[var(--color-dark-text)]">
        <p className="text-lg" style={{ fontFamily: "var(--font-display)" }}>
          No results yet.
        </p>
        <p className="text-sm mt-2">Be the first to get your scientific justification.</p>
      </div>
    );
  }

  return (
    <div className={`grid gap-4 ${compact ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"}`}>
      {results.map((result) => (
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
  );
}
