import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GalleryClient from "@/components/GalleryClient";
import { getRecentResults } from "@/lib/db";

export const metadata: Metadata = {
  title: "Gallery — Scientific Justifications for Self-Reward",
  description:
    "Browse hundreds of peer-reviewed (fictional) justifications for treating yourself. Filter by category — comfort, tech, fitness, and more.",
  keywords: [
    "treat yourself",
    "you deserve it",
    "self reward ideas",
    "reward yourself after hard work",
    "science says treat yourself",
  ],
};

export default async function GalleryPage() {
  // Fetch enough results for client-side category filtering to feel rich
  const { results, total } = await getRecentResults(0, 48);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-bg-primary)] dark:bg-[var(--color-dark-bg)]">
      <Header />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-12">
        {/* Page header */}
        <div className="mb-12 text-center">
          <h1
            className="text-3xl sm:text-4xl text-[var(--color-text-primary)] dark:text-[var(--color-dark-text)] mb-4"
            style={{ fontFamily: "var(--font-display)" }}
          >
            What people deserved
          </h1>
          <p className="text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text)]">
            Browse community verdicts by category. Each one peer-reviewed by our
            absolutely fictional institute.
          </p>
        </div>

        <GalleryClient results={results} total={total} />
      </main>

      <Footer />
    </div>
  );
}
