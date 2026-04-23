"use client";

import { useState, useEffect } from "react";
import { track } from "@vercel/analytics/react";

interface GaslightButtonProps {
  resultId: string;
  initialGaslights?: number;
  onGaslightsChange?: (newCount: number) => void;
}

export default function GaslightButton({
  resultId,
  initialGaslights = 0,
  onGaslightsChange,
}: GaslightButtonProps) {
  const [gaslights, setGaslights] = useState(initialGaslights);
  const [isGaslighted, setIsGaslighted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPulse, setShowPulse] = useState(false);

  // Fetch current vote status from localStorage
  useEffect(() => {
    const gaslightKey = `gaslighted:${resultId}`;
    const wasGaslighted = localStorage.getItem(gaslightKey) === "true";
    setIsGaslighted(wasGaslighted);
  }, [resultId]);

  const handleGaslight = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isLoading) return;

    setIsLoading(true);
    const gaslightKey = `gaslighted:${resultId}`;

    try {
      const action = isGaslighted ? "remove" : "gaslight";
      const response = await fetch("/api/ledger/gaslight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resultId, action }),
      });

      if (!response.ok) throw new Error("Failed to gaslight");

      const data = await response.json();
      const newGaslights = data.gaslights || 0;

      // Update local state
      setGaslights(newGaslights);
      const newGaslightedState = !isGaslighted;
      setIsGaslighted(newGaslightedState);

      // Persist to localStorage
      if (newGaslightedState) {
        localStorage.setItem(gaslightKey, "true");
      } else {
        localStorage.removeItem(gaslightKey);
      }

      // Notify parent
      onGaslightsChange?.(newGaslights);

      // Show animation
      setShowPulse(true);
      setTimeout(() => setShowPulse(false), 600);

      // Analytics
      track("ledger_gaslight", {
        resultId,
        action,
        totalGaslights: newGaslights,
      });
    } catch (error) {
      console.error("Failed to gaslight:", error);
      // Revert optimistic update
      setIsGaslighted(!isGaslighted);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleGaslight}
      disabled={isLoading}
      className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all duration-200 active:scale-95 disabled:opacity-50 ${
        isGaslighted
          ? "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border border-amber-300 dark:border-amber-700"
          : "bg-[var(--color-bg-secondary)] dark:bg-[var(--color-dark-border)] text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text)] border border-transparent hover:bg-[var(--color-bg-secondary)] dark:hover:bg-[var(--color-dark-border)] hover:border-amber-300 dark:hover:border-amber-700"
      }`}
      aria-pressed={isGaslighted}
      aria-label={isGaslighted ? "Remove gaslight vote" : "This deserves better"}
      title={isGaslighted ? "Remove gaslight vote" : "This deserves better"}
    >
      {/* Gaslight icon with animation */}
      <span
        className={`inline-block transition-transform ${
          showPulse ? "scale-150" : "scale-100"
        }`}
        aria-hidden="true"
      >
        🔥
      </span>
      <span className="text-xs font-semibold whitespace-nowrap">
        {gaslights}
      </span>
    </button>
  );
}
