"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useLanguage } from "@/lib/useLanguage";
import { LANG_NAMES, SUPPORTED_LANGS } from "@/lib/i18n";

export default function Header() {
  const [isDark, setIsDark] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { lang, setLang } = useLanguage();

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
        <Link href="/" className="group flex items-center gap-2 flex-shrink-0">
          <span
            className="text-xl tracking-tight text-[var(--color-text-primary)] dark:text-[var(--color-dark-text)] font-semibold"
            style={{ fontFamily: "var(--font-display)" }}
          >
            YouDeserveNow
          </span>
        </Link>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-expanded={mobileMenuOpen}
          aria-label="Toggle menu"
          className="sm:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] hover:bg-[var(--color-bg-secondary)] dark:hover:bg-[var(--color-dark-surface)] transition-colors"
        >
          {mobileMenuOpen ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="4" y1="6" x2="20" y2="6"/>
              <line x1="4" y1="12" x2="20" y2="12"/>
              <line x1="4" y1="18" x2="20" y2="18"/>
            </svg>
          )}
        </button>

        {/* Desktop nav */}
        <nav className="hidden sm:flex items-center gap-3 sm:gap-6">
          <Link
            href="/gift"
            className="text-sm font-medium text-[#ff6b6b] hover:text-[#ff5252] transition-colors flex items-center gap-1 min-h-11 px-2"
          >
            <span>💌</span>
            <span>Gift</span>
          </Link>
          <Link
            href="/gallery"
            className="text-sm font-medium text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text)] hover:text-[var(--color-accent)] transition-colors min-h-11 px-2 flex items-center"
          >
            Gallery
          </Link>
          <Link
            href="/shop"
            className="text-sm font-medium text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text)] hover:text-[var(--color-accent)] transition-colors min-h-11 px-2 flex items-center"
          >
            Shop
          </Link>
          {/* Language selector */}
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value as typeof lang)}
            aria-label="Language"
            className="text-xs text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text)] bg-transparent border border-[var(--color-card-border)] dark:border-[var(--color-dark-border)] rounded-lg px-2 py-1 min-h-11 cursor-pointer hover:border-[var(--color-accent)] transition-colors focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
          >
            {SUPPORTED_LANGS.map((l) => (
              <option key={l} value={l} className="bg-[var(--color-bg-primary)] dark:bg-[var(--color-dark-bg)] text-[var(--color-text-primary)] dark:text-[var(--color-dark-text)]">
                {LANG_NAMES[l]}
              </option>
            ))}
          </select>

          <button
            onClick={toggleDark}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            className="w-10 h-10 rounded-full flex items-center justify-center text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] hover:bg-[var(--color-bg-secondary)] dark:hover:bg-[var(--color-dark-surface)] transition-colors"
          >
            {isDark ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            )}
          </button>
        </nav>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-[var(--color-card-border)] dark:border-[var(--color-dark-border)] bg-[var(--color-bg-primary)] dark:bg-[var(--color-dark-bg)] animate-[slide-down_0.2s_ease-out]">
          <nav className="px-4 py-4 space-y-1 flex flex-col">
            <Link
              href="/gift"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-[#ff6b6b] hover:text-[#ff5252] hover:bg-[var(--color-bg-secondary)] dark:hover:bg-[var(--color-dark-surface)] transition-colors px-3 py-3 rounded-lg flex items-center gap-2"
            >
              <span>💌</span>
              <span>Gift</span>
            </Link>
            <Link
              href="/gallery"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text)] hover:text-[var(--color-accent)] hover:bg-[var(--color-bg-secondary)] dark:hover:bg-[var(--color-dark-surface)] transition-colors px-3 py-3 rounded-lg"
            >
              Gallery
            </Link>
            <Link
              href="/shop"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text)] hover:text-[var(--color-accent)] hover:bg-[var(--color-bg-secondary)] dark:hover:bg-[var(--color-dark-surface)] transition-colors px-3 py-3 rounded-lg"
            >
              Shop
            </Link>
            <div className="border-t border-[var(--color-card-border)] dark:border-[var(--color-dark-border)] my-2" />
            <div className="flex items-center gap-2 px-3 py-3">
              <label htmlFor="mobile-lang" className="text-xs font-medium text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text)] flex-shrink-0">
                Language:
              </label>
              <select
                id="mobile-lang"
                value={lang}
                onChange={(e) => {
                  setLang(e.target.value as typeof lang);
                  setMobileMenuOpen(false);
                }}
                className="text-xs text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text)] bg-[var(--color-card-bg)] dark:bg-[var(--color-dark-surface)] border border-[var(--color-card-border)] dark:border-[var(--color-dark-border)] rounded px-2 py-1 cursor-pointer flex-1"
              >
                {SUPPORTED_LANGS.map((l) => (
                  <option key={l} value={l}>
                    {LANG_NAMES[l]}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={() => {
                toggleDark();
                setMobileMenuOpen(false);
              }}
              aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
              className="text-sm font-medium text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text)] hover:text-[var(--color-accent)] hover:bg-[var(--color-bg-secondary)] dark:hover:bg-[var(--color-dark-surface)] transition-colors px-3 py-3 rounded-lg flex items-center gap-2"
            >
              {isDark ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                  </svg>
                  <span>Light Mode</span>
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                  </svg>
                  <span>Dark Mode</span>
                </>
              )}
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
