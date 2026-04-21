import { AnalyticsDashboard } from "@/components/AnalyticsDashboard";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Analytics Dashboard - YouDeserveNow",
  description: "Real-time analytics and engagement metrics",
};

export default function AnalyticsPage() {
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
