"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { track } from "@vercel/analytics/react";
import type { Result } from "@/lib/db";
import LoadingAnimation from "./LoadingAnimation";
import ResultCard from "./ResultCard";

const PLACEHOLDERS = [
  "I survived a 3-hour meeting without falling asleep...",
  "I woke up before my alarm for the first time in years...",
  "I actually did my laundry AND put it away...",
  "I ran 5 miles even though I really didn't want to...",
  "I cooked a real meal instead of ordering takeout...",
  "I replied to every email in my inbox...",
  "I went to the gym twice this week...",
  "I finally organized my closet...",
  "I made it through a Monday without complaining...",
  "I finished a project two days early...",
  "I prepped meals for the whole week...",
  "I sent a difficult email I'd been avoiding for days...",
  "I made it to the gym before 7am...",
  "I drank 8 glasses of water today...",
];

interface HeroContext {
  label: string;
  headline: string;
  sub: string;
}

function getContextualHero(): HeroContext {
  const now = new Date();
  const hour = now.getHours();
  const day = now.getDay(); // 0=Sun, 1=Mon … 6=Sat

  if (day === 1)
    return {
      label: "Monday Achievement Protocol",
      headline: "Survived Monday.",
      sub: "That alone is clinical proof you deserve something. Tell us what you did.",
    };
  if (day === 5)
    return {
      label: "Friday Reward Clearance",
      headline: "You made it to Friday.",
      sub: "The peer-reviewed consensus: this week earned a treat. What did you accomplish?",
    };
  if (day === 0 || day === 6)
    return {
      label: "Weekend Research Division",
      headline: "Even weekends deserve recognition.",
      sub: "Rest is productive. Rest counts. What did you do — or beautifully not do?",
    };
  if (hour >= 5 && hour < 12)
    return {
      label: "Morning Achievement Scan",
      headline: "Early riser detected.",
      sub: "Research shows morning accomplishments earn 2× the reward. What have you done so far?",
    };
  if (hour >= 12 && hour < 17)
    return {
      label: "Peer-Reviewed Self-Reward Science",
      headline: "What did you accomplish today?",
      sub: "Tell us. We'll tell you exactly what you deserve — with citations.",
    };
  if (hour >= 17 && hour < 21)
    return {
      label: "End-of-Day Analysis",
      headline: "Long day. You earned something.",
      sub: "Post-5pm achievers require immediate reward stimulation. What did you do today?",
    };
  return {
    label: "Late-Night Achievement Lab",
    headline: "Still going at this hour?",
    sub: "The Institute of Nocturnal Productivity says you have unambiguously earned a treat.",
  };
}

interface HeroProps {
  referralResult?: Result;
}

