"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageViewTracker from "@/components/PageViewTracker";
import { track } from "@vercel/analytics/react";

interface Team {
  id: string;
  name: string;
  industry: string;
  description: string;
  memberCount: number;
  createdAt: string;
}

const INDUSTRY_EMOJIS: Record<string, string> = {
  tech: "💻",
  sales: "📈",
  marketing: "📣",
  "non-profit": "🤝",
  "open-source": "🌐",
  design: "🎨",
  product: "🚀",
  operations: "⚙️",
  hr: "👥",
  finance: "💰",
  education: "📚",
  healthcare: "🏥",
};

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIndustry, setSelectedIndustry] = useState("all");

  const perPage = 12;

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const res = await fetch(`/api/teams?page=${page}&perPage=${perPage}`);
        const data = await res.json();

        if (data.success) {
          setTeams(data.teams);
          setTotal(data.total);
          track("teams_page_viewed", { page });
        }
      } catch (error) {
        console.error("Failed to fetch teams:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeams();
  }, [page]);

  const filteredTeams = selectedIndustry === "all" 
    ? teams 
    : teams.filter(t => t.industry === selectedIndustry);

  const industries = Array.from(
    new Set([
      "all",
      ...teams.map(t => t.industry),
    ])
  );

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-bg-primary)] dark:bg-[var(--color-dark-bg)]">
      <Header />
      <PageViewTracker event="teams_gallery_view" />

      <main className="flex-1 py-12 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          {/* Hero */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-[var(--color-text-primary)] dark:text-[var(--color-dark-text)] mb-4">
              🏆 Team Deserves
            </h1>
            <p className="text-xl text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text)] max-w-2xl mx-auto mb-8">
              Teams across industries celebrating wins, supporting each other, and prescribing exactly what they deserve.
            </p>
            <Link
              href="/teams/create"
              className="inline-flex px-6 py-3 rounded-xl bg-[var(--color-accent)] text-white font-semibold hover:opacity-90 transition-all"
            >
              + Create Your Team
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-12">
            <div className="text-center p-4 rounded-xl bg-[var(--color-bg-secondary)] dark:bg-[var(--color-dark-surface)]">
              <p className="text-3xl font-bold text-[var(--color-accent)]">{total}</p>
              <p className="text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text)]">Teams</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-[var(--color-bg-secondary)] dark:bg-[var(--color-dark-surface)]">
              <p className="text-3xl font-bold">✨</p>
              <p className="text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text)]">Growing Daily</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-[var(--color-bg-secondary)] dark:bg-[var(--color-dark-surface)]">
              <p className="text-3xl font-bold">🌍</p>
              <p className="text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text)]">All Industries</p>
            </div>
          </div>

          {/* Industry Filter */}
          <div className="mb-8">
            <p className="text-sm font-semibold text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text)] mb-3">
              Browse by industry:
            </p>
            <div className="flex flex-wrap gap-2">
              {industries.map(industry => (
                <button
                  key={industry}
                  onClick={() => setSelectedIndustry(industry)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedIndustry === industry
                      ? "bg-[var(--color-accent)] text-white"
                      : "bg-[var(--color-bg-secondary)] dark:bg-[var(--color-dark-surface)] text-[var(--color-text-primary)] dark:text-[var(--color-dark-text)] hover:opacity-80"
                  }`}
                >
                  {INDUSTRY_EMOJIS[industry] || "🏢"} {industry.charAt(0).toUpperCase() + industry.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Teams Grid */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin">
                <div className="w-12 h-12 border-4 border-[var(--color-bg-secondary)] dark:border-[var(--color-dark-border)] border-t-[var(--color-accent)] rounded-full" />
              </div>
            </div>
          ) : filteredTeams.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text)] mb-4">
                No teams found in {selectedIndustry}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {filteredTeams.map(team => (
                <Link
                  key={team.id}
                  href={`/team/${team.id}`}
                  className="group p-6 rounded-xl bg-[var(--color-bg-secondary)] dark:bg-[var(--color-dark-surface)] border border-[var(--color-card-border)] dark:border-[var(--color-dark-border)] hover:border-[var(--color-accent)] transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-3xl">{INDUSTRY_EMOJIS[team.industry] || "🏢"}</span>
                    <span className="text-xs bg-[var(--color-accent)] text-white px-2 py-1 rounded-full">
                      {team.industry}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-[var(--color-text-primary)] dark:text-[var(--color-dark-text)] mb-2 group-hover:text-[var(--color-accent)] transition-colors">
                    {team.name}
                  </h3>
                  <p className="text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text)] line-clamp-2 mb-4">
                    {team.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text)]">
                      👥 {team.memberCount} members
                    </span>
                    <span className="text-[var(--color-accent)] group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Pagination */}
          {!isLoading && total > perPage && (
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                className="px-4 py-2 rounded-lg bg-[var(--color-bg-secondary)] dark:bg-[var(--color-dark-surface)] disabled:opacity-50"
              >
                ← Previous
              </button>
              <span className="text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text)] py-2">
                Page {page + 1} of {Math.ceil(total / perPage)}
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={(page + 1) * perPage >= total}
                className="px-4 py-2 rounded-lg bg-[var(--color-bg-secondary)] dark:bg-[var(--color-dark-surface)] disabled:opacity-50"
              >
                Next →
              </button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
