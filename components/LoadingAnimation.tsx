"use client";

import { useEffect, useState } from "react";

const STEPS = [
  "Taking your win seriously…",
  "Finding the right words to match what you did…",
  "Almost there—your receipt is printing…",
  "Cross-checking the universe's opinion (sample size: you)…",
  "Tuning the prescription to fit your story…",
  "Finishing up something worth sharing…",
];

export default function LoadingAnimation() {
  const [stepIndex, setStepIndex] = useState(0);
  const [dots, setDots] = useState(".");

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setStepIndex((i) => (i + 1) % STEPS.length);
    }, 900);

    const dotInterval = setInterval(() => {
      setDots((d) => (d.length >= 3 ? "." : d + "."));
    }, 400);

    return () => {
      clearInterval(stepInterval);
      clearInterval(dotInterval);
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-6 py-12 px-4 text-center animate-[fade-in_0.3s_ease-out]">
      <div className="relative w-16 h-16" aria-hidden>
        <div className="absolute inset-0 rounded-full border-2 border-[var(--color-card-border)] dark:border-[var(--color-dark-border)]" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[var(--color-accent)] animate-spin motion-reduce:animate-none motion-reduce:border-solid motion-reduce:border-[var(--color-accent)]/35" />
      </div>

      <div>
        <p
          className="text-lg text-[var(--color-text-primary)] dark:text-[var(--color-dark-text)] mb-2"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Hang tight—we&apos;re almost there
          <span className="text-[var(--color-accent)]">{dots}</span>
        </p>
        <p className="text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text)] min-h-[22px] transition-opacity duration-300 max-w-sm mx-auto leading-relaxed">
          {STEPS[stepIndex]}
        </p>
      </div>
    </div>
  );
}
