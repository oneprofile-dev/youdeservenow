import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-bg-primary)] dark:bg-[var(--color-dark-bg)]">
      <Header />

      <main className="flex-1 flex flex-col items-center justify-center px-4 text-center py-20">
        <p className="text-xs uppercase tracking-widest text-[var(--color-accent)] font-semibold mb-4">
          Error 404
        </p>
        <h1
          className="text-4xl sm:text-5xl text-[var(--color-text-primary)] dark:text-[var(--color-dark-text)] mb-4"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Page Not Found
        </h1>
        <p className="text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text)] max-w-md mb-8">
          The Institute's records show no entry at this URL. Perhaps the peer review process rejected it.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--color-cta-bg)] dark:bg-[var(--color-accent)] text-[var(--color-cta-text)] dark:text-[var(--color-dark-bg)] font-semibold hover:opacity-90 active:scale-95 transition-all"
        >
          Return to the Institute →
        </Link>
      </main>

      <Footer />
    </div>
  );
}
