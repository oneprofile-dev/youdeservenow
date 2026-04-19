"use client";

import { useState, useEffect } from "react";
import { track } from "@vercel/analytics/react";

interface LikeButtonProps {
  resultId: string;
}

const LS_KEY = (id: string) => `ydn_liked_${id}`;

export default function LikeButton({ resultId }: LikeButtonProps) {
  const [count, setCount] = useState<number | null>(null);
  const [liked, setLiked] = useState(false);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    // Check localStorage for prior like
    try {
      setLiked(!!localStorage.getItem(LS_KEY(resultId)));
    } catch {}

    // Fetch current count
    fetch(`/api/like?id=${resultId}`)
      .then((r) => r.json())
      .then((d) => setCount(d.count ?? 0))
      .catch(() => setCount(0));
  }, [resultId]);

  async function handleLike() {
    if (liked) return;

    // Optimistic update
    setLiked(true);
    setCount((c) => (c ?? 0) + 1);
    setAnimating(true);
    setTimeout(() => setAnimating(false), 600);

    try {
      localStorage.setItem(LS_KEY(resultId), "1");
    } catch {}

    track("result_like", { result_id: resultId });

    try {
      const res = await fetch("/api/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: resultId }),
      });
      const data = await res.json();
      if (typeof data.count === "number") setCount(data.count);
    } catch {
      // optimistic count stands
    }
  }

  return (
    <button
      onClick={handleLike}
      disabled={liked}
      aria-label={liked ? "You liked this" : "Like this result"}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-all
        ${liked
          ? "border-[var(--color-accent)] text-[var(--color-accent)] bg-[var(--color-accent)]/8 cursor-default"
          : "border-[var(--color-card-border)] dark:border-[var(--color-dark-border)] text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] cursor-pointer"
        }`}
    >
      <span
        className={`text-base transition-transform ${animating ? "scale-150" : "scale-100"}`}
        style={{ display: "inline-block" }}
      >
        {liked ? "👍" : "👍"}
      </span>
      <span>
        {liked ? "Liked" : "Like"}
        {count !== null && count > 0 && (
          <span className="ml-1.5 opacity-60 font-normal tabular-nums">{count.toLocaleString()}</span>
        )}
      </span>
    </button>
  );
}
