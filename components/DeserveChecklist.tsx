"use client";

import { useState } from "react";

interface Props {
  title: string;
  items: string[];
}

export default function DeserveChecklist({ title, items }: Props) {
  const [checked, setChecked] = useState<Set<number>>(new Set());

  function toggle(i: number) {
    setChecked((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  }

  const allChecked = checked.size === items.length;

  return (
    <div className="rounded-2xl border border-[var(--color-card-border)] dark:border-[var(--color-dark-border)] bg-[var(--color-card-bg)] dark:bg-[var(--color-dark-surface)] p-8 max-w-xl mx-auto">
      <p className="text-xs uppercase tracking-widest text-[var(--color-accent)] font-semibold mb-3">
        Interactive Value Assessment
      </p>
      <h3
        className="text-xl text-[var(--color-text-primary)] dark:text-[var(--color-dark-text)] mb-6"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {title}
      </h3>
      <ul className="space-y-3">
        {items.map((item, i) => (
          <li
            key={i}
            onClick={() => toggle(i)}
            className="flex items-start gap-3 cursor-pointer group select-none"
          >
            <div
              className={`w-5 h-5 rounded flex-shrink-0 mt-0.5 border-2 flex items-center justify-center transition-all ${
                checked.has(i)
                  ? "bg-[var(--color-accent)] border-[var(--color-accent)]"
                  : "border-[var(--color-card-border)] group-hover:border-[var(--color-accent)]"
              }`}
            >
              {checked.has(i) && (
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </div>
            <span
              className={`text-sm leading-relaxed transition-colors ${
                checked.has(i)
                  ? "text-[var(--color-text-tertiary)] line-through"
                  : "text-[var(--color-text-primary)] dark:text-[var(--color-dark-text)]"
              }`}
            >
              {item}
            </span>
          </li>
        ))}
      </ul>

      <div
        className={`mt-6 p-4 rounded-xl text-center transition-all duration-500 ${
          allChecked
            ? "bg-[var(--color-bg-secondary)] dark:bg-[var(--color-dark-border)] opacity-100"
            : "opacity-0 pointer-events-none"
        }`}
      >
        <p className="text-sm font-semibold text-[var(--color-accent)]">
          ✓ All Criteria Verified — Reward Scientifically Authorized
        </p>
        <p className="text-xs text-[var(--color-text-tertiary)] mt-1">
          Proceed immediately to claim your prescription below.
        </p>
      </div>
    </div>
  );
}
