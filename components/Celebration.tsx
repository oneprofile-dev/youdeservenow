"use client";

import { useEffect } from "react";
import confetti from "canvas-confetti";

interface CelebrationProps {
  trigger?: boolean;
  particleCount?: number;
  duration?: number;
}

/**
 * Triggers confetti celebration animation
 */
export function Celebration({ trigger = true, particleCount = 50, duration = 3000 }: CelebrationProps) {
  useEffect(() => {
    if (!trigger) return;

    // Confetti from center
    confetti({
      particleCount,
      spread: 70,
      origin: { y: 0.6 },
    });

    // Optional: second burst from sides
    setTimeout(() => {
      confetti({
        particleCount: Math.floor(particleCount / 2),
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.5 },
      });

      confetti({
        particleCount: Math.floor(particleCount / 2),
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.5 },
      });
    }, 200);
  }, [trigger, particleCount]);

  return null; // This component doesn't render anything
}