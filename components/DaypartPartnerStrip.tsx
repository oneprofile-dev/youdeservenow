"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Daypart = "morning" | "afternoon" | "evening" | "night";

function getDaypart(date: Date): Daypart {
  const h = date.getHours();
  if (h >= 5 && h < 12) return "morning";
  if (h < 17) return "afternoon";
  if (h < 22) return "evening";
  return "night";
}

const COPY: Record<
  Daypart,
  { headline: string; supporting: string }
> = {
  morning: {
    headline: "You already did something worth naming",
    supporting:
      "Coffee, commute, courage—whatever it was, you deserve a moment that feels like a win. Let us put it into words.",
  },
  afternoon: {
    headline: "The middle of the day counts too",
    supporting:
      "You do not need a dramatic headline to earn a treat. Tell us what you pushed through—we will meet you with warmth.",
  },
  evening: {
    headline: "Let the day soften a little",
    supporting:
      "If you showed up for anything today—even quietly—that is enough. This is permission, not pressure.",
  },
  night: {
    headline: "Still here? That takes energy too",
    supporting:
      "Late hours can feel lonely. Share what you carried; we will answer with something kind you can keep.",
  },
};

export default function DaypartPartnerStrip() {
  const [slot, setSlot] = useState<Daypart>("afternoon");

  useEffect(() => {
    setSlot(getDaypart(new Date()));
  }, []);

  const { headline, supporting } = COPY[slot];

  return (
    <section
      className="max-w-3xl mx-auto px-4 sm:px-6 mt-10 mb-2"
      aria-labelledby="daypart-strip-heading"
    >
      <div className="rounded-2xl border border-[var(--color-card-border)] dark:border-[var(--color-dark-border)] bg-[var(--color-bg-secondary)]/80 dark:bg-[var(--color-dark-surface)] p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-5">
          <div className="min-w-0 flex-1">
            <p className="text-xs uppercase tracking-widest text-[var(--color-accent)] font-semibold mb-2">
              You belong here
            </p>
            <h2
              id="daypart-strip-heading"
              className="text-xl sm:text-2xl text-[var(--color-text-primary)] dark:text-[var(--color-dark-text)] mb-2"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {headline}
            </h2>
            <p className="text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text)] leading-relaxed">
              {supporting}
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-shrink-0 sm:w-auto w-full">
            <Link
              href="/#institute-diagnosis"
              className="inline-flex justify-center items-center px-5 py-3 rounded-xl bg-[var(--color-cta-bg)] dark:bg-[var(--color-accent)] text-[var(--color-cta-text)] dark:text-[var(--color-dark-bg)] text-sm font-semibold hover:opacity-90 transition-opacity text-center shadow-sm"
            >
              Tell us your win
            </Link>
            <Link
              href="/gift"
              className="inline-flex justify-center items-center px-5 py-3 rounded-xl border-2 border-[var(--color-accent)] text-[var(--color-accent)] text-sm font-semibold hover:bg-[var(--color-accent)]/10 transition-colors text-center"
            >
              Celebrate someone you love →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
