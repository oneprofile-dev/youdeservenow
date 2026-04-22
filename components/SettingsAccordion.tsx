"use client";

import { useState, useEffect } from "react";
import VoiceToggle from "./VoiceToggle";
import type { HeroAudience } from "@/lib/hero-audience-copy";
import { getAudienceCopy } from "@/lib/hero-audience-copy";
import type { PromptVoice } from "@/lib/prompt";

interface SettingsAccordionProps {
  audience: HeroAudience;
  onAudienceChange: (audience: HeroAudience) => void;
  recipientName: string;
  onRecipientNameChange: (name: string) => void;
  voice: PromptVoice;
  onVoiceChange: (voice: PromptVoice) => void;
  audienceCopy: ReturnType<typeof getAudienceCopy>;
}

export default function SettingsAccordion({
  audience,
  onAudienceChange,
  recipientName,
  onRecipientNameChange,
  voice,
  onVoiceChange,
  audienceCopy,
}: SettingsAccordionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);

  // Detect if desktop on mount
  useEffect(() => {
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 640);
    checkDesktop();
    window.addEventListener("resize", checkDesktop);
    return () => window.removeEventListener("resize", checkDesktop);
  }, []);

  // Auto-open on desktop
  useEffect(() => {
    setIsOpen(isDesktop);
  }, [isDesktop]);

  // Get current selections for compact view
  const audienceLabel = {
    self: audienceCopy.justMe,
    loved_one: audienceCopy.lovedOne,
    we: audienceCopy.bothOfUs,
  }[audience];

  const voiceLabel = voice === "warm" ? "Plain & warm" : "Institute style";

  return (
    <div className="rounded-2xl border border-[var(--color-card-border)] dark:border-[var(--color-dark-border)] bg-[var(--color-card-bg)] dark:bg-[var(--color-dark-surface)] overflow-hidden">
      {/* Accordion Header - Always visible */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-[var(--color-bg-secondary)] dark:hover:bg-[var(--color-dark-border)] transition-colors"
        aria-expanded={isOpen}
        aria-controls="settings-content"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">⚙️</span>
          {!isOpen && (
            <span className="text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text)]">
              <span className="font-medium text-[var(--color-text-primary)] dark:text-[var(--color-dark-text)]">
                {audienceLabel}
              </span>
              <span className="mx-1.5 text-[var(--color-text-tertiary)]">•</span>
              <span>{voiceLabel}</span>
            </span>
          )}
          {isOpen && (
            <span className="text-sm font-medium text-[var(--color-text-primary)] dark:text-[var(--color-dark-text)]">
              Customize
            </span>
          )}
        </div>

        {/* Chevron Icon */}
        <svg
          className={`w-5 h-5 text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text)] transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      </button>

      {/* Accordion Content */}
      <div
        id="settings-content"
        className={`overflow-hidden transition-all duration-200 border-t border-[var(--color-card-border)] dark:border-[var(--color-dark-border)] ${
          isOpen ? "max-h-96" : "max-h-0"
        }`}
      >
        <div className="px-4 py-4 space-y-4">
          {/* Audience Selector */}
          <div>
            <p className="text-xs uppercase tracking-widest text-[var(--color-accent)] font-semibold mb-1">
              {audienceCopy.label}
            </p>
            <p className="text-xs text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text)] mb-3">
              {audienceCopy.hint}
            </p>
            <div
              role="radiogroup"
              aria-label={audienceCopy.ariaGroup}
              className="grid grid-cols-1 sm:grid-cols-3 gap-2"
            >
              {(
                [
                  { id: "self" as const, label: audienceCopy.justMe },
                  { id: "loved_one" as const, label: audienceCopy.lovedOne },
                  { id: "we" as const, label: audienceCopy.bothOfUs },
                ]
              ).map(({ id, label }) => (
                <button
                  key={id}
                  type="button"
                  role="radio"
                  aria-checked={audience === id}
                  onClick={() => {
                    onAudienceChange(id);
                    if (id !== "loved_one") onRecipientNameChange("");
                  }}
                  className={`rounded-xl px-3 py-3 text-sm font-semibold transition-colors border-2 text-center ${
                    audience === id
                      ? "border-[var(--color-accent)] bg-[var(--color-accent)]/10 text-[var(--color-text-primary)] dark:text-[var(--color-dark-text)]"
                      : "border-[var(--color-card-border)] dark:border-[var(--color-dark-border)] text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text)] hover:border-[var(--color-accent)]/50"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Recipient Name Field */}
          {audience === "loved_one" && (
            <div>
              <label
                htmlFor="ydn-recipient-name"
                className="block text-xs font-medium text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text)] mb-1.5"
              >
                {audienceCopy.theirName}
              </label>
              <input
                id="ydn-recipient-name"
                type="text"
                autoComplete="given-name"
                maxLength={50}
                value={recipientName}
                onChange={(e) => onRecipientNameChange(e.target.value)}
                placeholder={audienceCopy.theirNamePlaceholder}
                className="w-full px-4 py-3 rounded-xl border-2 border-[var(--color-card-border)] dark:border-[var(--color-dark-border)] bg-[var(--color-bg-primary)] dark:bg-[var(--color-dark-bg)] text-[var(--color-text-primary)] dark:text-[var(--color-dark-text)] text-base focus:outline-none focus:border-[var(--color-accent)] transition-colors"
              />
            </div>
          )}

          {/* Voice Toggle */}
          <VoiceToggle value={voice} onChange={onVoiceChange} />
        </div>
      </div>
    </div>
  );
}