export default function Hero({ referralResult }: HeroProps) {
  const [input, setInput] = useState("");
  const [placeholder, setPlaceholder] = useState(PLACEHOLDERS[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [heroCtx, setHeroCtx] = useState<HeroContext>({
    label: "Peer-Reviewed Self-Reward Science",
    headline: "What did you accomplish today?",
    sub: "Tell us. We'll tell you exactly what you deserve — with citations.",
  });

  // useRef so confetti only fires once without triggering re-render
  const hasConfettiFired = useRef(false);

  // Hydrate with time/day context client-side (server renders the safe default, no FOUC)
  useEffect(() => {
    setHeroCtx(getContextualHero());
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholder(PLACEHOLDERS[Math.floor(Math.random() * PLACEHOLDERS.length)]);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const trimmed = input.trim();
      if (!trimmed || isLoading) return;

      setIsLoading(true);
      setError(null);
      setResult(null);

      try {
        const res = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ input: trimmed }),
        });

        if (res.status === 429) {
          setError(
            "You've been very productive today — slow down! (Rate limit: 5 requests/minute)"
          );
          return;
        }

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setError(data.error ?? "Something went wrong. The scientists are baffled.");
          return;
        }

        const data: Result = await res.json();
        setResult(data);

        // Track funnel event
        track("generate_success", {
          category: data.product.category,
          product_id: data.product.id,
        });

        // Confetti — fires only on the first result reveal ever in this session
        if (!hasConfettiFired.current) {
          hasConfettiFired.current = true;
          import("canvas-confetti").then(({ default: confetti }) => {
            confetti({
              particleCount: 120,
              spread: 75,
              origin: { y: 0.55 },
              colors: ["#C8963E", "#1A1814", "#FBF8F3", "#E8E0D6", "#B8862E"],
            });
          });
        }
      } catch {
        setError(
          "The institute's servers are momentarily overwhelmed by achievement. Try again."
        );
      } finally {
        setIsLoading(false);
      }
    },
    [input, isLoading]
  );

  function reset() {
    setResult(null);
    setError(null);
    setInput("");
  }

  return (
    <section className="w-full max-w-3xl mx-auto px-4 sm:px-6">
      {/* Headline — hydrated with time/day context on the client */}
      {!result && (
        <div className="text-center mb-10 pt-12 sm:pt-16 animate-[fade-in_0.5s_ease-out]">
          <p className="text-xs uppercase tracking-widest text-[var(--color-accent)] font-semibold mb-4">
            {heroCtx.label}
          </p>
          <h1
            className="text-4xl sm:text-5xl lg:text-6xl text-[var(--color-text-primary)] dark:text-[var(--color-dark-text)] leading-[1.1] mb-4"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {heroCtx.headline}
          </h1>
          <p className="text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text)] text-base sm:text-lg max-w-lg mx-auto">
            {heroCtx.sub}
          </p>
        </div>
      )}

      {/* Referral teaser — shown when landing from a friend's share link */}
      {referralResult && !result && (
        <div className="mb-6 flex items-start gap-3 p-4 rounded-xl border border-[var(--color-accent)] bg-[var(--color-bg-secondary)] dark:bg-[var(--color-dark-surface)]">
          <span className="text-lg flex-shrink-0 mt-0.5">🔬</span>
          <p className="text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text)] leading-relaxed">
            The Institute prescribed{" "}
            <span className="font-semibold text-[var(--color-text-primary)] dark:text-[var(--color-dark-text)]">
              {referralResult.product.name}
            </span>{" "}
            to someone who{" "}
            <span className="italic">
              {referralResult.input.toLowerCase().replace(/^i /, "").slice(0, 60)}
              {referralResult.input.length > 60 ? "…" : ""}
            </span>
            . What will they prescribe for{" "}
            <span className="font-semibold text-[var(--color-accent)]">you?</span>
          </p>
        </div>
      )}

      {/* Form */}
      {!result && !isLoading && (
        <form onSubmit={handleSubmit} className="space-y-4 animate-[slide-up_0.5s_ease-out]">
          <div className="relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={placeholder}
              rows={3}
              maxLength={500}
              className="w-full px-5 py-4 pr-16 rounded-2xl border-2 border-[var(--color-card-border)] dark:border-[var(--color-dark-border)] bg-[var(--color-card-bg)] dark:bg-[var(--color-dark-surface)] text-[var(--color-text-primary)] dark:text-[var(--color-dark-text)] placeholder:text-[var(--color-text-tertiary)] text-base focus:outline-none focus:border-[var(--color-accent)] transition-colors resize-none"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e as unknown as React.FormEvent);
                }
              }}
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="absolute bottom-3 right-3 w-10 h-10 rounded-xl bg-[var(--color-cta-bg)] dark:bg-[var(--color-accent)] text-[var(--color-cta-text)] dark:text-[var(--color-dark-bg)] flex items-center justify-center hover:opacity-90 active:scale-95 disabled:opacity-30 transition-all"
              aria-label="Get my justification"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>

          <p className="text-center text-xs text-[var(--color-text-tertiary)] dark:text-[var(--color-dark-text)]">
            Backed by absolutely no real science.
          </p>

          {error && (
            <div className="text-center text-sm text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-xl px-4 py-3">
              {error}
            </div>
          )}
        </form>
      )}

      {/* Loading */}
      {isLoading && <LoadingAnimation />}

      {/* Result */}
      {result && !isLoading && (
        <div className="space-y-6">
          <ResultCard result={result} />
          <div className="text-center">
            <button
              onClick={reset}
              className="text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text)] hover:text-[var(--color-accent)] transition-colors underline underline-offset-4"
            >
              Try another accomplishment →
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
