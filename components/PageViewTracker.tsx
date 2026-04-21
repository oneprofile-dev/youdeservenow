"use client";

import { useEffect } from "react";
import { track } from "@vercel/analytics/react";

declare global {
  interface Window {
    gtag?: (action: string, event: string, props?: Record<string, string | number>) => void;
  }
}

interface PageViewTrackerProps {
  event: string;
  props?: Record<string, string | number>;
}

export default function PageViewTracker({ event, props }: PageViewTrackerProps) {
  useEffect(() => {
    track(event, props);
    if (typeof window !== "undefined" && typeof window.gtag === "function") {
      window.gtag("event", event, props);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
