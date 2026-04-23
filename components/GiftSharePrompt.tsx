"use client";

import Link from "next/link";
import { track } from "@vercel/analytics/react";

interface GiftSharePromptProps {
  recipientName?: string;
}

export default function GiftSharePrompt({ recipientName }: GiftSharePromptProps) {
  const handleGiftClick = () => {
    track("gift_share_prompt_clicked", { has_recipient: !!recipientName });
  };

  const handleStreakClick = () => {
    track("streak_return_prompt_clicked");
  };

  return (
    <div className="rounded-2xl border-2 border-[#ff6b6b]/30 bg-[#ff6b6b]/5 dark:bg-[#ff6b6b]/10 p-6 sm:p-8 text-center animate-[fade-in_0.6s_ease-out] space-y-4">
      <p className="text-3xl" aria-hidden="true">💌</p>
      <div>
        <h3
          className="text-2xl font-semibold text-[var(--color-text-primary)] dark:text-[var(--color-dark-text)] mb-2"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Share the reward.
        </h3>
        <p className="text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text)] max-w-lg mx-auto leading-relaxed">
          {recipientName
            ? `${recipientName} deserved this. But someone else might deserve their own diagnosis too.`
            : "This diagnosis is yours. But someone else deserves their own science-backed justification."}
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center sm:items-center pt-2">
        <Link
          href="/gift"
          onClick={handleGiftClick}
          aria-label="Go to gift a diagnosis page"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#ff6b6b] text-white font-semibold text-sm hover:bg-[#ff5252] hover:scale-105 active:scale-95 transition-all"
        >
          <span aria-hidden="true">💌</span> Gift another diagnosis
        </Link>
        <div className="text-[var(--color-text-tertiary)] dark:text-[var(--color-dark-text)] text-xs">
          or{" "}
          <a
            href="#institute-diagnosis"
            onClick={handleStreakClick}
            aria-label="Scroll back to create another diagnosis for yourself"
            className="underline underline-offset-2 hover:text-[var(--color-accent)] transition-colors font-medium"
          >
            get another for yourself
          </a>
        </div>
      </div>

      <div className="text-[10px] text-[var(--color-text-tertiary)] dark:text-[var(--color-dark-text)] pt-2">
        Every share keeps the ritual going.
      </div>
    </div>
  );
}
