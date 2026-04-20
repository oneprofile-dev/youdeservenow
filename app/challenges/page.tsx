import { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ChallengesContent } from "@/components/ChallengesContent";

export const metadata: Metadata = {
  title: "Challenges | You Deserve Now | YouDeserveNow",
  description: "Complete weekly challenges to unlock exclusive rewards and badges",
  openGraph: {
    title: "Challenges | You Deserve Now",
    description: "Complete weekly challenges to unlock exclusive rewards and badges",
    type: "website",
  },
};

export default function ChallengesPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen flex flex-col">
        {/* Hero section */}
        <section className="px-4 py-12 sm:py-16 bg-gradient-to-br from-[var(--color-accent)]/5 via-transparent to-transparent">
          <div className="max-w-4xl mx-auto text-center">
            <h1
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[var(--color-text-primary)] dark:text-[var(--color-dark-text)] mb-4"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Weekly Challenges
            </h1>
            <p className="text-lg text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text)] max-w-2xl mx-auto">
              Earn rewards by completing challenges. The more you accomplish, the more you deserve! 🎯
            </p>
          </div>
        </section>

        {/* Challenges content */}
        <section className="px-4 py-12 flex-1">
          <div className="max-w-4xl mx-auto">
            <ChallengesContent />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
