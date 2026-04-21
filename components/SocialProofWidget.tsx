"use client";

import { useEffect, useState } from "react";

interface SocialProof {
  todayNewUsers: number;
  todayShares: number;
  thisWeekConversions: number;
  viralCoefficient: number;
}

export function SocialProofWidget() {
  const [proof, setProof] = useState<SocialProof | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProof = async () => {
      try {
        const res = await fetch("/api/social-proof");
        if (res.ok) {
          const data = await res.json();
          setProof(data);
        }
      } catch (error) {
        console.error("Failed to fetch social proof:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProof();
    const interval = setInterval(fetchProof, 120000); // Refresh every 2 minutes

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="bg-gray-100 rounded-lg p-4 animate-pulse h-24" />
    );
  }

  if (!proof) return null;

  return (
    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-6 border border-blue-200 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">
        🌟 Join the Community
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <p className="text-2xl font-bold text-blue-600">
            {proof.todayNewUsers.toLocaleString()}
          </p>
          <p className="text-xs text-gray-600 mt-1">people today</p>
        </div>

        <div>
          <p className="text-2xl font-bold text-purple-600">
            {proof.todayShares.toLocaleString()}
          </p>
          <p className="text-xs text-gray-600 mt-1">shares</p>
        </div>

        <div>
          <p className="text-2xl font-bold text-green-600">
            {proof.thisWeekConversions.toLocaleString()}
          </p>
          <p className="text-xs text-gray-600 mt-1">purchases</p>
        </div>

        <div>
          <p className="text-2xl font-bold text-pink-600">
            {proof.viralCoefficient.toFixed(2)}x
          </p>
          <p className="text-xs text-gray-600 mt-1">viral growth</p>
        </div>
      </div>

      <p className="text-xs text-gray-600 mt-4 italic">
        ✓ Real-time metrics • Updated every 2 minutes
      </p>
    </div>
  );
}
