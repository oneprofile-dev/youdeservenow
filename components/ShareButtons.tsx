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
  const [tiktokStep, setTiktokStep] = useState<"idle" | "saving" | "done">("idle");

  // Append ?ref= so landing friends see a personalised teaser on the homepage
  const baseUrl = `${getSiteUrl()}/result/${result.id}`;
  const shareUrl = `${baseUrl}?ref=${result.id}`;
  const utmUrl = (source: string) =>
    `${baseUrl}?ref=${result.id}&utm_source=${source}&utm_medium=social&utm_campaign=share`;
  const shareText = result.gift
    ? `I used science to prove ${result.gift.recipientName} deserves ${result.product.name}. The evidence is overwhelming. 🔬 #YouDeserveNow`
    : `Science says I deserve ${result.product.name} after what I accomplished today. Get your scientific justification 👇 #YouDeserveNow`;

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
    const instagramCopyText = `${shareText} ${utmUrl("instagram")}`;
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

  async function shareToTiktok() {
    track("share_click", { method: "tiktok" });
    setTiktokStep("saving");

    // Step 1: download the card image so they have something to post
    if (shareCardRef?.current) {
      try {
        const { toPng } = await import("html-to-image");
        const dataUrl = await toPng(shareCardRef.current, { pixelRatio: 2, cacheBust: true });
        const link = document.createElement("a");
        link.download = `youdeservenow-${result.id}.png`;
        link.href = dataUrl;
        link.click();
      } catch {
        // still proceed to copy + open TikTok even if image download fails
      }
    }

    // Step 2: copy caption to clipboard
    const caption = `${shareText} ${utmUrl("tiktok")}`;
    try {
      await navigator.clipboard.writeText(caption);
    } catch {
      const input = document.createElement("input");
      input.value = caption;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
    }

    // Step 3: open TikTok upload
    setTiktokStep("done");
    setTimeout(() => {
      window.open("https://www.tiktok.com/upload", "_blank", "noopener,noreferrer");
    }, 300);

    setTimeout(() => setTiktokStep("idle"), 4000);
  }

  const xUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${shareText}\n\n${utmUrl("x")}`)}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(utmUrl("facebook"))}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${shareText}\n\n${utmUrl("whatsapp")}`)}`;

  return (
    <div className="flex flex-col items-center gap-3">
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
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track("share_click", { method: "whatsapp" })}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--color-card-border)] dark:border-[var(--color-dark-border)] text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-all"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          WhatsApp
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

      {/* TikTok — separate row, prominent */}
      <button
        onClick={shareToTiktok}
        disabled={tiktokStep === "saving"}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border-2 border-[#69C9D0] text-sm font-semibold text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text)] hover:bg-[#69C9D0]/10 transition-all disabled:opacity-60"
      >
        {/* TikTok logo */}
        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.73a4.85 4.85 0 0 1-1.01-.04z" />
        </svg>
        {tiktokStep === "saving"
          ? "Preparing..."
          : tiktokStep === "done"
          ? "Caption copied — paste it in TikTok!"
          : "Share on TikTok"}
      </button>

      {tiktokStep === "done" && (
        <p className="text-xs text-[var(--color-text-tertiary)] dark:text-[var(--color-dark-text)] text-center max-w-xs animate-[fade-in_0.3s_ease-out]">
          Image saved + caption copied. In TikTok: tap <strong>+</strong> → upload the image → paste caption.
        </p>
      )}
    </div>
  );
}
