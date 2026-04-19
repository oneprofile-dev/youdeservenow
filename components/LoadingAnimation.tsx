"use client";

import { useEffect, useState } from "react";

const STEPS = [
  "Analyzing your accomplishment...",
  "Cross-referencing 847 peer-reviewed studies...",
  "Consulting the Institute of Deserved Rewards...",
  "Calculating your reward coefficient...",
  "Verifying statistical significance (p < 0.001)...",
  "Finalizing prescription...",
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
      {/* Spinner */}
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-2 border-[var(--color-card-border)] dark:border-[var(--color-dark-border)]" />
        <div
          className="absolute inset-0 rounded-full border-2 border-transparent border-t-[var(--color-accent)]"
          style={{ animation: "spin 0.8s linear infinite" }}
        />
      </div>

      <div>
        <p
          className="text-lg text-[var(--color-text-primary)] dark:text-[var(--color-dark-text)] mb-2"
          style={{ fontFamily: "var(--font-display)" }}
        >
          THE SCIENCE IS IN PROGRESS
          <span className="text-[var(--color-accent)]">{dots}</span>
        </p>
        <p className="text-sm text-[var(--color-text-tertiary)] dark:text-[var(--color-dark-text)] font-mono min-h-[20px] transition-all duration-300">
          {STEPS[stepIndex]}
        </p>
      </div>

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
