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
    <div className="py-4 px-5 rounded-2xl bg-[var(--color-bg-secondary)] dark:bg-[var(--color-dark-surface)] border border-[var(--color-card-border)] dark:border-[var(--color-dark-border)]">
      <p className="text-xs uppercase tracking-widest text-[var(--color-accent)] font-semibold mb-1">
        Institute Mailing List
      </p>
      <p className="text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text)] mb-3">
        Get your next scientific justification delivered. No spam — only peer-reviewed rewards.
      </p>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          className="flex-1 min-w-0 px-3 py-2 rounded-lg border border-[var(--color-card-border)] dark:border-[var(--color-dark-border)] bg-[var(--color-card-bg)] dark:bg-[var(--color-dark-surface)] text-sm text-[var(--color-text-primary)] dark:text-[var(--color-dark-text)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:border-[var(--color-accent)] transition-colors"
        />
        <button
          type="submit"
          disabled={status === "loading" || !email.trim()}
          className="flex-shrink-0 px-4 py-2 rounded-lg bg-[var(--color-cta-bg)] dark:bg-[var(--color-accent)] text-[var(--color-cta-text)] dark:text-[var(--color-dark-bg)] text-sm font-semibold hover:opacity-90 active:scale-95 disabled:opacity-40 transition-all whitespace-nowrap"
        >
          {status === "loading" ? "..." : "Subscribe"}
        </button>
      </form>

      {status === "error" && (
        <p className="text-xs text-red-500 mt-2">Something went wrong — try again.</p>
      )}
    </div>
  );
}
