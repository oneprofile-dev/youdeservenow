"use client";

import { useEffect, useState } from "react";

/**
 * Smooth number counting animation hook
 * Animates from current value to target value over specified duration
 */
export function useNumberAnimation(
  targetValue: number,
  duration: number = 1000,
  decimals: number = 0
) {
  const [currentValue, setCurrentValue] = useState(targetValue);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (currentValue === targetValue) return;

    setIsAnimating(true);
    const startValue = currentValue;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function for smooth animation
      const easeOut = 1 - Math.pow(1 - progress, 3);

      const newValue = startValue + (targetValue - startValue) * easeOut;
      setCurrentValue(newValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCurrentValue(targetValue);
        setIsAnimating(false);
      }
    };

    requestAnimationFrame(animate);
  }, [targetValue, duration, currentValue]);

  const displayValue = decimals === 0 ? Math.round(currentValue) : currentValue.toFixed(decimals);

  return { value: displayValue, isAnimating };
}