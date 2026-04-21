"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// Lazy load AnalyticsDashboard - heavy component with charts
const AnalyticsDashboard = dynamic(() => import("@/components/AnalyticsDashboard").then((m) => ({ default: m.AnalyticsDashboard })), {
  loading: () => <div className="h-[600px] bg-gray-100 rounded-lg animate-pulse" />,
  ssr: false,
});

export default function AnalyticsPage() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const secret = params.get("secret");
    const adminSecret = process.env.NEXT_PUBLIC_ANALYTICS_SECRET;

    if (!adminSecret || secret !== adminSecret) {
      setIsLoading(false);
      router.push("/not-found");
      return;
    }

    setIsAuthorized(true);
    setIsLoading(false);
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Analytics Dashboard
            </h1>
            <p className="text-lg text-gray-600">
              Real-time metrics and performance insights
            </p>
          </div>

          <AnalyticsDashboard />
        </div>
      </main>
      <Footer />
    </>
  );
}
