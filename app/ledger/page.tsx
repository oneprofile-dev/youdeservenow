import type { Metadata } from "next";
import { Suspense } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import dynamic from "next/dynamic";

const LedgerContent = dynamic(() => import("@/components/LedgerContent"), {
  loading: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
      {Array(8)
        .fill(0)
        .map((_, i) => (
          <div
            key={i}
            className="h-64 bg-[var(--color-card-bg)] dark:bg-[var(--color-dark-surface)] rounded-2xl"
          />
        ))}
    </div>
  ),
  ssr: true,
});

export const metadata: Metadata = {
  title: "Public Ledger — Global Permission Stream",
  description:
    "See what 50,000+ people justified and deserved. Browse ridiculous, beautiful, and honest moments of self-celebration from around the world.",
  keywords: [
    "justifications",
    "deserve yourself",
    "self-reward community",
    "funny justifications",
    "public moments",
  ],
};

export default function LedgerPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-bg-primary)] dark:bg-[var(--color-dark-bg)]">
      <Header />

      <main className="flex-1 w-full px-4 sm:px-6 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="mb-12 text-center">
            <h1
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[var(--color-text-primary)] dark:text-[var(--color-dark-text)] mb-4"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Global Permission Ledger
            </h1>
            <p className="text-lg text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text)] max-w-2xl mx-auto leading-relaxed">
              50,000+ people have justified the unjustifiable. See what they deserved. Then deserve something yourself.
            </p>
          </div>

          {/* Ledger Grid */}
          <Suspense fallback={null}>
            <LedgerContent />
          </Suspense>
        </div>
      </main>

      <Footer />
    </div>
  );
}
