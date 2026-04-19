"use client";

import { useState, useEffect, useCallback } from "react";
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
];

export default function Hero() {
  const [input, setInput] = useState("");
  const [placeholder, setPlaceholder] = useState(PLACEHOLDERS[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholder(PLACEHOLDERS[Math.floor(Math.random() * PLACEHOLDERS.length)]);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
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
        setError("You've been very productive today — slow down! (Rate limit: 5 requests/minute)");
        return;
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Something went wrong. The scientists are baffled.");
        return;
      }

      const data: Result = await res.json();
      setResult(data);
    } catch {
      setError("The institute's servers are momentarily overwhelmed by achievement. Try again.");
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading]);

  function reset() {
    setResult(null);
    setError(null);
    setInput("");
  }

  return (
    <section className="w-full max-w-3xl mx-auto px-4 sm:px-6">
      {/* Headline */}
      {!result && (
        <div className="text-center mb-10 pt-12 sm:pt-16 animate-[fade-in_0.5s_ease-out]">
          <p className="text-xs uppercase tracking-widest text-[var(--color-accent)] font-semibold mb-4">
            Peer-Reviewed Self-Reward Science
          </p>
          <h1
            className="text-4xl sm:text-5xl lg:text-6xl text-[var(--color-text-primary)] dark:text-[var(--color-dark-text)] leading-[1.1] mb-4"
            style={{ fontFamily: "var(--font-display)" }}
          >
            What did you accomplish today?
          </h1>
          <p className="text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text)] text-base sm:text-lg max-w-lg mx-auto">
            Tell us. We'll tell you exactly what you deserve — with citations.
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
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
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
