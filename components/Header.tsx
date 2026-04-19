"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function Header() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggleDark() {
    const html = document.documentElement;
    html.classList.toggle("dark");
    const next = html.classList.contains("dark");
    setIsDark(next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch (_) {}
  }

  return (
    <header className="w-full border-b border-[var(--color-card-border)] dark:border-[var(--color-dark-border)] bg-[var(--color-bg-primary)] dark:bg-[var(--color-dark-bg)]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <Link href="/" className="group flex items-center gap-2">
          <span
            className="text-xl tracking-tight text-[var(--color-text-primary)] dark:text-[var(--color-dark-text)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            YouDeserveNow
          </span>
        </Link>

        <nav className="flex items-center gap-6">
          <Link
            href="/gift"
            className="text-sm font-medium text-[#ff6b6b] hover:text-[#ff5252] transition-colors flex items-center gap-1"
          >
            <span>💌</span>
            <span>Gift</span>
          </Link>
          <Link
            href="/gallery"
            className="text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text)] hover:text-[var(--color-accent)] transition-colors"
          >
            Gallery
          </Link>
          <Link
            href="/shop"
            className="text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text)] hover:text-[var(--color-accent)] transition-colors"
          >
            Shop
          </Link>
          <button
            onClick={toggleDark}
            aria-label="Toggle dark mode"
            className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] transition-colors"
          >
            {isDark ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            )}
          </button>
        </nav>
      </div>
    </header>
  );
}
