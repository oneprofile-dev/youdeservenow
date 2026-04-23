"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import useSWR from "swr";
import { track } from "@vercel/analytics/react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import UpvoteButton from "@/components/UpvoteButton";
import GaslightButton from "@/components/GaslightButton";
import PageViewTracker from "@/components/PageViewTracker";
import type { Result } from "@/lib/db";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface VerdictPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function VerdictPage({ params }: VerdictPageProps) {
  const [urlId, setUrlId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Unwrap the Promise to get the ID
    Promise.resolve(params).then((resolvedParams) => {
      setUrlId(resolvedParams.id);
    });
  }, [params]);

  const resultId = urlId;

  // Fetch the specific result
  const { data, error, isLoading } = useSWR(
    resultId ? `/api/verdict?id=${resultId}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  );

  const result: Result | null = data?.result || null;
  const legit = data?.legit || 0;
  const gaslight = data?.gaslight || 0;
  const total = legit + gaslight;
  const legitimacy = total > 0 ? Math.round((legit / total) * 100) : 50;

  useEffect(() => {
    if (result) {
      track("verdict_page_viewed", {
        resultId,
        justification: result.justification?.substring(0, 50),
      });
    }
  }, [result, resultId]);

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  if (isLoading || !resultId) {
    return (
      <div className="min-h-screen flex flex-col bg-[var(--color-bg-primary)] dark:bg-[var(--color-dark-bg)]">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin">
            <div className="w-12 h-12 border-4 border-[var(--color-bg-secondary)] dark:border-[var(--color-dark-border)] border-t-[var(--color-accent)] rounded-full" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="min-h-screen flex flex-col bg-[var(--color-bg-primary)] dark:bg-[var(--color-dark-bg)]">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center px-4">
          <div className="text-center">
            <p className="text-5xl mb-4">🤔</p>
            <h1 className="text-2xl font-bold text-[var(--color-text-primary)] dark:text-[var(--color-dark-text)] mb-2">
              Verdict Not Found
            </h1>
            <p className="text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text)] mb-6">
              This justification might have been deleted or never existed.
            </p>
            <Link
              href="/wall-of-fame"
              className="inline-flex px-6 py-3 rounded-xl bg-[var(--color-accent)] text-white font-semibold hover:opacity-90 transition-all"
            >
              Back to Wall of Fame
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-bg-primary)] dark:bg-[var(--color-dark-bg)]">
      <Header />
      <PageViewTracker event="verdict_viewed" />

      <main className="flex-1">
        {/* Header */}
        <div className="border-b border-[var(--color-card-border)] dark:border-[var(--color-dark-border)]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
            <Link
              href="/wall-of-fame"
              className="text-sm font-medium text-[var(--color-accent)] hover:opacity-80 transition-opacity"
            >
              ← Back to Wall of Fame
            </Link>
            <button
              onClick={handleCopyLink}
              className="text-xs font-semibold px-3 py-2 rounded-lg bg-[var(--color-bg-secondary)] dark:bg-[var(--color-dark-surface)] text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text)] hover:bg-[var(--color-card-border)] transition-colors"
              title="Copy link to verdict"
            >
              {copied ? "✓ Copied" : "📋 Copy Link"}
            </button>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
          {/* The Verdict Card */}
          <div className="rounded-3xl border border-[var(--color-card-border)] dark:border-[var(--color-dark-border)] bg-[var(--color-card-bg)] dark:bg-[var(--color-dark-surface)] overflow-hidden shadow-lg">
            {/* Product showcase */}
            {result.product && (
              <div className="bg-gradient-to-b from-[var(--color-accent)]/10 to-transparent dark:from-[var(--color-accent)]/5 p-6 border-b border-[var(--color-card-border)] dark:border-[var(--color-dark-border)]">
                <div className="flex items-center gap-4">
                  <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-white shadow-md flex-shrink-0">
                    <Image
                      src={result.product.imageUrl}
                      alt={result.product.name}
                      fill
                      className="object-cover"
                      sizes="96px"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-[var(--color-accent)] uppercase tracking-widest mb-2">
                      {result.product.category}
                    </p>
                    <h2 className="text-2xl font-bold text-[var(--color-text-primary)] dark:text-[var(--color-dark-text)] line-clamp-2 mb-2">
                      {result.product.name}
                    </h2>
                    <a
                      href={result.product.affiliateUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-[var(--color-accent)] hover:underline"
                    >
                      View Product →
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* The justification (centered) */}
            <div className="p-8 sm:p-16 bg-[var(--color-bg-secondary)] dark:bg-[var(--color-dark-bg)]/50">
              <p className="text-center text-xs uppercase tracking-widest text-[var(--color-text-tertiary)] dark:text-[var(--color-dark-text)] mb-6 font-semibold">
                They claimed to deserve this for:
              </p>
              <p className="text-center text-lg text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text)] mb-8 font-semibold italic">
                "{result.input}"
              </p>

              <blockquote
                className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-relaxed text-[var(--color-text-primary)] dark:text-[var(--color-dark-text)] text-center italic"
                style={{ fontFamily: "var(--font-display)" }}
              >
                "{result.justification}"
              </blockquote>
            </div>

            {/* The Verdict */}
            <div className="p-8 border-t border-[var(--color-card-border)] dark:border-[var(--color-dark-border)]">
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs uppercase tracking-widest font-semibold text-[var(--color-text-tertiary)] dark:text-[var(--color-dark-text)]">
                    Community Verdict
                  </p>
                  <p className="text-3xl font-bold text-[var(--color-accent)]">{legitimacy}%</p>
                </div>

                {/* Verdict bar */}
                <div className="h-4 rounded-full bg-[var(--color-bg-secondary)] dark:bg-[var(--color-dark-surface)] overflow-hidden mb-6">
                  <div
                    className="h-full bg-gradient-to-r from-rose-500 via-rose-500 to-rose-600 transition-all duration-500 ease-out"
                    style={{ width: `${legitimacy}%` }}
                  />
                </div>

                {/* Vote interpretation */}
                <div className="text-center">
                  {legitimacy >= 70 ? (
                    <p className="text-sm font-semibold text-rose-600 dark:text-rose-400">
                      ✓ The community says: <span className="text-base">LEGIT</span>
                    </p>
                  ) : legitimacy <= 30 ? (
                    <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">
                      ✗ The community says: <span className="text-base">CHALLENGED</span>
                    </p>
                  ) : (
                    <p className="text-sm font-semibold text-yellow-600 dark:text-yellow-400">
                      ⚖️ The community says: <span className="text-base">DEBATABLE</span>
                    </p>
                  )}
                </div>

                {/* Vote counts */}
                <div className="flex justify-between mt-6 text-sm gap-4">
                  <div className="flex-1 text-center p-4 rounded-lg bg-[var(--color-bg-secondary)] dark:bg-[var(--color-dark-surface)]/50">
                    <p className="font-bold text-rose-600 dark:text-rose-400 text-2xl">{legit}</p>
                    <p className="text-xs text-[var(--color-text-tertiary)] dark:text-[var(--color-dark-text)] uppercase tracking-widest mt-1">
                      Legit Votes
                    </p>
                  </div>
                  <div className="flex-1 text-center p-4 rounded-lg bg-[var(--color-bg-secondary)] dark:bg-[var(--color-dark-surface)]/50">
                    <p className="font-bold text-amber-600 dark:text-amber-400 text-2xl">{gaslight}</p>
                    <p className="text-xs text-[var(--color-text-tertiary)] dark:text-[var(--color-dark-text)] uppercase tracking-widest mt-1">
                      Challenges
                    </p>
                  </div>
                </div>
              </div>

              {/* Voting buttons */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div onClick={(e) => e.preventDefault()}>
                  <UpvoteButton resultId={resultId} initialLikes={legit} />
                </div>
                <div onClick={(e) => e.preventDefault()}>
                  <GaslightButton resultId={resultId} initialGaslights={gaslight} />
                </div>
              </div>

              {/* Social proof */}
              <div className="text-center text-xs text-[var(--color-text-tertiary)] dark:text-[var(--color-dark-text)] pb-4">
                {total} {total === 1 ? "person" : "people"} from the community voted
              </div>
            </div>
          </div>

          {/* Share section */}
          <div className="mt-12 p-6 rounded-xl bg-[var(--color-bg-secondary)] dark:bg-[var(--color-dark-surface)] border border-[var(--color-card-border)] dark:border-[var(--color-dark-border)]">
            <p className="text-sm font-semibold text-[var(--color-text-primary)] dark:text-[var(--color-dark-text)] mb-4">
              💬 Share this verdict:
            </p>
            <div className="space-y-3">
              {/* Pre-filled share options */}
              <div className="flex flex-wrap gap-2">
                <a
                  href={`https://twitter.com/intent/tweet?text=Someone actually convinced the AI that "${result.justification}" 🤣 The community voted it ${legitimacy}% legit. Think they're right? ${shareUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-lg bg-blue-500 text-white text-xs font-semibold hover:bg-blue-600 transition-colors"
                >
                  Share on Twitter/X
                </a>
                <button
                  onClick={() => {
                    const text = `Someone actually convinced the AI that "${result.justification}" 🤣 The community voted it ${legitimacy}% legit.`;
                    navigator.share?.({ title: "YouDeserveNow Verdict", text, url: shareUrl });
                  }}
                  className="px-4 py-2 rounded-lg bg-[var(--color-accent)] text-white text-xs font-semibold hover:opacity-90 transition-opacity"
                >
                  Share via...
                </button>
              </div>
            </div>
          </div>

          {/* CTA to create own */}
          <div className="mt-12 text-center">
            <p className="text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text)] mb-4">
              Think you can create a more legendary diagnosis?
            </p>
            <a
              href="/#institute-diagnosis"
              className="inline-flex px-8 py-3 rounded-xl bg-[var(--color-cta-bg)] dark:bg-[var(--color-accent)] text-[var(--color-cta-text)] dark:text-[var(--color-dark-bg)] font-semibold hover:opacity-90 active:scale-95 transition-all"
            >
              Create Your Own Diagnosis
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
