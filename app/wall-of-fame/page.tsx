import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AbsurdityFeed from "@/components/AbsurdityFeed";
import PageViewTracker from "@/components/PageViewTracker";

export const metadata: Metadata = {
  title: "Wall of Fame — YouDeserveNow",
  description:
    "The funniest, most questioned, and most debated diagnoses. Vote 'Legit' or challenge the absurdity. See what the community thinks you deserve.",
  openGraph: {
    title: "Wall of Fame — YouDeserveNow",
    description: "The internet's most absurd (and legitimate) reward justifications.",
  },
};

export default function WallOfFamePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-bg-primary)] dark:bg-[var(--color-dark-bg)]">
      <Header />
      <main className="flex-1">
        <PageViewTracker event="wall_of_fame_viewed" />
        
        {/* Hero */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16 pb-8">
          <div className="text-center mb-12">
            <div className="mb-4">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--color-bg-secondary)] dark:bg-[var(--color-dark-surface)] border border-[var(--color-card-border)] dark:border-[var(--color-dark-border)] text-xs font-semibold text-[var(--color-accent)] uppercase tracking-widest">
                🏆 Hall of Absurdity
              </span>
            </div>
            <h1
              className="text-5xl sm:text-6xl text-[var(--color-text-primary)] dark:text-[var(--color-dark-text)] leading-tight mb-4"
              style={{ fontFamily: "var(--font-display)" }}
            >
              The Wall of Fame
            </h1>
            <p className="text-lg text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text)] max-w-2xl mx-auto leading-relaxed mb-6">
              The internet&apos;s most legendary—and most questioned—reward justifications. Vote whether each diagnosis is <span className="font-semibold text-rose-600">genuinely legit</span> or <span className="font-semibold text-amber-600">absolutely ridiculous</span>.
            </p>
            <p className="text-sm text-[var(--color-text-tertiary)] dark:text-[var(--color-dark-text)] max-w-lg mx-auto">
              💡 <strong>Pro tip:</strong> Being the <span className="text-amber-600 font-semibold">Most Challenged</span> justification is arguably more prestigious than being the most legit one. Embrace the chaos.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-12">
            <div className="rounded-xl bg-[var(--color-bg-secondary)] dark:bg-[var(--color-dark-surface)] border border-[var(--color-card-border)] dark:border-[var(--color-dark-border)] p-4 text-center">
              <p className="text-2xl font-bold text-[var(--color-accent)] mb-1">1K+</p>
              <p className="text-xs text-[var(--color-text-tertiary)] dark:text-[var(--color-dark-text)] uppercase tracking-widest">
                Creative Minds
              </p>
              <p className="text-xs text-[var(--color-text-tertiary)] dark:text-[var(--color-dark-text)] mt-1 italic">
                aren't alone
              </p>
            </div>
            <div className="rounded-xl bg-[var(--color-bg-secondary)] dark:bg-[var(--color-dark-surface)] border border-[var(--color-card-border)] dark:border-[var(--color-dark-border)] p-4 text-center">
              <p className="text-2xl font-bold text-rose-600 mb-1">❤️</p>
              <p className="text-xs text-[var(--color-text-tertiary)] dark:text-[var(--color-dark-text)] uppercase tracking-widest">
                Vindications
              </p>
              <p className="text-xs text-[var(--color-text-tertiary)] dark:text-[var(--color-dark-text)] mt-1 italic">
                earned
              </p>
            </div>
            <div className="rounded-xl bg-[var(--color-bg-secondary)] dark:bg-[var(--color-dark-surface)] border border-[var(--color-card-border)] dark:border-[var(--color-dark-border)] p-4 text-center">
              <p className="text-2xl font-bold text-amber-600 mb-1">🔥</p>
              <p className="text-xs text-[var(--color-text-tertiary)] dark:text-[var(--color-dark-text)] uppercase tracking-widest">
                Chaos Points
              </p>
              <p className="text-xs text-[var(--color-text-tertiary)] dark:text-[var(--color-dark-text)] mt-1 italic">
                accumulated
              </p>
            </div>
          </div>
        </section>

        {/* Feed */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-16">
          <AbsurdityFeed limit={30} showFilters={true} />
        </section>

        {/* How It Works */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 mb-16">
          <div className="rounded-2xl bg-[var(--color-bg-secondary)] dark:bg-[var(--color-dark-surface)] border border-[var(--color-card-border)] dark:border-[var(--color-dark-border)] p-8">
            <h3 className="text-xl font-bold text-[var(--color-text-primary)] dark:text-[var(--color-dark-text)] mb-6" style={{ fontFamily: "var(--font-display)" }}>
              How the Verdict Works
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <div className="flex items-start gap-3 mb-3">
                  <span className="text-2xl flex-shrink-0">❤️</span>
                  <div>
                    <p className="font-semibold text-[var(--color-text-primary)] dark:text-[var(--color-dark-text)]">
                      Vote "Legit"
                    </p>
                    <p className="text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text)]">
                      When a justification makes genuine sense. Defend what you believe.
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <div className="flex items-start gap-3 mb-3">
                  <span className="text-2xl flex-shrink-0">🔥</span>
                  <div>
                    <p className="font-semibold text-[var(--color-text-primary)] dark:text-[var(--color-dark-text)]">
                      "Challenge" It
                    </p>
                    <p className="text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text)]">
                      When it's absurd but hilarious. Call out the creative nonsense.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-[var(--color-card-border)] dark:border-[var(--color-dark-border)]">
              <p className="text-xs text-[var(--color-text-tertiary)] dark:text-[var(--color-dark-text)]">
                💡 Each verdict becomes a debate. The community decides what you truly deserve.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-3xl mx-auto px-4 sm:px-6 pb-16">
          <div className="rounded-2xl border-2 border-[var(--color-accent)]/30 bg-[var(--color-accent)]/5 dark:bg-[var(--color-accent)]/10 p-8 text-center">
            <p className="text-3xl mb-4">✨</p>
            <h2
              className="text-2xl sm:text-3xl text-[var(--color-text-primary)] dark:text-[var(--color-dark-text)] mb-3"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Ready to add your own?
            </h2>
            <p className="text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text)] mb-6 max-w-lg mx-auto">
              Create a diagnosis that&apos;s so good (or so bad) that people can&apos;t resist voting on it.
            </p>
            <a
              href="/#institute-diagnosis"
              className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-[var(--color-cta-bg)] dark:bg-[var(--color-accent)] text-[var(--color-cta-text)] dark:text-[var(--color-dark-bg)] font-semibold text-sm hover:opacity-90 active:scale-95 transition-all"
            >
              Start your diagnosis
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
