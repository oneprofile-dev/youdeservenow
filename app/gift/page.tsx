import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GiftHero from "@/components/GiftHero";
import PageViewTracker from "@/components/PageViewTracker";

export const metadata: Metadata = {
  title: "Gift a Diagnosis — YouDeserveNow",
  description:
    "Tell us what your partner or friend accomplished. We'll generate a peer-reviewed scientific prescription for exactly what they deserve — shareable and undeniable.",
  openGraph: {
    title: "Gift a Diagnosis — YouDeserveNow",
    description: "Science says someone you love deserves something. Let us prove it.",
  },
};

export default function GiftPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-bg-primary)] dark:bg-[var(--color-dark-bg)]">
      <Header />
      <main className="flex-1">
        <PageViewTracker event="gift_link_opened" />
        <GiftHero />
      </main>
      <Footer />
    </div>
  );
}
