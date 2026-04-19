"use client";

import { useState, useCallback } from "react";
import { track } from "@vercel/analytics/react";
import type { Result } from "@/lib/db";
import ResultCard from "./ResultCard";
import LoadingAnimation from "./LoadingAnimation";

export default function GiftHero() {
  const [recipientName, setRecipientName] = useState("");
  const [senderName, setSenderName] = useState("");
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const trimmedInput = input.trim();
      const trimmedName = recipientName.trim();
      if (!trimmedInput || !trimmedName || isLoading) return;

      setIsLoading(true);
      setError(null);
      setResult(null);

      try {
        const res = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            input: trimmedInput,
            recipientName: trimmedName,
            senderName: senderName.trim() || undefined,
          }),
        });

        if (res.status === 429) {
          setError("Rate limit reached — try again in a minute.");
          return;
        }
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setError(data.error ?? "Something went wrong. The scientists are baffled.");
          return;
        }

        const data: Result = await res.json();
        setResult(data);
        track("gift_generate", { category: data.product.category });

        import("canvas-confetti").then(({ default: confetti }) => {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.55 },
            colors: ["#ff6b6b", "#ff8e8e", "#ffb3b3", "#C8963E", "#FBF8F3"],
          });
        });
      } catch {
        setError("The Institute's servers are momentarily overwhelmed. Try again.");
      } finally {
        setIsLoading(false);
      }
    },
    [input, recipientName, senderName, isLoading]
  );

  function reset() {
    setResult(null);
    setError(null);
    setInput("");
    setRecipientName("");
    setSenderName("");
  }

  if (isLoading) {
    return (
      <section className="w-full max-w-3xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16">
        <LoadingAnimation />
      </section>
    );
  }

  if (result) {
    return (
      <section className="w-full max-w-3xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12 pb-16">
        <ResultCard result={result} />
        <div className="text-center mt-8">
          <button
            onClick={reset}
            className="text-sm text-[var(--color-text-tertiary)] dark:text-[var(--color-dark-text)] hover:text-[var(--color-accent)] transition-colors underline underline-offset-4"
          >
            Prescribe for someone else →
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full max-w-2xl mx-auto px-4 sm:px-6">
      {/* Header */}
      <div className="text-center mb-10 pt-12 sm:pt-16 animate-[fade-in_0.5s_ease-out]">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#ff6b6b]/10 border border-[#ff6b6b]/30 text-[#ff6b6b] text-xs font-semibold mb-5">
          <span>💌</span>
          <span>Gift a Diagnosis</span>
        </div>
        <h1
          className="text-4xl sm:text-5xl text-[var(--color-text-primary)] dark:text-[var(--color-dark-text)] leading-[1.1] mb-4"
          style={{ fontFamily: "var(--font-display)" }}
        >
          They deserve something.
          <br />
          <span className="text-[#C8963E]">Science can prove it.</span>
        </h1>
        <p className="text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text)] text-base sm:text-lg max-w-lg mx-auto">
          Tell us what your partner, friend, or anyone accomplished. We&apos;ll generate a
          peer-reviewed prescription — shareable, framed, and undeniable.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4 animate-[slide-up_0.5s_ease-out]">
        {/* Name fields */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs uppercase tracking-widest text-[var(--color-text-tertiary)] dark:text-[var(--color-dark-text)] font-semibold mb-1.5">
              Their name <span className="text-[#ff6b6b]">*</span>
            </label>
            <input
              type="text"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              placeholder="Alex, my girlfriend…"
              maxLength={50}
              required
              className="w-full px-4 py-3 rounded-xl border-2 border-[var(--color-card-border)] dark:border-[var(--color-dark-border)] bg-[var(--color-card-bg)] dark:bg-[var(--color-dark-surface)] text-[var(--color-text-primary)] dark:text-[var(--color-dark-text)] placeholder:text-[var(--color-text-tertiary)] text-sm focus:outline-none focus:border-[#ff6b6b] transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-[var(--color-text-tertiary)] dark:text-[var(--color-dark-text)] font-semibold mb-1.5">
              Your name <span className="opacity-50">(optional)</span>
            </label>
            <input
              type="text"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              placeholder="From: you"
              maxLength={50}
              className="w-full px-4 py-3 rounded-xl border-2 border-[var(--color-card-border)] dark:border-[var(--color-dark-border)] bg-[var(--color-card-bg)] dark:bg-[var(--color-dark-surface)] text-[var(--color-text-primary)] dark:text-[var(--color-dark-text)] placeholder:text-[var(--color-text-tertiary)] text-sm focus:outline-none focus:border-[var(--color-accent)] transition-colors"
            />
          </div>
        </div>

        {/* Accomplishment */}
        <div>
          <label className="block text-xs uppercase tracking-widest text-[var(--color-text-tertiary)] dark:text-[var(--color-dark-text)] font-semibold mb-1.5">
            What did they accomplish? <span className="text-[#ff6b6b]">*</span>
          </label>
          <div className="relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="She ran her first marathon… He cooked dinner every night this week… They kept the whole family together through a hard month…"
              rows={4}
              maxLength={500}
              required
              className="w-full px-5 py-4 rounded-2xl border-2 border-[var(--color-card-border)] dark:border-[var(--color-dark-border)] bg-[var(--color-card-bg)] dark:bg-[var(--color-dark-surface)] text-[var(--color-text-primary)] dark:text-[var(--color-dark-text)] placeholder:text-[var(--color-text-tertiary)] text-base focus:outline-none focus:border-[#ff6b6b] transition-colors resize-none"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e as unknown as React.FormEvent);
                }
              }}
            />
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-500 text-center">{error}</p>
        )}

        <button
          type="submit"
          disabled={!input.trim() || !recipientName.trim()}
          className="w-full py-4 rounded-2xl bg-[#ff6b6b] text-white font-semibold text-base hover:bg-[#ff5252] active:scale-[0.98] disabled:opacity-30 transition-all"
        >
          Get their prescription →
        </button>

        <p className="text-center text-xs text-[var(--color-text-tertiary)] dark:text-[var(--color-dark-text)]">
          The Institute&apos;s findings are 100% peer-reviewed and 0% legally binding.
        </p>
      </form>
    </section>
  );
}
