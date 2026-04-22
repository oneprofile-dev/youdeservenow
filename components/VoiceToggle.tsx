"use client";

import type { PromptVoice } from "@/lib/prompt";

interface VoiceToggleProps {
  value: PromptVoice;
  onChange: (v: PromptVoice) => void;
  /** Smaller label for gift page */
  variant?: "default" | "compact";
}

export default function VoiceToggle({ value, onChange, variant = "default" }: VoiceToggleProps) {
  const labelClass =
    variant === "compact"
      ? "text-[10px] uppercase tracking-widest text-[var(--color-text-tertiary)] dark:text-[var(--color-dark-text)] font-semibold mb-2"
      : "text-xs uppercase tracking-widest text-[var(--color-text-tertiary)] dark:text-[var(--color-dark-text)] font-semibold mb-2";

  return (
    <div>
      <p className={labelClass}>Prescription tone</p>
      <div
        role="radiogroup"
        aria-label="Prescription tone"
        className="grid grid-cols-2 gap-2 max-w-md mx-auto sm:mx-0"
      >
        <button
          type="button"
          role="radio"
          aria-checked={value === "classic"}
          onClick={() => onChange("classic")}
          className={`rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors border-2 ${
            value === "classic"
              ? "border-[var(--color-accent)] bg-[var(--color-accent)]/10 text-[var(--color-text-primary)] dark:text-[var(--color-dark-text)]"
              : "border-[var(--color-card-border)] dark:border-[var(--color-dark-border)] text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text)] hover:border-[var(--color-accent)]/40"
          }`}
        >
          Institute style
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={value === "warm"}
          onClick={() => onChange("warm")}
          className={`rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors border-2 ${
            value === "warm"
              ? "border-[var(--color-accent)] bg-[var(--color-accent)]/10 text-[var(--color-text-primary)] dark:text-[var(--color-dark-text)]"
              : "border-[var(--color-card-border)] dark:border-[var(--color-dark-border)] text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text)] hover:border-[var(--color-accent)]/40"
          }`}
        >
          Plain and warm
        </button>
      </div>
      <p className="text-[11px] text-[var(--color-text-tertiary)] dark:text-[var(--color-dark-text)] mt-1.5 text-center sm:text-left leading-snug">
        Same playful science—pick the tone that feels kindest in your body right now.
      </p>
    </div>
  );
}
