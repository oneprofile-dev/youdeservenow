"use client";

/**
 * SmartLink Component
 * Automatically detects dead links and serves replacements without delay
 * Uses client-side cache + server fallbacks for instant UX
 */

import React, { useEffect, useState } from "react";
import { useLinkHealth, useLinkReplacement } from "@/lib/useLink";

interface SmartLinkProps {
  href: string;
  children: React.ReactNode;
  fallbackHref?: string;
  asin?: string;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  title?: string;
  rel?: string;
  target?: string;
  showStatus?: boolean; // Show visual indicator of link status
}

/**
 * Smart Link: Automatically handles dead links with instant fallback
 * - Uses client-side cache for instant decisions
 * - Falls back to replacement link if primary is dead
 * - Prefetches link status in background
 * - No user-facing delay
 */
export default function SmartLink({
  href,
  children,
  fallbackHref,
  asin,
  className = "",
  onClick,
  title,
  rel = "noopener noreferrer",
  target = "_blank",
  showStatus = false,
}: SmartLinkProps) {
  const { urlToUse, status, isDead } = useLinkHealth(href, {
    replacementUrl: fallbackHref,
  });

  const { replacement } = useLinkReplacement(asin || "");

  // Determine final URL to use
  const finalUrl = replacement?.url || urlToUse || href;

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // If we detected dead link but didn't have fallback, warn user
    if (isDead && !fallbackHref && !replacement?.url) {
      const confirmed = window.confirm(
        "This product link appears to be unavailable. Continue anyway?"
      );
      if (!confirmed) {
        e.preventDefault();
        return;
      }
    }

    if (onClick) {
      onClick(e);
    }
  };

  return (
    <a
      href={finalUrl}
      className={`${className} ${isDead && !fallbackHref ? "opacity-60" : ""}`}
      onClick={handleClick}
      title={title}
      rel={rel}
      target={target}
      data-link-status={showStatus ? status : undefined}
    >
      {children}
      {showStatus && status !== "unknown" && (
        <span
          className={`ml-1 inline-block w-2 h-2 rounded-full ${
            status === "alive" ? "bg-green-500" : "bg-red-500"
          }`}
          title={`Link is ${status}`}
          aria-label={`Link is ${status}`}
        />
      )}
    </a>
  );
}

/**
 * SmartLinkButton: For button-style links
 */
export function SmartLinkButton({
  href,
  children,
  fallbackHref,
  asin,
  className = "",
  variant = "primary",
  size = "md",
  ...props
}: SmartLinkProps & {
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
}) {
  const { urlToUse, isDead } = useLinkHealth(href, {
    replacementUrl: fallbackHref,
  });

  const { replacement } = useLinkReplacement(asin || "");
  const finalUrl = replacement?.url || urlToUse || href;

  const baseStyles = "inline-flex items-center justify-center font-medium transition-colors";
  const sizeStyles = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };
  const variantStyles = {
    primary: "bg-[var(--color-accent)] text-white hover:opacity-90",
    secondary: "bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)]",
    outline: "border border-[var(--color-card-border)] text-[var(--color-text-primary)] hover:bg-[var(--color-bg-secondary)]",
  };

  return (
    <a
      href={finalUrl}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className} ${
        isDead && !fallbackHref ? "opacity-50 pointer-events-none" : ""
      }`}
      {...props}
    >
      {children}
    </a>
  );
}
