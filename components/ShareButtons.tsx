"use client";

import { useState } from "react";
import { track } from "@vercel/analytics/react";
import type { Result } from "@/lib/db";
import { getSiteUrl } from "@/lib/utils";

interface ShareButtonsProps {
  result: Result;
  shareCardRef?: React.RefObject<HTMLDivElement | null>;
}

export default function ShareButtons({ result, shareCardRef }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // Append ?ref= so landing friends see a personalised teaser on the homepage
  const shareUrl = `${getSiteUrl()}/result/${result.id}?ref=${result.id}`;
  const shareText = `Science says I deserve ${result.product.name} after what I accomplished today. Get your scientific justification 👇 #YouDeserveNow`;

  async function copyLink() {
    track("share_click", { method: "copy" });
    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch {
      const input = document.createElement("input");
      input.value = shareUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function copyForInstagram() {
    track("share_click", { method: "instagram" });
    const instagramCopyText = `${shareText} ${shareUrl}`;
    try {
      await navigator.clipboard.writeText(instagramCopyText);
    } catch {
      const input = document.createElement("input");
      input.value = instagramCopyText;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function downloadImage() {
    if (!shareCardRef?.current) return;
    track("share_click", { method: "download" });
    setDownloading(true);
    try {
      const { toPng } = await import("html-to-image");
      const dataUrl = await toPng(shareCardRef.current, {
        pixelRatio: 2,
        cacheBust: true,
      });
      const link = document.createElement("a");
      link.download = `youdeservenow-${result.id}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Download failed:", err);
    } finally {
      setDownloading(false);
    }
  }

  const xUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;

  return (
    <div className="flex flex-wrap gap-2 justify-center">
      <a
        href={xUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => track("share_click", { method: "x" })}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--color-card-border)] dark:border-[var(--color-dark-border)] text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-all"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.259 5.63 5.905-5.63Zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
        Share on X
      </a>

      <a
        href={facebookUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => track("share_click", { method: "facebook" })}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--color-card-border)] dark:border-[var(--color-dark-border)] text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-all"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
        Share on Facebook
      </a>

      <button
        onClick={copyForInstagram}
        title="Copy link + text to paste in Instagram"
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--color-card-border)] dark:border-[var(--color-dark-border)] text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-all"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
        </svg>
        Instagram
      </button>

      <button
        onClick={copyLink}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--color-card-border)] dark:border-[var(--color-dark-border)] text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-all"
      >
        {copied ? (
          <>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Copied!
          </>
        ) : (
          <>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
            Copy Link
          </>
        )}
      </button>

      {shareCardRef && (
        <button
          onClick={downloadImage}
          disabled={downloading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--color-card-border)] dark:border-[var(--color-dark-border)] text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-all disabled:opacity-50"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          {downloading ? "Saving..." : "Download Image"}
        </button>
      )}
    </div>
  );
}
