import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Gallery from "@/components/Gallery";
import { getRecentResults } from "@/lib/db";

const PER_PAGE = 12;

export const metadata: Metadata = {
  title: "Gallery — Scientific Justifications for Self-Reward",
  description:
    "Browse hundreds of peer-reviewed (fictional) justifications for treating yourself. Find your reason to reward yourself today.",
  keywords: [
    "treat yourself",
    "you deserve it",
    "self reward ideas",
    "reward yourself after hard work",
    "science says treat yourself",
  ],
};

interface Props {
  searchParams: Promise<{ page?: string }>;
}

export default async function GalleryPage({ searchParams }: Props) {
  const { page: pageStr } = await searchParams;
  const page = Math.max(0, parseInt(pageStr ?? "0", 10) || 0);

  const { results, total } = await getRecentResults(page, PER_PAGE);
  const totalPages = Math.ceil(total / PER_PAGE);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-bg-primary)] dark:bg-[var(--color-dark-bg)]">
      <Header />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-12">
        {/* Header */}
        <div className="mb-10">
          <p className="text-xs uppercase tracking-widest text-[var(--color-accent)] font-semibold mb-3">
            Public Gallery
          </p>
          <h1
            className="text-3xl sm:text-4xl text-[var(--color-text-primary)] dark:text-[var(--color-dark-text)] mb-4"
            style={{ fontFamily: "var(--font-display)" }}
          >
            What people deserved
          </h1>
          <p className="text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text)] max-w-xl">
            {total > 0
              ? `${total.toLocaleString()} scientific verdicts rendered. Browse below, or`
              : "No verdicts yet."}{" "}
            <Link href="/" className="text-[var(--color-accent)] hover:underline underline-offset-4">
              get your own →
            </Link>
          </p>
        </div>

        <Gallery results={results} />

        {/* Pagination */}
        {totalPages > 1 && (
          <nav className="mt-10 flex items-center justify-center gap-2" aria-label="Pagination">
            {page > 0 && (
              <Link
                href={`/gallery?page=${page - 1}`}
                className="px-4 py-2 rounded-lg border border-[var(--color-card-border)] dark:border-[var(--color-dark-border)] text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-all"
              >
                ← Previous
              </Link>
            )}
            <span className="text-sm text-[var(--color-text-tertiary)] dark:text-[var(--color-dark-text)] px-4">
              Page {page + 1} of {totalPages}
            </span>
            {page < totalPages - 1 && (
              <Link
                href={`/gallery?page=${page + 1}`}
                className="px-4 py-2 rounded-lg border border-[var(--color-card-border)] dark:border-[var(--color-dark-border)] text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-all"
              >
                Next →
              </Link>
            )}
          </nav>
        )}
      </main>

      <Footer />
    </div>
  );
}
