"use client";

import Link from "next/link";
import { track } from "@vercel/analytics/react";

interface DailyRitualProps {
  highlightProduct?: string;
}

export default function DailyRitual({ highlightProduct }: DailyRitualProps) {
  const handleStartClick = () => {
    track("daily_ritual_cta_clicked", { source: "hero_section" });
  };

  const handleGiftClick = () => {
    track("daily_ritual_gift_cta_clicked", { source: "hero_section" });
  };
  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 mt-14 mb-14 animate-[fade-in_0.5s_ease-out]">
      <div className="grid gap-6 lg:grid-cols-[1.35fr_0.9fr]">
        <div className="rounded-[2rem] bg-[var(--color-card-bg)] dark:bg-[var(--color-dark-surface)] border border-[var(--color-card-border)] dark:border-[var(--color-dark-border)] p-8 shadow-[0_24px_60px_rgba(0,0,0,0.05)]">
          <p className="text-xs uppercase tracking-[0.32em] text-[var(--color-accent)] font-semibold mb-4">
            Daily Reward Ritual
          </p>
          <h2 className="text-3xl sm:text-4xl text-[var(--color-text-primary)] dark:text-[var(--color-dark-text)] leading-tight mb-5" style={{ fontFamily: "var(--font-display)" }}>
            Make today the day you justify a treat.
          </h2>
          <p className="text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text)] max-w-2xl leading-relaxed">
            Tell us what you achieved, get a science-backed, shareable prescription, and leave with a real reward recommendation. The more you return, the stronger the ritual feels.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <div className="rounded-3xl bg-[var(--color-bg-secondary)] dark:bg-[var(--color-dark-bg)] border border-[var(--color-card-border)] dark:border-[var(--color-dark-border)] p-5">
              <p className="text-xs uppercase tracking-[0.2em] font-semibold text-[var(--color-text-tertiary)] mb-3">
                Keep coming back
              </p>
              <p className="text-sm text-[var(--color-text-primary)] dark:text-[var(--color-dark-text)] leading-relaxed">
                Every visit keeps your streak alive and makes your reward routine feel official.
              </p>
            </div>
            <div className="rounded-3xl bg-[var(--color-bg-secondary)] dark:bg-[var(--color-dark-bg)] border border-[var(--color-card-border)] dark:border-[var(--color-dark-border)] p-5">
              <p className="text-xs uppercase tracking-[0.2em] font-semibold text-[var(--color-text-tertiary)] mb-3">
                Reward with confidence
              </p>
              <p className="text-sm text-[var(--color-text-primary)] dark:text-[var(--color-dark-text)] leading-relaxed">
                Every result points to a treat you can actually buy, with affiliate support helping keep the site running.
              </p>
            </div>
          </div>

          {highlightProduct && (
            <div className="mt-8 rounded-3xl border border-[var(--color-accent)]/15 bg-[var(--color-accent)]/5 p-5 text-sm text-[var(--color-text-primary)] dark:text-[var(--color-dark-text)]">
              <p className="font-semibold">Trending prescription</p>
              <p className="mt-2 text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text)]">
                People are loving {highlightProduct}. Try it today and see what the science says you deserve.
              </p>
            </div>
          )}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <a
              href="#institute-diagnosis"
              onClick={handleStartClick}
              aria-label="Scroll to start your daily diagnosis"
              className="inline-flex items-center justify-center rounded-2xl bg-[var(--color-cta-bg)] dark:bg-[var(--color-accent)] text-[var(--color-cta-text)] dark:text-[var(--color-dark-bg)] px-6 py-3 font-semibold text-sm hover:opacity-90 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              Start today’s diagnosis
            </a>
            <Link
              href="/gift"
              onClick={handleGiftClick}
              aria-label="Go to gift a diagnosis page"
              className="inline-flex items-center justify-center rounded-2xl border border-[var(--color-card-border)] dark:border-[var(--color-dark-border)] bg-[var(--color-bg-secondary)] dark:bg-[var(--color-dark-bg)] text-[var(--color-text-primary)] dark:text-[var(--color-dark-text)] px-6 py-3 text-sm font-semibold hover:border-[var(--color-accent)]/80 hover:text-[var(--color-accent)] hover:scale-105 transition-all"
            >
              Gift a diagnosis
            </Link>
          </div>
        </div>

        <div className="rounded-[2rem] bg-[var(--color-bg-secondary)] dark:bg-[var(--color-dark-bg)] border border-[var(--color-card-border)] dark:border-[var(--color-dark-border)] p-8">
          <p className="text-xs uppercase tracking-[0.32em] text-[var(--color-accent)] font-semibold mb-4">
            Emotional momentum
          </p>
          <h3 className="text-2xl text-[var(--color-text-primary)] dark:text-[var(--color-dark-text)] font-semibold mb-5">
            Feel good, stay curious, and come back for more.
          </h3>
          <ul className="space-y-4 text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text)]">
            <li className="flex gap-3">
              <span className="mt-1">✨</span>
              <span>
                A short self-check, a joyful verdict, and a tangible product recommendation that turns feeling good into action.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="mt-1">📈</span>
              <span>
                Streaks make this more than a one-off visit — they make it a daily habit that builds confidence and reward momentum.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="mt-1">🔗</span>
              <span>
                Share your prescription, send one to a friend, or click through to claim an affiliate-recommended treat.
              </span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
