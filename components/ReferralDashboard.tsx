"use client";

import { useEffect, useState } from "react";
import { showToast } from "@/components/ToastContainer";

interface ReferralStats {
  totalLinks: number;
  totalClicks: number;
  totalConversions: number;
  totalRevenue: number;
  conversionRate: number;
}

export function ReferralDashboard({ userId }: { userId: string }) {
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [referralUrl, setReferralUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchStats();
  }, [userId]);

  const fetchStats = async () => {
    try {
      const res = await fetch(`/api/referrals?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Failed to fetch referral stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateLink = async () => {
    setGenerating(true);
    try {
      const res = await fetch("/api/referrals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (res.ok) {
        const data = await res.json();
        setReferralUrl(data.referralUrl);
        showToast("Referral link created!", "success");
        fetchStats();
      }
    } catch (error) {
      showToast("Failed to generate link", "error");
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralUrl);
    showToast("Link copied to clipboard!", "success");
  };

  if (loading) {
    return <div className="bg-gray-200 animate-pulse h-64 rounded-lg" />;
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-xs text-gray-600 mb-1">Referral Links</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalLinks}</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-xs text-gray-600 mb-1">Total Clicks</p>
            <p className="text-2xl font-bold text-blue-600">{stats.totalClicks}</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-xs text-gray-600 mb-1">Conversions</p>
            <p className="text-2xl font-bold text-green-600">
              {stats.totalConversions}
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-xs text-gray-600 mb-1">Conv. Rate</p>
            <p className="text-2xl font-bold text-purple-600">
              {stats.conversionRate.toFixed(1)}%
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-xs text-gray-600 mb-1">Revenue</p>
            <p className="text-2xl font-bold text-pink-600">
              ${stats.totalRevenue.toFixed(2)}
            </p>
          </div>
        </div>
      )}

      {/* Generate Link Section */}
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-6 border border-blue-200">
        <h3 className="font-bold text-gray-900 mb-4">Generate Referral Link</h3>

        {referralUrl ? (
          <div>
            <p className="text-sm text-gray-600 mb-2">Your referral link:</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={referralUrl}
                readOnly
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm"
              />
              <button
                onClick={copyToClipboard}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                Copy
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={handleGenerateLink}
            disabled={generating}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {generating ? "Generating..." : "Generate New Link"}
          </button>
        )}
      </div>

      {/* Share Instructions */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h4 className="font-semibold text-gray-900 mb-3">How to share:</h4>
        <div className="space-y-2 text-sm text-gray-600">
          <p>✓ Share your link on social media</p>
          <p>✓ Earn a commission for every purchase</p>
          <p>✓ Get bonus points for referral conversions</p>
          <p>✓ Unlock exclusive rewards at higher tiers</p>
        </div>
      </div>
    </div>
  );
}
