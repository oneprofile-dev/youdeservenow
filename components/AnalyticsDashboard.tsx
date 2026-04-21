"use client";

import { useEffect, useState } from "react";
import { AnalyticsSnapshot } from "@/lib/analytics";
import { useNumberAnimation } from "@/lib/useNumberAnimation";

interface MetricCardProps {
  label: string;
  value: number | string;
  unit?: string;
  trend?: "up" | "down" | "neutral";
  format?: "number" | "percent" | "currency" | "time";
}

function MetricCard({ label, value, unit, trend, format }: MetricCardProps) {
  let displayValue = value;

  if (format === "currency" && typeof value === "number") {
    displayValue = `$${value.toFixed(2)}`;
  } else if (format === "percent" && typeof value === "number") {
    displayValue = `${value.toFixed(1)}%`;
  } else if (format === "time" && typeof value === "number") {
    displayValue = `${value}s`;
  }

  const trendColor = {
    up: "text-green-500",
    down: "text-red-500",
    neutral: "text-gray-500",
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:border-blue-400 transition-colors">
      <p className="text-gray-600 text-sm font-medium mb-2">{label}</p>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-3xl font-bold text-gray-900">{displayValue}</p>
          {unit && <p className="text-xs text-gray-500 mt-1">{unit}</p>}
        </div>
        {trend && (
          <span className={`text-xl ${trendColor[trend]}`}>
            {trend === "up" ? "↑" : trend === "down" ? "↓" : "→"}
          </span>
        )}
      </div>
    </div>
  );
}

export function AnalyticsDashboard() {
  const [snapshot, setSnapshot] = useState<AnalyticsSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/analytics");
        if (!res.ok) throw new Error("Failed to fetch analytics");

        const data = await res.json();
        setSnapshot(data.metrics);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 60000); // Refresh every minute

    return () => clearInterval(interval);
  }, []);

  if (loading && !snapshot) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-pulse">
        {Array(12)
          .fill(0)
          .map((_, i) => (
            <div
              key={i}
              className="bg-gray-200 rounded-lg h-32"
            />
          ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-red-800">
        Error loading analytics: {error}
      </div>
    );
  }

  if (!snapshot) return null;

  const { engagement, conversion, revenue, performance } = snapshot;

  return (
    <div className="space-y-8">
      {/* Engagement Metrics */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Engagement</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricCard
            label="Daily Active Users"
            value={engagement.dailyActiveUsers}
            trend="up"
          />
          <MetricCard
            label="Weekly Active Users"
            value={engagement.weeklyActiveUsers}
            trend="up"
          />
          <MetricCard
            label="Monthly Active Users"
            value={engagement.monthlyActiveUsers}
            trend="up"
          />
          <MetricCard
            label="Avg Session Duration"
            value={engagement.avgSessionDuration}
            unit="seconds"
            format="time"
          />
          <MetricCard
            label="Bounce Rate"
            value={engagement.bounceRate}
            format="percent"
            trend="down"
          />
          <MetricCard
            label="Returning Users"
            value={engagement.returningUserRate}
            format="percent"
            trend="up"
          />
        </div>
      </section>

      {/* Conversion Metrics */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Conversions</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <MetricCard
            label="Total Sessions"
            value={conversion.totalSessions}
          />
          <MetricCard
            label="Leaderboards Completed"
            value={conversion.completedLeaderboards}
            trend="up"
          />
          <MetricCard
            label="Purchases Completed"
            value={conversion.purchasesCompleted}
            trend="up"
          />
          <MetricCard
            label="Conversion Rate"
            value={conversion.conversionRate}
            format="percent"
            trend="up"
          />
          <MetricCard
            label="Avg Order Value"
            value={conversion.avgOrderValue}
            format="currency"
            trend="neutral"
          />
        </div>
      </section>

      {/* Revenue Metrics */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Revenue</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <MetricCard
            label="Total Revenue"
            value={revenue.totalRevenue}
            format="currency"
            trend="up"
          />
          <MetricCard
            label="Affiliate Revenue"
            value={revenue.affiliateRevenue}
            format="currency"
            trend="up"
          />
          <MetricCard
            label="Direct Revenue"
            value={revenue.directRevenue}
            format="currency"
            trend="neutral"
          />
          <MetricCard
            label="Revenue Per User"
            value={revenue.revenuePerUser}
            format="currency"
            trend="up"
          />
          <MetricCard
            label="Top Affiliate"
            value={revenue.topAffiliateTag}
          />
          <MetricCard
            label="Top Affiliate Revenue"
            value={revenue.topAffiliateRevenue}
            format="currency"
          />
        </div>
      </section>

      {/* Performance Metrics */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Performance</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <MetricCard
            label="Avg Page Load"
            value={performance.avgPageLoadTime}
            format="time"
            trend="down"
          />
          <MetricCard
            label="First Contentful Paint"
            value={performance.avgFCP}
            unit="ms"
            trend="down"
          />
          <MetricCard
            label="Largest Contentful Paint"
            value={performance.avgLCP}
            unit="ms"
            trend="down"
          />
          <MetricCard
            label="Cumulative Layout Shift"
            value={performance.avgCLS}
            trend="down"
          />
          <MetricCard
            label="Core Web Vitals Score"
            value={performance.coreWebVitalsScore}
            format="percent"
            trend="up"
          />
        </div>
      </section>

      {/* Last Updated */}
      <div className="text-center text-sm text-gray-500">
        Last updated: {new Date(snapshot.timestamp).toLocaleTimeString()}
      </div>
    </div>
  );
}
