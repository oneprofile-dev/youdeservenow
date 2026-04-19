"use client";

import { useState } from "react";
import { track } from "@vercel/analytics/react";
import type { Result } from "@/lib/db";

interface CertificateDownloadProps {
  result: Result;
}

export default function CertificateDownload({ result }: CertificateDownloadProps) {
  const [loading, setLoading] = useState(false);

  async function downloadCertificate() {
    track("certificate_download", { product_id: result.product.id });
    setLoading(true);

    try {
      const { jsPDF } = await import("jspdf");

      const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
      const W = 297;
      const H = 210;

      // Cream background
      doc.setFillColor(251, 248, 243);
      doc.rect(0, 0, W, H, "F");

      // Gold border (outer)
      doc.setDrawColor(200, 150, 62);
      doc.setLineWidth(2);
      doc.rect(8, 8, W - 16, H - 16);

      // Gold border (inner)
      doc.setLineWidth(0.5);
      doc.rect(12, 12, W - 24, H - 24);

      // Header label
      doc.setFontSize(9);
      doc.setTextColor(200, 150, 62);
      doc.setFont("helvetica", "bold");
      const label = "THE INSTITUTE OF PEER-REVIEWED SELF-REWARD SCIENCE";
      doc.text(label, W / 2, 28, { align: "center" });

      // Decorative line
      doc.setDrawColor(200, 150, 62);
      doc.setLineWidth(0.3);
      doc.line(40, 32, W - 40, 32);

      // Title
      doc.setFontSize(32);
      doc.setTextColor(26, 24, 20);
      doc.setFont("times", "italic");
      doc.text("Certificate of Scientific Achievement", W / 2, 55, { align: "center" });

      // Subtitle
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(107, 101, 96);
      doc.text("This certifies that the bearer has, beyond all reasonable doubt, earned the following reward:", W / 2, 68, { align: "center" });

      // Accomplishment
      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(26, 24, 20);
      const inputLines = doc.splitTextToSize(`"${result.input}"`, W - 80);
      doc.text(inputLines, W / 2, 82, { align: "center" });

      // Prescribed reward
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(200, 150, 62);
      doc.text("PRESCRIBED REWARD", W / 2, 105, { align: "center" });

      doc.setFontSize(18);
      doc.setFont("times", "bold");
      doc.setTextColor(26, 24, 20);
      doc.text(result.product.name, W / 2, 116, { align: "center" });

      // Justification snippet
      doc.setFontSize(9);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(107, 101, 96);
      const snippet = result.justification.slice(0, 200) + (result.justification.length > 200 ? "…" : "");
      const justLines = doc.splitTextToSize(snippet, W - 100);
      doc.text(justLines, W / 2, 130, { align: "center" });

      // Decorative line before footer
      doc.setDrawColor(200, 150, 62);
      doc.setLineWidth(0.3);
      doc.line(40, 163, W - 40, 163);

      // Signature lines
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(107, 101, 96);
      doc.text("Dr. You Deserve It", 75, 175, { align: "center" });
      doc.text("Director, Institute of Self-Reward Science", 75, 180, { align: "center" });

      doc.text(new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }), W / 2, 175, { align: "center" });
      doc.text("Date of Issuance", W / 2, 180, { align: "center" });

      doc.text("YouDeserveNow.com", W - 75, 175, { align: "center" });
      doc.text("Reference: " + result.id, W - 75, 180, { align: "center" });

      // Footer
      doc.setFontSize(7);
      doc.setTextColor(156, 149, 144);
      doc.text("Backed by absolutely no real science. For entertainment purposes only.", W / 2, 195, { align: "center" });

      doc.save(`YouDeserveNow-Certificate-${result.id}.pdf`);
    } catch (err) {
      console.error("Certificate generation failed:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={downloadCertificate}
      disabled={loading}
      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--color-accent)] text-sm font-semibold text-[var(--color-accent)] hover:bg-[var(--color-accent)] hover:text-white dark:hover:text-[var(--color-dark-bg)] transition-all disabled:opacity-50 active:scale-95"
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="12" y1="18" x2="12" y2="12"/>
        <line x1="9" y1="15" x2="15" y2="15"/>
      </svg>
      {loading ? "Generating..." : "Download Certificate"}
    </button>
  );
}
