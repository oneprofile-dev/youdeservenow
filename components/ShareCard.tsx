"use client";

import { forwardRef } from "react";
import Image from "next/image";
import type { Result } from "@/lib/db";

interface ShareCardProps {
  result: Result;
}

const ShareCard = forwardRef<HTMLDivElement, ShareCardProps>(function ShareCard(
  { result },
  ref
) {
  return (
    <div
      ref={ref}
      style={{
        width: "540px",
        minHeight: "680px",
        background: "#FBF8F3",
        padding: "48px",
        display: "flex",
        flexDirection: "column",
        gap: "24px",
        fontFamily: "Plus Jakarta Sans Variable, Plus Jakarta Sans, sans-serif",
        borderRadius: "16px",
        position: "relative",
      }}
    >
      {/* Logo */}
      <div
        style={{
          fontSize: "14px",
          color: "#9C9590",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          fontWeight: 600,
        }}
      >
        YouDeserveNow.com
      </div>

      {/* Divider */}
      <div style={{ height: "1px", background: "#E8E0D6" }} />

      {/* Achievement */}
      <div>
        <p style={{ fontSize: "11px", color: "#C8963E", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px", fontWeight: 600 }}>
          Achievement Logged
        </p>
        <p style={{ fontSize: "18px", color: "#1A1814", lineHeight: 1.5, fontFamily: "Instrument Serif, serif" }}>
          &ldquo;{result.input}&rdquo;
        </p>
      </div>

      {/* Divider */}
      <div style={{ height: "1px", background: "#E8E0D6" }} />

      {/* Justification */}
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: "11px", color: "#C8963E", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "12px", fontWeight: 600 }}>
          Scientific Verdict
        </p>
        <p style={{ fontSize: "16px", color: "#1A1814", lineHeight: 1.65, fontFamily: "Instrument Serif, serif" }}>
          {result.justification}
        </p>
      </div>

      {/* Product */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
          padding: "16px",
          background: "#F3EDE4",
          borderRadius: "12px",
        }}
      >
        <div style={{ position: "relative", width: "64px", height: "64px", borderRadius: "8px", overflow: "hidden", background: "#fff", flexShrink: 0 }}>
          <Image
            src={result.product.imageUrl}
            alt={result.product.name}
            fill
            className="object-cover"
            sizes="64px"
          />
        </div>
        <div>
          <p style={{ fontSize: "11px", color: "#9C9590", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Prescribed Reward
          </p>
          <p style={{ fontSize: "15px", color: "#1A1814", fontWeight: 600, lineHeight: 1.3 }}>
            {result.product.name}
          </p>
          <p style={{ fontSize: "14px", color: "#C8963E", marginTop: "2px", fontWeight: 600 }}>
            {result.product.price}
          </p>
        </div>
      </div>

      {/* Footer */}
      <div style={{ height: "1px", background: "#E8E0D6" }} />
      <p style={{ fontSize: "12px", color: "#9C9590", textAlign: "center" }}>
        youdeservenow.com · Get your scientific justification
      </p>
    </div>
  );
});

export default ShareCard;
