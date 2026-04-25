/**
 * Result Share Buttons Component
 * Provides download and social sharing functionality for prescription cards
 * Supports: Download (3 sizes), TikTok, Instagram, Twitter/X, Facebook, copy link
 */

'use client';

import { useState } from 'react';

interface ResultShareButtonsProps {
  resultId: string;
  productName: string;
  userInput: string;
  justification: string;
}

export default function ResultShareButtons({
  resultId,
  productName,
  userInput,
  justification,
}: ResultShareButtonsProps) {
  const [downloading, setDownloading] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const siteUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const resultUrl = `${siteUrl}/result/${resultId}`;

  const downloadImage = async (size: 'mobile' | 'square' | 'og') => {
    setDownloading(size);
    try {
      const imageUrl = `${siteUrl}/api/og-card?id=${resultId}&size=${size}`;
      const response = await fetch(imageUrl);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `youdeservenow-${resultId}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download image. Please try again.');
    } finally {
      setDownloading(null);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(resultUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const shareToSocial = (platform: 'twitter' | 'facebook' | 'linkedin') => {
    const text = `🧪 Science says I deserve ${productName}\n\n"${userInput}"\n\n`;
    const encodedUrl = encodeURIComponent(resultUrl);
    const encodedText = encodeURIComponent(text);

    const urls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}&hashtags=YouDeserveNow`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    };

    const url = urls[platform];
    window.open(url, '_blank', 'width=600,height=600');
  };

  const handleTikTok = () => {
    downloadImage('mobile').then(() => {
      alert(
        '✨ Downloaded your TikTok card!\n\n' +
        '1. Open TikTok\n' +
        '2. Create a new video\n' +
        '3. Share this link in your bio or caption\n\n' +
        'Or paste in your TikTok description: ' + resultUrl
      );
    });
  };

  const handleInstagram = () => {
    downloadImage('square');
  };

  return (
    <div className="space-y-4 rounded-xl border border-[var(--color-card-border)] dark:border-[var(--color-dark-border)] p-5 bg-[var(--color-bg-secondary)]/30 dark:bg-[var(--color-dark-surface)]/30">
      {/* Download Buttons (3 sizes) */}
      <div className="space-y-2">
        <p className="text-sm font-semibold text-[var(--color-text-primary)] dark:text-[var(--color-dark-text)]">
          Download Card
        </p>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => downloadImage('mobile')}
            disabled={downloading !== null}
            className="px-3 py-2 text-xs font-medium rounded-lg bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 transition-colors"
            title="Download for TikTok/Reels (1080×1920)"
          >
            {downloading === 'mobile' ? '⏳' : '📱'} Story
          </button>
          <button
            onClick={handleInstagram}
            disabled={downloading !== null}
            className="px-3 py-2 text-xs font-medium rounded-lg bg-pink-500 text-white hover:bg-pink-600 disabled:opacity-50 transition-colors"
            title="Download for Instagram Feed (1080×1080)"
          >
            {downloading === 'square' ? '⏳' : '📷'} Feed
          </button>
          <button
            onClick={() => downloadImage('og')}
            disabled={downloading !== null}
            className="px-3 py-2 text-xs font-medium rounded-lg bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50 transition-colors"
            title="Download for sharing (1200×630)"
          >
            {downloading === 'og' ? '⏳' : '🔗'} Share
          </button>
        </div>
      </div>

      {/* Social Sharing Buttons */}
      <div className="space-y-2">
        <p className="text-sm font-semibold text-[var(--color-text-primary)] dark:text-[var(--color-dark-text)]">
          Share to
        </p>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleTikTok}
            className="px-4 py-2 text-xs font-medium rounded-lg bg-gray-900 text-white hover:bg-black transition-colors"
          >
            🎵 TikTok
          </button>
          <button
            onClick={() => shareToSocial('twitter')}
            className="px-4 py-2 text-xs font-medium rounded-lg bg-black text-white hover:bg-gray-900 transition-colors"
          >
            𝕏 X/Twitter
          </button>
          <button
            onClick={() => shareToSocial('facebook')}
            className="px-4 py-2 text-xs font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            f Facebook
          </button>
          <button
            onClick={() => shareToSocial('linkedin')}
            className="px-4 py-2 text-xs font-medium rounded-lg bg-blue-700 text-white hover:bg-blue-800 transition-colors"
          >
            in LinkedIn
          </button>
        </div>
      </div>

      {/* Copy Link */}
      <div className="space-y-2">
        <p className="text-sm font-semibold text-[var(--color-text-primary)] dark:text-[var(--color-dark-text)]">
          Share Link
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            readOnly
            value={resultUrl}
            className="flex-1 px-3 py-2 text-xs bg-[var(--color-bg-primary)] dark:bg-[var(--color-dark-bg)] border border-[var(--color-card-border)] dark:border-[var(--color-dark-border)] rounded-lg text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text)] font-mono"
          />
          <button
            onClick={copyToClipboard}
            className={`px-4 py-2 text-xs font-medium rounded-lg transition-colors ${
              copied
                ? 'bg-green-600 text-white'
                : 'bg-[var(--color-card-border)] dark:bg-[var(--color-dark-border)] text-[var(--color-text-primary)] dark:text-[var(--color-dark-text)] hover:bg-[var(--color-accent)]'
            }`}
          >
            {copied ? '✓ Copied' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Trust Signal */}
      <p className="text-xs text-[var(--color-text-tertiary)] dark:text-[var(--color-dark-text)]/60 text-center pt-2 border-t border-[var(--color-card-border)] dark:border-[var(--color-dark-border)]">
        Share your prescription. Let others get their scientific justification too. 🧪
      </p>
    </div>
  );
}
