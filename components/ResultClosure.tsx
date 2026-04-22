"use client";

import { useState } from "react";
import Link from "next/link";
import { track } from "@vercel/analytics/react";
import type { Result } from "@/lib/db";

const FEELINGS = ["Relief", "Pride", "Comfort", "Connection"] as const;

interface ResultClosureProps {
  result: Result;
}

export default function ResultClosure({ result }: ResultClosureProps) {
  const [picked, setPicked] = useState<(typeof FEELINGS)[number] | null>(null);
  const [copied, setCopied] = useState(false);

  function pickFeeling(f: (typeof FEELINGS)[number]) {
    setPicked(f);
    track("result_feeling", { feeling: f, result_id: result.id, audience: result.audience ?? "self" });
  }

  async function copyLink() {
    track("result_closure_copy", { result_id: result.id });
    try {
      await navigator.clipboard.writeText(result.shareUrl);
    } catch {
      try {
        const input = document.createElement("input");
        input.value = result.shareUrl;
        document.body.appendChild(input);
        input.select();
        document.execCommand("copy");
        document.body.removeChild(input);
      } catch {
        return;
      }
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="rounded-2xl border border-[var(--color-accent)]/30 bg-[var(--color-accent)]/5 dark:bg-[var(--color-dark-bg)] p-5 sm:p-6 space-y-5">
      <div>
        <p className="text-xs uppercase tracking-widest text-[var(--color-accent)] font-semibold mb-2">
          Before you go
        </p>
        <p className="text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text)] leading-relaxed">
          What feeling is this mostly about? (Optional—helps us know what landed.)
        </p>
        <div className="flex flex-wrap gap-2 mt-3" role="group" aria-label="How this result felt">
          {FEELINGS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => pickFeeling(f)}
              className={`px-3 py-2 rounded-full text-xs font-semibold border-2 transition-colors ${
                picked === f
                  ? "border-[var(--color-accent)] bg-[var(--color-accent)]/15 text-[var(--color-text-primary)] dark:text-[var(--color-dark-text)]"
                  : "border-[var(--color-card-border)] dark:border-[var(--color-dark-border)] text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text)] hover:border-[var(--color-accent)]/50"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="h-px bg-[var(--color-card-border)] dark:bg-[var(--color-dark-border)]" />

      <div>
        <p className="text-xs uppercase tracking-widest text-[var(--color-text-tertiary)] dark:text-[var(--color-dark-text)] font-semibold mb-3">
          Next step
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <Link
            href="/gift"
            className="inline-flex justify-center items-center px-4 py-3 rounded-xl border-2 border-[#ff6b6b]/40 text-[#ff5252] dark:text-[#ff8a80] text-sm font-semibold hover:bg-[#ff6b6b]/10 transition-colors text-center"
            onClick={() => track("result_closure_gift", { result_id: result.id })}
          >
            Gift someone →
          </Link>
          <button
            type="button"
            onClick={copyLink}
            className="inline-flex justify-center items-center px-4 py-3 rounded-xl border-2 border-[var(--color-card-border)] dark:border-[var(--color-dark-border)] text-sm font-semibold text-[var(--color-text-primary)] dark:text-[var(--color-dark-text)] hover:border-[var(--color-accent)]/50 transition-colors"
          >
            {copied ? "Copied link" : "Copy share link"}
          </button>
          <Link
            href="/#institute-diagnosis"
            className="inline-flex justify-center items-center px-4 py-3 rounded-xl bg-[var(--color-cta-bg)] dark:bg-[var(--color-accent)] text-[var(--color-cta-text)] dark:text-[var(--color-dark-bg)] text-sm font-semibold hover:opacity-90 transition-opacity text-center"
            onClick={() => track("result_closure_another", { result_id: result.id })}
          >
            Mark another win
          </Link>
        </div>
      </div>
    </div>
  );
}
