"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
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

interface TeamMember {
  teamId: string;
  userId: string;
  displayName: string;
  joinedAt: string;
}

interface TeamWin {
  id: string;
  description: string;
  category: string;
  createdAt: string;
  shares: number;
}

interface NominationFormData {
  nominerName: string;
  nomineeDisplay: string;
  reason: string;
}

const CATEGORY_EMOJIS: Record<string, string> = {
  shipped: "🚀",
  survived: "💪",
  collaboration: "🤝",
  recovery: "🌱",
  learning: "📚",
  heroics: "⚡",
};

export default function TeamPage() {
  const params = useParams();
  const teamId = typeof params.id === 'string' ? params.id : params.id?.[0] || "";
  const [team, setTeam] = useState<Team | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [wins, setWins] = useState<TeamWin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [nominationOpen, setNominationOpen] = useState(false);
  const [nominationForm, setNominationForm] = useState<NominationFormData>({
    nominerName: "",
    nomineeDisplay: "",
    reason: "",
  });

  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        const res = await fetch(`/api/teams/${teamId}`);
        const data = await res.json();

        if (data.success) {
          setTeam(data.team);
          setMembers(data.members);
          setWins(data.wins);
          track("team_viewed", { teamId, teamName: data.team.name });
        }
      } catch (error) {
        console.error("Failed to fetch team:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeamData();
  }, [teamId]);

  const handleNominate = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch(`/api/teams/${teamId}/nominate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nomineeId: nominationForm.nomineeDisplay,
          nominerName: nominationForm.nominerName,
          reason: nominationForm.reason,
        }),
      });

      const data = await res.json();
      if (data.success) {
        track("peer_nominated", {
          teamId,
          reason: nominationForm.reason.substring(0, 50),
        });
        setNominationForm({ nominerName: "", nomineeDisplay: "", reason: "" });
        setNominationOpen(false);
      }
    } catch (error) {
      console.error("Failed to create nomination:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-[var(--color-bg-primary)] dark:bg-[var(--color-dark-bg)]">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin">
            <div className="w-12 h-12 border-4 border-[var(--color-bg-secondary)] dark:border-[var(--color-dark-border)] border-t-[var(--color-accent)] rounded-full" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!team) {
    return (
      <div className="min-h-screen flex flex-col bg-[var(--color-bg-primary)] dark:bg-[var(--color-dark-bg)]">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center px-4">
          <p className="text-2xl font-bold text-[var(--color-text-primary)] dark:text-[var(--color-dark-text)] mb-4">
            Team not found
          </p>
          <Link href="/teams" className="text-[var(--color-accent)] hover:underline">
            ← Back to teams
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-bg-primary)] dark:bg-[var(--color-dark-bg)]">
      <Header />
      <PageViewTracker event="team_detail_viewed" props={{ teamId }} />

      <main className="flex-1 py-12 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link href="/teams" className="text-[var(--color-accent)] hover:underline text-sm mb-4 inline-block">
              ← Back to teams
            </Link>
            <h1 className="text-5xl font-bold text-[var(--color-text-primary)] dark:text-[var(--color-dark-text)] mb-2">
              {team.name}
            </h1>
            <p className="text-lg text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text)]">
              {team.description}
            </p>
          </div>

          {/* Team Info */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="p-4 rounded-xl bg-[var(--color-bg-secondary)] dark:bg-[var(--color-dark-surface)]">
              <p className="text-3xl font-bold text-[var(--color-accent)] mb-1">
                {members.length}
              </p>
              <p className="text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text)]">
                Members
              </p>
            </div>
            <div className="p-4 rounded-xl bg-[var(--color-bg-secondary)] dark:bg-[var(--color-dark-surface)]">
              <p className="text-3xl font-bold text-[var(--color-accent)] mb-1">
                {wins.length}
              </p>
              <p className="text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text)]">
                Wins
              </p>
            </div>
            <div className="p-4 rounded-xl bg-[var(--color-bg-secondary)] dark:bg-[var(--color-dark-surface)]">
              <p className="text-3xl font-bold text-[var(--color-accent)] mb-1">
                {team.industry}
              </p>
              <p className="text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text)]">
                Industry
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mb-12">
            <button
              onClick={() => setNominationOpen(true)}
              className="flex-1 px-6 py-3 rounded-xl bg-[var(--color-accent)] text-white font-semibold hover:opacity-90 transition-all"
            >
              🎉 Nominate a Teammate
            </button>
            <button
              onClick={() =>
                track("team_shared", { teamId, teamName: team.name })
              }
              className="flex-1 px-6 py-3 rounded-xl border-2 border-[var(--color-accent)] text-[var(--color-accent)] font-semibold hover:bg-[var(--color-accent)] hover:text-white transition-all"
            >
              📤 Share Team
            </button>
          </div>

          {/* Nomination Modal */}
          {nominationOpen && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
              <div className="bg-[var(--color-bg-secondary)] dark:bg-[var(--color-dark-surface)] rounded-xl p-6 max-w-md w-full">
                <h2 className="text-2xl font-bold text-[var(--color-text-primary)] dark:text-[var(--color-dark-text)] mb-4">
                  🎉 Nominate a Teammate
                </h2>
                <form onSubmit={handleNominate} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text-primary)] dark:text-[var(--color-dark-text)] mb-1">
                      Your name
                    </label>
                    <input
                      type="text"
                      value={nominationForm.nominerName}
                      onChange={(e) =>
                        setNominationForm({
                          ...nominationForm,
                          nominerName: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg bg-[var(--color-bg-primary)] dark:bg-[var(--color-dark-bg)] border border-[var(--color-card-border)] dark:border-[var(--color-dark-border)]"
                      placeholder="Your name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text-primary)] dark:text-[var(--color-dark-text)] mb-1">
                      Teammate to nominate
                    </label>
                    <select
                      value={nominationForm.nomineeDisplay}
                      onChange={(e) =>
                        setNominationForm({
                          ...nominationForm,
                          nomineeDisplay: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg bg-[var(--color-bg-primary)] dark:bg-[var(--color-dark-bg)] border border-[var(--color-card-border)] dark:border-[var(--color-dark-border)]"
                      required
                    >
                      <option value="">Select a teammate</option>
                      {members.map((member) => (
                        <option key={member.userId} value={member.userId}>
                          {member.displayName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text-primary)] dark:text-[var(--color-dark-text)] mb-1">
                      What did they deserve?
                    </label>
                    <textarea
                      value={nominationForm.reason}
                      onChange={(e) =>
                        setNominationForm({
                          ...nominationForm,
                          reason: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg bg-[var(--color-bg-primary)] dark:bg-[var(--color-dark-bg)] border border-[var(--color-card-border)] dark:border-[var(--color-dark-border)]"
                      placeholder="Tell their story..."
                      rows={4}
                      required
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setNominationOpen(false)}
                      className="flex-1 px-4 py-2 rounded-lg bg-[var(--color-bg-primary)] dark:bg-[var(--color-dark-bg)] text-[var(--color-text-primary)] dark:text-[var(--color-dark-text)]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 rounded-lg bg-[var(--color-accent)] text-white font-semibold hover:opacity-90"
                    >
                      Send Nomination
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Members */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-[var(--color-text-primary)] dark:text-[var(--color-dark-text)] mb-4">
              👥 Team Members ({members.length})
            </h2>
            {members.length === 0 ? (
              <p className="text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text)]">
                No members yet
              </p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {members.map((member) => (
                  <div
                    key={member.userId}
                    className="p-4 rounded-lg bg-[var(--color-bg-secondary)] dark:bg-[var(--color-dark-surface)] border border-[var(--color-card-border)] dark:border-[var(--color-dark-border)]"
                  >
                    <p className="font-semibold text-[var(--color-text-primary)] dark:text-[var(--color-dark-text)]">
                      {member.displayName}
                    </p>
                    <p className="text-xs text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text)]">
                      Joined{" "}
                      {new Date(member.joinedAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Wins */}
          <div>
            <h2 className="text-2xl font-bold text-[var(--color-text-primary)] dark:text-[var(--color-dark-text)] mb-4">
              🏆 Team Wins ({wins.length})
            </h2>
            {wins.length === 0 ? (
              <p className="text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text)]">
                No wins recorded yet. Time to celebrate something!
              </p>
            ) : (
              <div className="space-y-4">
                {wins.map((win) => (
                  <div
                    key={win.id}
                    className="p-4 rounded-lg bg-[var(--color-bg-secondary)] dark:bg-[var(--color-dark-surface)] border border-[var(--color-card-border)] dark:border-[var(--color-dark-border)]"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-2xl">
                        {CATEGORY_EMOJIS[win.category] || "✨"}
                      </span>
                      <span className="text-xs text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text)]">
                        {new Date(win.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-[var(--color-text-primary)] dark:text-[var(--color-dark-text)]">
                      {win.description}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
