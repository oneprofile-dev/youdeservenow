import { useEffect, useState, useCallback } from "react";

export interface MetricUpdate {
  type: "connected" | "metric-update" | "error";
  resultId?: string;
  metrics?: {
    likes: number;
    shares: number;
    affiliate_clicks: number;
  };
  qualityScore?: number;
  rank?: number;
  timestamp?: string;
  message?: string;
}

export interface UseMetricsStreamOptions {
  resultId: string;
  category?: string;
  enabled?: boolean;
  onUpdate?: (data: MetricUpdate) => void;
}

/**
 * Hook for real-time metric updates via Server-Sent Events
 *
 * @example
 * const { metrics, rank, isConnected } = useMetricsStream({ resultId: "abc123" });
 */
export function useMetricsStream({
  resultId,
  category,
  enabled = true,
  onUpdate,
}: UseMetricsStreamOptions) {
  const [metrics, setMetrics] = useState<{
    likes: number;
    shares: number;
    affiliate_clicks: number;
  } | null>(null);
  const [qualityScore, setQualityScore] = useState<number>(0);
  const [rank, setRank] = useState<number | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpdate = useCallback(
    (data: MetricUpdate) => {
      if (data.type === "connected") {
        setIsConnected(true);
        setError(null);
      } else if (data.type === "metric-update") {
        if (data.metrics) setMetrics(data.metrics);
        if (typeof data.qualityScore === "number") setQualityScore(data.qualityScore);
        if (typeof data.rank === "number") setRank(data.rank);
      } else if (data.type === "error") {
        setError(data.message || "Connection error");
        setIsConnected(false);
      }

      onUpdate?.(data);
    },
    [onUpdate]
  );

  useEffect(() => {
    if (!enabled) return;

    const params = new URLSearchParams({ resultId });
    if (category) params.append("category", category);

    const eventSource = new EventSource(`/api/metrics-stream?${params}`);

    eventSource.addEventListener("message", (event) => {
      try {
        const data = JSON.parse(event.data) as MetricUpdate;
        handleUpdate(data);
      } catch (err) {
        console.error("[useMetricsStream] Parse error:", err);
      }
    });

    eventSource.addEventListener("error", () => {
      setError("Stream connection lost");
      setIsConnected(false);
      eventSource.close();
    });

    return () => {
      eventSource.close();
    };
  }, [resultId, category, enabled, handleUpdate]);

  return {
    metrics,
    qualityScore,
    rank,
    isConnected,
    error,
  };
}
