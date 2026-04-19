"use client";

import { useState } from "react";
import { track } from "@vercel/analytics/react";

interface ShopNotifyProps {
  itemId: string;
  itemName: string;
}

export default function ShopNotify({ itemId, itemName }: ShopNotifyProps) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || status !== "idle") return;
    track("shop_notify", { item_id: itemId });
    setStatus("loading");
    await fetch("/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    }).catch(() => {});
    setStatus("done");
    setTimeout(() => setOpen(false), 2000);
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="px-5 py-2.5 rounded-xl border border-[var(--color-accent)] text-sm font-semibold text-[var(--color-accent)] hover:bg-[var(--color-accent)] hover:text-white dark:hover:text-[var(--color-dark-bg)] transition-all active:scale-95"
      >
        Notify Me
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="flex gap-2 animate-[fade-in_0.2s_ease-out]">
      {status === "done" ? (
        <span className="text-sm font-semibold text-[var(--color-accent)]">You&apos;re on the list!</span>
      ) : (
        <>
          <input
            autoFocus
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            className="w-36 px-3 py-2 rounded-lg border border-[var(--color-card-border)] dark:border-[var(--color-dark-border)] bg-[var(--color-card-bg)] dark:bg-[var(--color-dark-surface)] text-xs text-[var(--color-text-primary)] dark:text-[var(--color-dark-text)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:border-[var(--color-accent)] transition-colors"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="px-3 py-2 rounded-lg bg-[var(--color-accent)] text-white text-xs font-semibold hover:opacity-90 disabled:opacity-50 transition-all"
          >
            {status === "loading" ? "…" : "Go"}
          </button>
        </>
      )}
    </form>
  );
}
