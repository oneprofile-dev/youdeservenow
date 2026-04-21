"use client";

import { useState } from "react";
import { track } from "@vercel/analytics/react";

export default function EmailCapture() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || status === "loading") return;

    track("email_subscribe_attempt");
    setStatus("loading");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        track("email_subscribe_success");
        setStatus("success");
      } else {
        track("email_subscribe_failure", { status: res.status });
        setStatus("error");
      }
    } catch {
      track("email_subscribe_failure", { status: 0 });
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="text-center py-4 px-5 rounded-2xl bg-[var(--color-bg-secondary)] dark:bg-[var(--color-dark-surface)] border border-[var(--color-card-border)] dark:border-[var(--color-dark-border)] animate-[fade-in_0.4s_ease-out]">
        <p className="text-sm font-semibold text-[var(--color-accent)] mb-0.5">
          Prescription on file.
        </p>
        <p className="text-xs text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text)]">
          The Institute will notify you of future reward authorizations.
        </p>
      </div>
    );
  }

  return (
    <div className="py-6 px-5 rounded-2xl bg-[var(--color-bg-secondary)] dark:bg-[var(--color-dark-surface)] border border-[var(--color-card-border)] dark:border-[var(--color-dark-border)]">
      <p className="text-xs uppercase tracking-widest text-[var(--color-accent)] font-semibold mb-1">
        Institute Mailing List
      </p>
      <p className="text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text)] mb-4">
        Get your next scientific justification delivered. No spam — only peer-reviewed rewards.
      </p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label htmlFor="newsletter-email" className="block text-xs font-medium text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text)] mb-1.5">
            Email address
          </label>
          <div className="flex gap-2">
            <input
              id="newsletter-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              aria-label="Email address for newsletter"
              aria-invalid={status === "error"}
              className="flex-1 min-w-0 px-3 py-2.5 min-h-11 rounded-lg border border-[var(--color-card-border)] dark:border-[var(--color-dark-border)] bg-[var(--color-card-bg)] dark:bg-[var(--color-dark-surface)] text-sm text-[var(--color-text-primary)] dark:text-[var(--color-dark-text)] placeholder:text-[var(--color-text-tertiary)] hover:border-[var(--color-accent)]/30 focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]/20 transition-all"
            />
            <button
              type="submit"
              disabled={status === "loading" || !email.trim()}
              aria-busy={status === "loading"}
              className="flex-shrink-0 px-6 py-2.5 min-h-11 rounded-lg bg-[var(--color-cta-bg)] dark:bg-[var(--color-accent)] text-[var(--color-cta-text)] dark:text-[var(--color-dark-bg)] text-sm font-semibold hover:opacity-90 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all whitespace-nowrap"
            >
              {status === "loading" ? (
                <span className="inline-block">Subscribing…</span>
              ) : (
                "Subscribe"
              )}
            </button>
          </div>
        </div>

        {status === "error" && (
          <p className="text-xs text-red-600 dark:text-red-400 font-medium" role="alert">
            Something went wrong — try again.
          </p>
        )}
      </form>
    </div>
  );
}
